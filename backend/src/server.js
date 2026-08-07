import express from "express"
import { env } from "./utils/env.js"

const app = express()


app.get("/health", (req,res) => {
    res.send({message: "server is healthy"})
})


const start = async () => {
    try{
        app.listen(env.PORT, () => {
            console.log(`Server is running on port ${env.PORT}`)
        })
    }catch(error){
        console.error("Error starting server:", error)
    }
}

start()