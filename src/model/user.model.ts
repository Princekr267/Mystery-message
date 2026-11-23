import mongoose, {Schema, Document} from "mongoose";

export interface Message extends Document{
    content: string,
    createdAt: Date
}

const MessageSchema: Schema<Message> = new Schema({
    content: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    }
})

export interface User extends Document{
    username?: string;
    email: string;
    password?: string;
    verifyCode?: string;
    verifyCodeExpiry?: Date;
    isVerified: boolean;
    isAcceptingMessage: boolean;
    message: Message[];

}

const UserSchema: Schema<User> = new Schema({
    username: {
        type: String,
        required: false,
        unique: true,
        sparse: true
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        match: [/.+\@.+\..+/, 'Please use a valid email address']
    },
    password: {
        type: String,
        required: false
    },
    verifyCode: {
        type: String,
        required: false
    },
    verifyCodeExpiry: {
        type: Date, 
        required: false
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isAcceptingMessage: {
        type: Boolean,
        default: true
    },
    message: [MessageSchema]
}, { collection: "user" })

if (mongoose.models && mongoose.models.User) {
    delete mongoose.models.User;
}
const UserModel = mongoose.model<User>("User", UserSchema);

export default UserModel;