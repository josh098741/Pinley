import express from "express"
import { env } from "./utils/env.js"

import { connectDB } from "./database/db.js"

const app = express()


app.get("/health", (req,res) => {
    res.send({message: "server is healthy"})
})


const start = async () => {
    try{
        await connectDB()
        app.listen(env.PORT, () => {
            console.log(`Server is running on port ${env.PORT}`)
        })
    }catch(error){
        console.error("Error starting server:", error)
    }
}

if (process.env.NODE_ENV !== "production") {
    start()
}

export default app