import { Router } from "express"
import { requireAuth } from "../middleware/requireAuth.js"
import { signUploadParams } from "../utils/cloudinary.js"

const router = Router()

/**
 * POST /api/upload/sign
 *
 * Returns a signed parameter set so the mobile client can upload an image
 * directly to Cloudinary without the file bytes passing through this server.
 *
 * Body (optional):
 *   { folder: string }  — defaults to "events"
 */
router.post("/api/upload/sign", requireAuth, (req, res) => {
  try {
    const folder = req.body?.folder || "events"
    const params = signUploadParams(folder)
    return res.status(200).json(params)
  } catch (error) {
    console.error("Error generating upload signature:", error)
    return res.status(500).json({ message: "Could not generate upload signature" })
  }
})

export default router
