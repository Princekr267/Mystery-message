import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user.model";
import { Message } from "@/model/user.model";
import { MessageSchema } from "@/schemas/messageSchema";

export async function POST(request: Request){
    await dbConnect()

    const body = await request.json()
    if (typeof body?.username !== "string" || body.username.trim().length === 0) {
        return Response.json({
            success: false,
            message: "Username is required"
        }, {
            status: 400
        })
    }

    const parsed = MessageSchema.safeParse(body)
    if (!parsed.success) {
        return Response.json({
            success: false,
            message: parsed.error.issues[0]?.message || "Invalid message"
        }, {
            status: 400
        })
    }

    const {username} = body
    const {content} = parsed.data
    try{
        const escaped = username.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const regex = new RegExp(`^${escaped}$`, 'i')
        const user = await UserModel.findOne({
            $or: [
                { username: regex },
                { name: regex }
            ]
        })
        if(!user) {
            return Response.json({
                success: false,
                message: "User not found"
            },{
                status: 404
            })
        }
        if(user.isAcceptingMessage === false){
            return Response.json({
                success: false,
                message: "User is not accepting messages"
            },{
                status: 403
            })
        }

        const newMessage = {content, createdAt: new Date()}
        if(!user.message){
            user.message = []
        }
        user.message.push(newMessage as Message)
        await user.save()

        return Response.json({
            success: true,
            message: "message sent successfully"
        },{
            status: 200
        })
    } catch(err){
        console.log("Error adding messages: ", err)
        return Response.json({
                success: false,
                message: "Internal server error"
            },{
                status: 500
            })
    }
}
