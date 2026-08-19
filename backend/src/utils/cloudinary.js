import { v2 as cloudinary } from "cloudinary"
import { env } from "./env.js"

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
})

/**
 * Generates the params the mobile client needs to upload directly to Cloudinary.
 * The signature keeps the API secret safely on the server.
 *
 * @param {string} folder - Cloudinary folder to place the upload in
 * @returns {{ signature, timestamp, apiKey, cloudName, folder }}
 */
export function signUploadParams(folder = "events") {
  const timestamp = Math.round(Date.now() / 1000)
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    env.CLOUDINARY_API_SECRET
  )
  return {
    signature,
    timestamp,
    apiKey: env.CLOUDINARY_API_KEY,
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    folder,
  }
}

export default cloudinary
