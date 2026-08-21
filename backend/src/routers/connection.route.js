import { Router } from "express"
import { getConnections, removeTrustedContact } from "../controllers/connection.controller.js"
import { requireAuth } from "../middleware/requireAuth.js"

const router = Router()

router.get("/api/connections", requireAuth, getConnections)
router.delete("/api/trust/:id", requireAuth, removeTrustedContact)

export default router