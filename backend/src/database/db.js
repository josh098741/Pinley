import mongoose from "mongoose"

export const connectDB = async () => {
    try{
        const connection = await mongoose.connect(process.env.MONGODB_URI)
        console.log(`Mongo DB connected successfully: ${connection.connection.host}`)
    }catch(error){
        console.log("Error in connecting to the database", error.message)
        process.exit(1)
    }
}