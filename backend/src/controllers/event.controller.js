import User from "../models/user.models.js"
import Event from "../models/event.models.js"
import Request from "../models/request.models.js"
import { emitToUser } from "../utils/realtime.js"

const USER_SELECT = "firstName lastName email username imageUrl pinCode lastKnownLocation"

const ATTENDEE_LIMIT = 500

function formatDateLabel(date) {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const eventDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diffDays = Math.round((eventDay - startOfToday) / 86400000)

  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Tomorrow"
  if (diffDays === -1) return "Yesterday"
  if (diffDays > 1 && diffDays < 7) {
    return eventDay.toLocaleDateString("en-US", { weekday: "short" })
  }
  return eventDay.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function formatTime(date) {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })
}

function serializeEvent(event, meId) {
  const host = event.host
  const hostName =
    host && host.toObject
      ? [host.firstName, host.lastName].filter(Boolean).join(" ").trim() ||
        host.username ||
        host.email ||
        "Unknown"
      : "Unknown"

  const isHost = String(host?._id || host) === meId

  const inAttendees = (event.attendees || []).some(
    (a) => String(a) === meId
  )
  const inPending = (event.pendingInvites || []).some(
    (a) => String(a) === meId
  )

  const myStatus = event.status === "cancelled"
    ? "cancelled"
    : inAttendees
    ? "going"
    : inPending
    ? "invited"
    : "none"

  return {
    id: String(event._id),
    _id: String(event._id),
    title: event.title,
    description: event.description,
    host: hostName,
    isHost,
    attendees: event.attendees ? event.attendees.length : 0,
    pendingCount: event.pendingInvites ? event.pendingInvites.length : 0,
    myStatus,
    date: event.date.toISOString(),
    dateLabel: formatDateLabel(event.date),
    time: formatTime(event.date),
    location: event.location,
    status: myStatus,
  }
}

export const getEvents = async (req, res) => {
  try {
    const clerkUserId = req.auth?.sub || req.auth?.userId
    const me = await User.findOne({ clerkUserId })
    if (!me) return res.status(404).json({ message: "User not found" })

    const events = await Event.find({
      status: { $ne: "cancelled" },
      $or: [{ host: me._id }, { attendees: me._id }],
    })
      .populate("host", USER_SELECT)
      .sort({ date: 1 })

    const meId = String(me._id)
    const serialized = events.map((event) => serializeEvent(event, meId))

    return res.status(200).json({ events: serialized })
  } catch (error) {
    console.error("Error fetching events:", error)
    return res.status(500).json({ message: "Internal server error" })
  }
}

const EVENT_SELECT = "title date location"
const REQUEST_SELECT = "firstName lastName email username imageUrl pinCode"

// Sends an event invitation (a `type: "event"` request) to one user.
// Returns the created/populated request, or null if it should be skipped.
const sendEventInvite = async (event, fromUser, toUser) => {
  // Never invite the host, an existing attendee, or someone already pending.
  const isHost = String(event.host) === String(toUser._id)
  const alreadyIn = (event.attendees || []).some(
    (a) => String(a) === String(toUser._id)
  )
  const alreadyPending = (event.pendingInvites || []).some(
    (a) => String(a) === String(toUser._id)
  )
  if (isHost || alreadyIn || alreadyPending) return null

  const existing = await Request.findOne({
    type: "event",
    event: event._id,
    sender: fromUser._id,
    recipient: toUser._id,
    status: "pending",
  })
  if (existing) return null

  const created = await Request.create({
    sender: fromUser._id,
    recipient: toUser._id,
    type: "event",
    event: event._id,
  })

  event.pendingInvites = [...new Set([
    ...(event.pendingInvites || []).map(String),
    String(toUser._id),
  ])]

  const populated = await Request.findById(created._id)
    .populate("sender", REQUEST_SELECT)
    .populate("recipient", REQUEST_SELECT)
    .populate("event", EVENT_SELECT)

  emitToUser(toUser._id, "request:new", populated)

  return populated
}

