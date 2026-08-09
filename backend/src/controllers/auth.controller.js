import { Webhook } from "svix"
import { env } from "../utils/env.js"
import User from "../models/user.models.js"

const webhook = env.CLERK_WEBHOOK_SECRET ? new Webhook(env.CLERK_WEBHOOK_SECRET) : null

const upsertUser = async (data) => {
  const primaryEmail =
    data.email_addresses?.find((e) => e.id === data.primary_email_address_id)?.email_address ??
    data.email_addresses?.[0]?.email_address ??
    ""

  const payload = {
    clerkUserId: data.id,
    email: primaryEmail,
    firstName: data.first_name || "",
    lastName: data.last_name || "",
    username: data.username || "",
    imageUrl: data.image_url || "",
    emailAddresses: (data.email_addresses || []).map((e) => e.email_address),
  }

  return User.findOneAndUpdate({ clerkUserId: data.id }, payload, {
    new: true,
    upsert: true,
    setDefaultsOnInsert: true,
  })
}

const deleteUser = async (data) => {
  return User.findOneAndDelete({ clerkUserId: data.id })
}

export const clerkWebhook = async (req, res) => {
  try {
    if (!webhook) {
      return res.status(500).json({ message: "CLERK_WEBHOOK_SECRET is not configured" })
    }

    const headers = {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    }

    const event = webhook.verify(req.body, headers)

    const { type, data } = event

    switch (type) {
      case "user.created":
      case "user.updated":
        await upsertUser(data)
        break
      case "user.deleted":
        await deleteUser(data)
        break
      default:
        break
    }

    return res.status(200).json({ received: true, type })
  } catch (error) {
    console.error("Webhook verification failed:", error.message)
    return res.status(400).json({ message: "Webhook verification failed" })
  }
}

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findOne({ clerkUserId: req.auth.sub })

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    return res.status(200).json({ user })
  } catch (error) {
    console.error("Error fetching user:", error)
    return res.status(500).json({ message: "Internal server error" })
  }
}
