import { Router } from "express"
import { getConnections } from "../controllers/connection.controller.js"
import { requireAuth } from "../middleware/requireAuth.js"

const router = Router()

router.get("/api/connections", requireAuth, getConnections)

export default router