export const createEvent = async (req, res) => {
  try {
    const clerkUserId = req.auth?.sub || req.auth?.userId
    const me = await User.findOne({ clerkUserId })
    if (!me) return res.status(404).json({ message: "User not found" })

    const { title, description, location, date, inviteeIds } = req.body || {}

    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ message: "Event title is required" })
    }
    if (!date || isNaN(Date.parse(date))) {
      return res.status(400).json({ message: "A valid event date is required" })
    }

    // The host is the only attendee at creation. Invitees are asked to
    // accept (via a request) before they are added to `attendees`.
    const event = await Event.create({
      title: title.trim(),
      description: description ? String(description) : "",
      location: location ? String(location) : "",
      date: new Date(date),
      host: me._id,
      attendees: [me._id],
      pendingInvites: [],
    })

    let invitesSent = 0
    if (Array.isArray(inviteeIds) && inviteeIds.length > 0) {
      const unique = [...new Set(inviteeIds)].slice(0, ATTENDEE_LIMIT)
      const people = await User.find({ _id: { $in: unique } }).select("_id")
      for (const person of people) {
        const invite = await sendEventInvite(event, me, person)
        if (invite) invitesSent += 1
      }
    }

    await event.save()

    const populated = await Event.findById(event._id)
      .populate("host", USER_SELECT)
      .populate("attendees", USER_SELECT)
      .populate("pendingInvites", USER_SELECT)

    return res.status(201).json({
      event: serializeEvent(populated, String(me._id)),
      invitesSent,
    })
  } catch (error) {
    console.error("Error creating event:", error)
    return res.status(500).json({ message: "Internal server error" })
  }
}

function publicUser(u) {
  if (!u) return null
  const name =
    [u.firstName, u.lastName].filter(Boolean).join(" ").trim() ||
    u.username ||
    u.email ||
    "Unknown"
  return {
    id: String(u._id),
    _id: String(u._id),
    firstName: u.firstName || "",
    lastName: u.lastName || "",
    username: u.username || "",
    email: u.email || "",
    imageUrl: u.imageUrl || "",
    name,
  }
}

export const getEvent = async (req, res) => {
  try {
    const clerkUserId = req.auth?.sub || req.auth?.userId
    const me = await User.findOne({ clerkUserId })
    if (!me) return res.status(404).json({ message: "User not found" })

    const event = await Event.findById(req.params.id)
      .populate("host", USER_SELECT)
      .populate("attendees", USER_SELECT)
      .populate("pendingInvites", USER_SELECT)

    if (!event) return res.status(404).json({ message: "Event not found" })

    const meId = String(me._id)
    const base = serializeEvent(event, meId)

    const attendeesList = (event.attendees || [])
      .map(publicUser)
      .filter(Boolean)
    const pendingList = (event.pendingInvites || [])
      .map(publicUser)
      .filter(Boolean)

    return res.status(200).json({
      event: {
        ...base,
        host: publicUser(event.host),
        attendees: attendeesList,
        attendeeCount: attendeesList.length,
        pendingInvites: pendingList,
      },
    })
  } catch (error) {
    console.error("Error fetching event:", error)
    return res.status(500).json({ message: "Internal server error" })
  }
}

export const inviteToEvent = async (req, res) => {
  try {
    const clerkUserId = req.auth?.sub || req.auth?.userId
    const me = await User.findOne({ clerkUserId })
    if (!me) return res.status(404).json({ message: "User not found" })

    const event = await Event.findById(req.params.id)
    if (!event) return res.status(404).json({ message: "Event not found" })
    if (String(event.host) !== String(me._id)) {
      return res.status(403).json({ message: "Only the host can invite to this event." })
    }

    const { inviteeIds } = req.body || {}
    if (!Array.isArray(inviteeIds) || inviteeIds.length === 0) {
      return res.status(400).json({ message: "Provide inviteeIds to invite." })
    }

    const unique = [...new Set(inviteeIds)].slice(0, ATTENDEE_LIMIT)
    const people = await User.find({ _id: { $in: unique } }).select("_id")

    const sent = []
    for (const person of people) {
      const invite = await sendEventInvite(event, me, person)
      if (invite) sent.push(invite)
    }
    await event.save()

    return res.status(200).json({ invitesSent: sent.length, requests: sent })
  } catch (error) {
    console.error("Error inviting to event:", error)
    return res.status(500).json({ message: "Internal server error" })
  }
}
