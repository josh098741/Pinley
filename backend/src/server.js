import express from "express"
import cors from "cors"
import http from "http"
import { Server } from "socket.io"
import { env } from "./utils/env.js"

import { connectDB } from "./database/db.js"
import authRouter from "./routers/auth.route.js"
import userRouter from "./routers/user.route.js"
import requestRouter from "./routers/request.route.js"
import connectionRouter from "./routers/connection.route.js"
import eventRouter from "./routers/event.route.js"
import uploadRouter from "./routers/upload.route.js"
import { authSocket, initRealtime, registerRealtimeEvents } from "./utils/realtime.js"

const app = express()

app.use(cors())
app.use(express.json())

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
app.use(userRouter)
app.use(requestRouter)
app.use(connectionRouter)
app.use(eventRouter)
app.use(uploadRouter)

app.get("/health", (req, res) => {
  res.send({ message: "server is healthy" })
})

const server = http.createServer(app)
const io = new Server(server, {
  cors: { origin: "*" },
})
initRealtime(io)
io.use(authSocket)
registerRealtimeEvents()

const start = async () => {
  try {
    await connectDB()
    server.listen(env.PORT, () => {
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

