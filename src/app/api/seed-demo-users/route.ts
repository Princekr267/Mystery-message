import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import { auth } from "@/lib/auth";
import UserModel from "@/model/user.model";

const demoUsers = [
    { username: "user1", email: "user1@gmail.com", password: "12345678" },
    { username: "test", email: "test@test.com", password: "asdfghjkl" },
];

export async function POST() {
    await dbConnect();

    for (const demoUser of demoUsers) {
        try {
            await auth.api.signUpEmail({
                body: {
                    email: demoUser.email,
                    password: demoUser.password,
                    name: demoUser.username,
                    username: demoUser.username,
                },
            });
        } catch (error) {
            const err = error as { body?: { code?: string } };
            if (
                err?.body?.code !== "USER_ALREADY_EXISTS" &&
                err?.body?.code !== "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL"
            ) {
                console.error("Failed to seed demo user:", demoUser.email, error);
                return Response.json(
                    { success: false, message: "Failed to create demo users" },
                    { status: 500 },
                );
            }
        }

        await mongoose.connection.db?.collection("user").updateOne(
            { email: demoUser.email },
            {
                $set: {
                    username: demoUser.username,
                    emailVerified: true,
                    isVerified: true,
                    isAcceptingMessage: true,
                },
                $setOnInsert: { message: [] },
            },
        );

        await UserModel.updateOne(
            { email: demoUser.email },
            {
                $set: {
                    username: demoUser.username,
                    isVerified: true,
                    isAcceptingMessage: true,
                },
                $setOnInsert: { message: [] },
            },
        );
    }

    return Response.json({ success: true });
}
