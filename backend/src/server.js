import express from "express"
import cors from "cors"
import { env } from "./utils/env.js"

import { connectDB } from "./database/db.js"
import authRouter from "./routers/auth.route.js"

const app = express()

app.use(cors())

app.use(async (req, res, next) => {
  try {
    await connectDB()
    next()
  } catch (error) {
    console.error("Database connection failure:", error)
    return res.status(500).json({ message: "Internal database connection error" })
  }
})

app.use(authRouter)

app.use(express.json())

app.get("/health", (req, res) => {
  res.send({ message: "server is healthy" })
})

const start = async () => {
  try {
    await connectDB()
    app.listen(env.PORT, () => {
      console.log(`Server is running on port ${env.PORT}`)
    })
  } catch (error) {
    console.error("Error starting server:", error)
  }
}

if (process.env.NODE_ENV !== "production") {
  start()
}

export default app

