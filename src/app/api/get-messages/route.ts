import { auth } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user.model";

export async function POST(request: Request){
    await dbConnect()
    
        const session = await auth.api.getSession({
            headers: request.headers,
        })
    
        if(!session?.user){
            return Response.json({
                success: false,
                message: "Not Authenticated",
            }, {
                status: 401
            })
        }
    
        const userEmail = session.user.email;
        try {
            const user = await UserModel.findOne({ email: userEmail })
            if(!user){
                return Response.json({
                    success: false,
                    message: "User not found"
                }, {
                    status: 404
                })
            }
            
            const sortedMessages = (user.message || []).sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )

            return Response.json({
                success: true,
                messages: sortedMessages
            }, {
                status: 200
            })
        } catch (error){
            console.log("An unexpected error occured: ", error)
            return Response.json({
                success: false,
                message: "Internal server error"
            },{
                status: 500
            })
        }

}