import User from "../models/user.models.js"
import { generatePinCode } from "./pincode.js"

export const upsertUserByClerkId = async (clerkUserId, payload) => {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const user = await User.findOneAndUpdate(
        { clerkUserId },
        payload,
        { returnDocument: "after", upsert: true, setDefaultsOnInsert: true }
      )

      if (user && !user.pinCode) {
        user.pinCode = generatePinCode()
        await user.save()
      }

      return user
    } catch (error) {
      if (error?.code === 11000 && error?.keyValue?.pinCode) {
        continue
      }
      throw error
    }
  }
  throw new Error("Failed to assign a unique pin code after multiple attempts")
}
