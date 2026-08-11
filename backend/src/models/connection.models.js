import mongoose from "mongoose"

const connectionSchema = new mongoose.Schema(
  {
    userA: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userB: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

connectionSchema.index({ userA: 1, userB: 1 }, { unique: true })

const Connection = mongoose.models.Connection || mongoose.model("Connection", connectionSchema)

export default Connection
