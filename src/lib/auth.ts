import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

const client = new MongoClient(`${process.env.MONGODB_URI}`);
const db = client.db();

const getBaseURL = () => {
  if (process.env.NODE_ENV === "production") {
    if (process.env.BETTER_AUTH_URL && !process.env.BETTER_AUTH_URL.includes("localhost")) {
      return process.env.BETTER_AUTH_URL.replace(/\/$/, "");
    }
    if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
      return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
    }
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`;
    }
  }
  return process.env.BETTER_AUTH_URL?.replace(/\/$/, "") || "http://localhost:3000";
};

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    // Optional: if you don't provide a client, database transactions won't be enabled.
    
  }),
  user: {
    additionalFields: {
      username: { type: "string", required: false },
      isVerified: { type: "boolean", required: false },
      isAcceptingMessage: { type: "boolean", required: false },
      verifyCode: { type: "string", required: false },
      verifyCodeExpiry: { type: "date", required: false }
    }
  },
  baseURL: getBaseURL(), 
  trustedOrigins: async (request?: Request) => {
    const list = [
      "http://localhost:3000",
      ...(process.env.BETTER_AUTH_URL ? [process.env.BETTER_AUTH_URL.replace(/\/$/, "")] : []),
      ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
      ...(process.env.VERCEL_PROJECT_PRODUCTION_URL ? [`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`] : []),
      "https://*.vercel.app",
    ];
    if (request) {
      const origin = request.headers.get("origin");
      if (origin) list.push(origin);
      const referer = request.headers.get("referer");
      if (referer) {
        try {
          list.push(new URL(referer).origin);
        } catch {}
      }
    }
    return list;
  },
  socialProviders: {
        google: { 
            clientId: process.env.GOOGLE_CLIENT_ID as string, 
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, 
        }, 
    },
  emailAndPassword: { 
    enabled: true, 
  },
  account: {                        // ← add this block
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
      requireLocalEmailVerified: false
    }
  }
});