import { Webhook } from "svix"
import { env } from "../utils/env.js"
import { clerkClient } from "../utils/clerk.js"
import User from "../models/user.models.js"

const webhook = env.CLERK_WEBHOOK_SECRET ? new Webhook(env.CLERK_WEBHOOK_SECRET) : null

const upsertUser = async (data) => {
  const primaryEmail =
    data.email_addresses?.find((e) => e.id === data.primary_email_address_id)?.email_address ??
    data.email_addresses?.[0]?.email_address ??
    `${data.id}@noemail.clerk`

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

export const syncUser = async (req, res) => {
  try {
    const clerkUser = await clerkClient.users.getUser(req.auth.sub)

    const primaryEmail =
      clerkUser.emailAddresses?.find((e) => e.id === clerkUser.primaryEmailAddressId)?.emailAddress ??
      clerkUser.emailAddresses?.[0]?.emailAddress ??
      `${clerkUser.id}@noemail.clerk`

    const payload = {
      clerkUserId: clerkUser.id,
      email: primaryEmail,
      firstName: clerkUser.firstName || "",
      lastName: clerkUser.lastName || "",
      username: clerkUser.username || "",
      imageUrl: clerkUser.imageUrl || "",
      emailAddresses: clerkUser.emailAddresses?.map((e) => e.emailAddress) || [],
    }

    const user = await User.findOneAndUpdate({ clerkUserId: clerkUser.id }, payload, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    })

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
    let user = await User.findOne({ clerkUserId: req.auth.sub })

    if (!user) {
      const clerkUser = await clerkClient.users.getUser(req.auth.sub)

      const primaryEmail =
        clerkUser.emailAddresses?.find((e) => e.id === clerkUser.primaryEmailAddressId)?.emailAddress ??
        clerkUser.emailAddresses?.[0]?.emailAddress ??
        `${clerkUser.id}@noemail.clerk`

      const payload = {
        clerkUserId: clerkUser.id,
        email: primaryEmail,
        firstName: clerkUser.firstName || "",
        lastName: clerkUser.lastName || "",
        username: clerkUser.username || "",
        imageUrl: clerkUser.imageUrl || "",
        emailAddresses: clerkUser.emailAddresses?.map((e) => e.emailAddress) || [],
      }

      user = await User.findOneAndUpdate({ clerkUserId: clerkUser.id }, payload, {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      })
    }

    return res.status(200).json({ user })
  } catch (error) {
    console.error("Error fetching user:", error)
    return res.status(500).json({ message: "Internal server error" })
  }
}

