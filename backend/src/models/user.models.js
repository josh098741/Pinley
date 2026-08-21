import mongoose from "mongoose"
import { generatePinCode } from "../utils/pincode.js"

const userSchema = new mongoose.Schema(
  {
    clerkUserId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    pinCode: {
      type: String,
      unique: true,
      index: true,
      uppercase: true,
      default: () => generatePinCode(),
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    firstName: {
      type: String,
      default: "",
    },
    lastName: {
      type: String,
      default: "",
    },
    username: {
      type: String,
      default: "",
    },
    imageUrl: {
      type: String,
      default: "",
    },
    emailAddresses: {
      type: [String],
      default: [],
    },
    // Users this account explicitly trusts with their SOS alert + live location.
    trustedContacts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    lastKnownLocation: {
      latitude: { type: Number },
      longitude: { type: Number },
      accuracy: { type: Number },
      updatedAt: { type: Date },
    },
  },
  {
    timestamps: true,
  }
)

const User = mongoose.models.User || mongoose.model("User", userSchema)

export default User
