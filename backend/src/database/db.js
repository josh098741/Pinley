import mongoose from "mongoose"
import { env } from "../utils/env.js"

export const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return
  }
  try {
    const connection = await mongoose.connect(env.MONGODB_URI)
    console.log(`Mongo DB connected successfully: ${connection.connection.host}`)
  } catch (error) {
    console.error("Error in connecting to the database:", error.message)
    throw error
  }
}