import User from "../models/user.models.js"
import { generatePinCode } from "./pincode.js"

const MISSING_CODE = { $or: [{ pinCode: { $exists: false } }, { pinCode: null }, { pinCode: "" }] }

export const ensurePinCode = async (user) => {
  if (!user) return user
  if (user.pinCode) return user

  const filled = await User.findOneAndUpdate(
    { _id: user._id, ...MISSING_CODE },
    { $set: { pinCode: generatePinCode() } },
    { returnDocument: "after" }
  )

  if (filled) return filled
  return (await User.findById(user._id)) || user
}

export const upsertUserByClerkId = async (clerkUserId, payload) => {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const user = await User.findOneAndUpdate(
        { clerkUserId },
        payload,
        { returnDocument: "after", upsert: true, setDefaultsOnInsert: true }
      )

      return await ensurePinCode(user)
    } catch (error) {
      if (error?.code === 11000 && error?.keyValue?.pinCode) {
        continue
      }
      throw error
    }
  }
  throw new Error("Failed to assign a unique pin code after multiple attempts")
}
