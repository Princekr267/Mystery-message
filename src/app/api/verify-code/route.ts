import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user.model";
import mongoose from "mongoose";

export async function POST(request: Request){
    await dbConnect()
    try {
        const {username, code} = await request.json()
        console.log("Verify Email code", code);
        const decodedUsername = decodeURIComponent(username)
        const user =  await UserModel.findOne({
            username: decodedUsername
        })
        console.log(user);

        if(!user){
            return Response.json({
                success: false,
                message: "User not found"
            }, {
                status: 500
            })
        }

        const isCodeValid = user.verifyCode === code
        const isCodeNotExpired = user.verifyCodeExpiry ? new Date(user.verifyCodeExpiry) > new Date() : false

        if(isCodeValid && isCodeNotExpired){
            user.isVerified = true
            await user.save()

            await mongoose.connection.db?.collection("user").updateOne(
                { email: user.email },
                { $set: { emailVerified: true } }
            )

            return Response.json({
                success: true,
                message: "Account verified successfully"
            }, {
                status: 200
            })
        } else if(!isCodeNotExpired){
            return Response.json({
                success: false,
                message: "Verification code has expired, please signup again to get a new code"
            }, {
                status: 400
            })
        } else{
            return Response.json({
                success: false,
                message: "Incorrect Verification code"
            }, {
                status: 400
            })
        }

    } catch (error) {
        console.error("Error verifying user", error)
        return Response.json({
            success: false,
            message: "Error verifying user"
        }, {
            status: 500
        })
    }
}