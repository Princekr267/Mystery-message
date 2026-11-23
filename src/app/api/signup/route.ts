import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user.model"
import bcrypt from "bcrypt"
import { auth } from "@/lib/auth"

import { sendVerificationEmail } from "@/helpers/sendVerificationEmails";

export async function POST(request: Request){

    try{
        await dbConnect();
        const {username, email, password} = await request.json()
        console.log(username, password)
        let emailDeliveryFailed = false
        const existingUserVerifiedByUsername = await UserModel.findOne({
            username,
            isVerified: true
        })

        if(existingUserVerifiedByUsername) {
            return Response.json({
                success: false,
                message: "Username is already taken"
            }, {status: 400})
        }

        const existingUserByEmail = await UserModel.findOne({email})
        if (existingUserByEmail && existingUserByEmail.isVerified) {
            return Response.json({
                success: false,
                message: "User already exist with this email"
            }, {status: 400})
        }

        try {
            await auth.api.signUpEmail({
                body: {
                    email,
                    password,
                    name: username,
                    username,
                }
            })
        } catch(e) {
            const err = e as { body?: { code?: string } };
            console.log("Better Auth error:", JSON.stringify(err))
            if (err?.body?.code !== "USER_ALREADY_EXISTS" && err?.body?.code !== "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL") throw e
        }

        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString()
        const expiryDate = new Date(Date.now() + 3600000)

        const userDoc = await UserModel.findOne({ email })
        if (userDoc) {
            userDoc.username = username;
            userDoc.verifyCode = verifyCode;
            userDoc.verifyCodeExpiry = expiryDate;
            userDoc.isVerified = false;
            userDoc.isAcceptingMessage = true;
            if (!userDoc.message) {
                userDoc.message = [];
            }
            await userDoc.save()
        } else {
            throw new Error("User record could not be found after registration")
        }

        // send verrification email
        const emailResponse = await sendVerificationEmail(
            email,
            username,
            verifyCode
        )
        if(!emailResponse.success){
            emailDeliveryFailed = true
            console.error("Verification email failed", emailResponse.message)
        }

        return Response.json({
            success: true,
            message: emailDeliveryFailed
                ? "User registered successfully, but verification email could not be sent."
                : "User registered successfully. Please verify your email"
        }, {status: 201})

    } catch(err){
        console.error('Error registering user', err)
        return Response.json({
            success: false,
            message: "Error registering user"
        }, {
            status: 500
        })
    }
}
