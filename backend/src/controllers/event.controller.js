import User from "../models/user.models.js"
import Event from "../models/event.models.js"

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
  const status = event.status === "cancelled" ? "cancelled" : "going"

  return {
    id: String(event._id),
    _id: String(event._id),
    title: event.title,
    description: event.description,
    host: hostName,
    isHost,
    attendees: event.attendees ? event.attendees.length : 0,
    date: event.date.toISOString(),
    dateLabel: formatDateLabel(event.date),
    time: formatTime(event.date),
    location: event.location,
    status,
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

export const createEvent = async (req, res) => {
  try {
    const clerkUserId = req.auth?.sub || req.auth?.userId
    const me = await User.findOne({ clerkUserId })
    if (!me) return res.status(404).json({ message: "User not found" })

    const { title, description, location, date, attendeeIds } = req.body || {}

    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ message: "Event title is required" })
    }
    if (!date || isNaN(Date.parse(date))) {
      return res.status(400).json({ message: "A valid event date is required" })
    }

    const attendees = [me._id]
    if (Array.isArray(attendeeIds) && attendeeIds.length > 0) {
      const unique = [...new Set(attendeeIds)].slice(0, ATTENDEE_LIMIT)
      const people = await User.find({ _id: { $in: unique } }).select("_id")
      for (const person of people) {
        if (String(person._id) !== String(me._id)) attendees.push(person._id)
      }
    }

    const event = await Event.create({
      title: title.trim(),
      description: description ? String(description) : "",
      location: location ? String(location) : "",
      date: new Date(date),
      host: me._id,
      attendees,
    })

    const populated = await Event.findById(event._id)
      .populate("host", USER_SELECT)
      .populate("attendees", USER_SELECT)

    return res
      .status(201)
      .json({ event: serializeEvent(populated, String(me._id)) })
  } catch (error) {
    console.error("Error creating event:", error)
    return res.status(500).json({ message: "Internal server error" })
  }
}
