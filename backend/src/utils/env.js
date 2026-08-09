import dotenv from "dotenv"
dotenv.config({ quiet: true })

export const env = {
    PORT: process.env.PORT || 5000,
    MONGODB_URI: process.env.MONGODB_URI
}