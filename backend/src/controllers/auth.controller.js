import { Webhook } from "svix"
import { env } from "../utils/env.js"
import { clerkClient } from "../utils/clerk.js"
import User from "../models/user.models.js"
import { upsertUserByClerkId, ensurePinCode } from "../utils/userSync.js"

const webhook = env.CLERK_WEBHOOK_SECRET ? new Webhook(env.CLERK_WEBHOOK_SECRET) : null

const buildPayload = (data) => {
  const webhookEmails = Array.isArray(data.email_addresses) ? data.email_addresses : []
  const clientEmails = Array.isArray(data.emailAddresses) ? data.emailAddresses : []

  const primaryEmail =
    webhookEmails.find((e) => e.id === data.primary_email_address_id)?.email_address ||
    clientEmails.find((e) => e.id === data.primaryEmailAddressId)?.emailAddress ||
    webhookEmails[0]?.email_address ||
    clientEmails[0]?.emailAddress ||
    (typeof data.email === "string" ? data.email : "") ||
    `${data.id}@noemail.clerk`

  const toString = (e) => (typeof e === "string" ? e : e.email_address || e.emailAddress || "")

  return {
    clerkUserId: data.id,
    email: primaryEmail,
    firstName: data.first_name || data.firstName || "",
    lastName: data.last_name || data.lastName || "",
    username: data.username || "",
    imageUrl: data.image_url || data.imageUrl || "",
    emailAddresses: [...webhookEmails, ...clientEmails].map(toString).filter(Boolean),
  }
}

const upsertUser = async (data) => upsertUserByClerkId(data.id, buildPayload(data))

export const syncUser = async (req, res) => {
  try {
    const userId = req.auth?.sub || req.auth?.userId
    if (!userId) {
      return res.status(400).json({ message: "Invalid user ID in authentication token" })
    }

    const clerkUser = await clerkClient.users.getUser(userId)

    const user = await upsertUserByClerkId(clerkUser.id, buildPayload(clerkUser))

    return res.status(200).json({ user })
  } catch (error) {
    console.error("Error syncing user to database:", error)
    return res.status(500).json({ message: "Internal server error" })
  }
}

const deleteUser = async (data) => {
  return User.findOneAndDelete({ clerkUserId: data.id })
}

export const clerkWebhook = async (req, res) => {
  try {
    if (!webhook) {
      console.error("Webhook failed: CLERK_WEBHOOK_SECRET is not configured")
      return res.status(500).json({ message: "CLERK_WEBHOOK_SECRET is not configured" })
    }

    const payload =
      req.body instanceof Buffer
        ? req.body.toString("utf8")
        : typeof req.body === "string"
        ? req.body
        : JSON.stringify(req.body)

    const headers = {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    }

    let event
    try {
      event = webhook.verify(payload, headers)
    } catch (verifyErr) {
      console.error("Webhook verification failed:", verifyErr.message)
      return res.status(400).json({ message: `Webhook verification failed: ${verifyErr.message}` })
    }

    const { type, data } = event
    console.log(`Received Clerk Webhook event: ${type} for user: ${data?.id}`)

    switch (type) {
      case "user.created":
      case "user.updated":
        await upsertUser(data)
        console.log(`Successfully synced user ${data?.id} to MongoDB via webhook`)
        break
      case "user.deleted":
        await deleteUser(data)
        console.log(`Successfully deleted user ${data?.id} from MongoDB via webhook`)
        break
      default:
        break
    }

    return res.status(200).json({ received: true, type })
  } catch (error) {
    console.error("Error processing Clerk webhook:", error)
    return res.status(500).json({ message: "Internal server error processing webhook" })
  }
}

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.auth?.sub || req.auth?.userId
    if (!userId) {
      return res.status(400).json({ message: "Invalid user ID in authentication token" })
    }

    let user = await User.findOne({ clerkUserId: userId })

    if (!user) {
      const clerkUser = await clerkClient.users.getUser(userId)
      user = await upsertUserByClerkId(clerkUser.id, buildPayload(clerkUser))
    } else {
      user = await ensurePinCode(user)
    }

    return res.status(200).json({ user })
  } catch (error) {
    console.error("Error fetching user:", error)
    return res.status(500).json({ message: "Internal server error" })
  }
}

