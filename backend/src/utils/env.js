import dotenv from "dotenv"
dotenv.config({ quiet: true })

export const env = {
    PORT: process.env.PORT || 5000,
    MONGODB_URI: process.env.MONGODB_URI,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    CLERK_PUBLISHABLE_KEY: process.env.CLERK_PUBLISHABLE_KEY,
    SERVER_URL: process.env.SERVER_URL,
    CLERK_WEBHOOK_ENDPOIINT: process.env.CLERK_WEBHOOK_ENDPOIINT,
    CLERK_WEBHOOK_SECRET: process.env.CLERK_WEBHOOK_SECRET
}