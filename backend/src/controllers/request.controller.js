import User from "../models/user.models.js"
import Request from "../models/request.models.js"
import Connection from "../models/connection.models.js"
import Event from "../models/event.models.js"
import { emitToUser } from "../utils/realtime.js"
import { normalizePinCode } from "../utils/pincode.js"

const USER_SELECT = "firstName lastName email username imageUrl pinCode"
const EVENT_SELECT = "title date location host"

const getCurrentUser = async (req) => {
  const clerkUserId = req.auth?.sub || req.auth?.userId
  return User.findOne({ clerkUserId })
}

const findConnection = async (a, b) => {
  const [u1, u2] = [String(a), String(b)].sort()
  return Connection.findOne({ userA: u1, userB: u2 })
}

const createConnection = async (a, b) => {
  const [u1, u2] = [String(a), String(b)].sort()
  return Connection.create({ userA: u1, userB: u2 })
}

const displayName = (user) =>
  [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || user.email || "this user"

export const getRequests = async (req, res) => {
  try {
    const me = await getCurrentUser(req)
    if (!me) return res.status(404).json({ message: "User not found" })

    const [incoming, outgoing] = await Promise.all([
      Request.find({ recipient: me._id, status: "pending" })
        .populate("sender", USER_SELECT)
        .populate("event", EVENT_SELECT)
        .sort({ createdAt: -1 }),
      Request.find({ sender: me._id, status: "pending" })
        .populate("recipient", USER_SELECT)
        .populate("event", EVENT_SELECT)
        .sort({ createdAt: -1 }),
    ])

    const recentList = await Request.find({
      $or: [{ sender: me._id }, { recipient: me._id }],
      status: { $in: ["accepted", "declined", "cancelled"] },
    })
      .populate("sender", USER_SELECT)
      .populate("recipient", USER_SELECT)
      .populate("event", EVENT_SELECT)
      .sort({ updatedAt: -1 })
      .limit(20)

    const recent = recentList.map((request) => ({
      ...request.toObject(),
      incoming: String(request.recipient._id || request.recipient) === String(me._id),
    }))

    return res.status(200).json({ incoming, outgoing, recent })
  } catch (error) {
    console.error("Error fetching requests:", error)
    return res.status(500).json({ message: "Internal server error" })
  }
}

export const sendRequest = async (req, res) => {
  try {
    const me = await getCurrentUser(req)
    if (!me) return res.status(404).json({ message: "User not found" })

    const { recipientId, pinCode, type } = req.body || {}
    const requestType = type === "trust" ? "trust" : "connection"

    let recipient
    if (recipientId) {
      recipient = await User.findById(recipientId)
    } else if (pinCode) {
      recipient = await User.findOne({ pinCode: normalizePinCode(pinCode) })
    }

    if (!recipient) {
      return res.status(404).json({ message: "No user found with that PinCode." })
    }
    if (String(recipient._id) === String(me._id)) {
      return res.status(400).json({ message: "You cannot send a request to yourself." })
    }

    const connected = await findConnection(me._id, recipient._id)

    if (requestType === "trust") {
      // Trusted contacts must already be friends.
      if (!connected) {
        return res.status(400).json({
          message: `You can only add friends as trusted contacts. Connect with ${displayName(recipient)} first.`,
        })
      }
      const alreadyTrusted = (me.trustedContacts || []).some(
        (id) => String(id) === String(recipient._id)
      )
      if (alreadyTrusted) {
        return res.status(409).json({
          message: `${displayName(recipient)} is already one of your trusted contacts.`,
        })
      }
    } else if (connected) {
      return res.status(409).json({ message: `You are already connected with ${displayName(recipient)}.` })
    }

    const existing = await Request.findOne({
      status: "pending",
      type: requestType,
      $or: [
        { sender: me._id, recipient: recipient._id },
        { sender: recipient._id, recipient: me._id },
      ],
    })

    if (existing) {
      if (String(existing.sender) === String(me._id)) {
        return res.status(409).json({ message: "Request already sent — waiting for a reply." })
      }
      return res.status(409).json({ message: `${displayName(recipient)} already sent you a request.` })
    }

    const created = await Request.create({
      sender: me._id,
      recipient: recipient._id,
      type: requestType,
    })
    const request = await Request.findById(created._id)
      .populate("sender", USER_SELECT)
      .populate("recipient", USER_SELECT)

    emitToUser(recipient._id, "request:new", request)

    return res.status(201).json({ request })
  } catch (error) {
    console.error("Error sending request:", error)
    return res.status(500).json({ message: "Internal server error" })
  }
}

export const respondToRequest = async (req, res) => {
  try {
    const me = await getCurrentUser(req)
    if (!me) return res.status(404).json({ message: "User not found" })

    const { action } = req.body || {}
    if (!["accept", "decline"].includes(action)) {
      return res.status(400).json({ message: "Action must be 'accept' or 'decline'." })
    }

    const request = await Request.findById(req.params.id)
    if (!request) return res.status(404).json({ message: "Request not found." })
    if (String(request.recipient) !== String(me._id)) {
      return res.status(403).json({ message: "You cannot respond to this request." })
    }
    if (request.status !== "pending") {
      return res.status(409).json({ message: "This request has already been handled." })
    }

    request.status = action === "accept" ? "accepted" : "declined"
    request.respondedAt = new Date()
    await request.save()

    if (action === "accept") {
      if (request.type === "event" && request.event) {
        // Accepting an event invite adds the user to the event's attendees.
        const ev = await Event.findById(request.event)
        if (ev) {
          ev.attendees = [
            ...new Set([
              ...(ev.attendees || []).map(String),
              String(me._id),
            ]),
          ]
          ev.pendingInvites = (ev.pendingInvites || []).filter(
            (id) => String(id) !== String(me._id)
          )
          await ev.save()
          emitToUser(request.sender, "event:inviteAccepted", {
            eventId: String(ev._id),
            userId: String(me._id),
          })
        }
      } else if (request.type === "trust") {
        // Accepting a trust request means the sender may list the recipient as
        // one of their trusted contacts (the recipient consents to receive SOS).
        await User.findByIdAndUpdate(request.sender, {
          $addToSet: { trustedContacts: request.recipient },
        })
      } else {
        await createConnection(me._id, request.sender)
      }
    }

    const populated = await Request.findById(request._id)
      .populate("sender", USER_SELECT)
      .populate("recipient", USER_SELECT)

    emitToUser(request.sender, action === "accept" ? "request:accepted" : "request:declined", populated)

    if (action === "accept" && request.type === "event") {
      // Notify the accepter so their Events tab refreshes (they're now an attendee).
      emitToUser(me._id, "event:joined", {
        eventId: request.event ? String(request.event) : null,
        requestId: String(request._id),
      })
    }

    return res.status(200).json({ request: populated })
  } catch (error) {
    console.error("Error responding to request:", error)
    return res.status(500).json({ message: "Internal server error" })
  }
}

export const cancelRequest = async (req, res) => {
  try {
    const me = await getCurrentUser(req)
    if (!me) return res.status(404).json({ message: "User not found" })

    const request = await Request.findById(req.params.id)
    if (!request) return res.status(404).json({ message: "Request not found." })
    if (String(request.sender) !== String(me._id)) {
      return res.status(403).json({ message: "You cannot cancel this request." })
    }
    if (request.status !== "pending") {
      return res.status(409).json({ message: "This request has already been handled." })
    }

    request.status = "cancelled"
    request.respondedAt = new Date()
    await request.save()

    const populated = await Request.findById(request._id)
      .populate("sender", USER_SELECT)
      .populate("recipient", USER_SELECT)

    emitToUser(request.recipient, "request:cancelled", populated)

    return res.status(200).json({ request: populated })
  } catch (error) {
    console.error("Error cancelling request:", error)
    return res.status(500).json({ message: "Internal server error" })
  }
}
