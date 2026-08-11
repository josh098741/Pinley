export const rateLimit = ({ windowMs = 60_000, max = 30, message } = {}) => {
  const buckets = new Map()

  return (req, res, next) => {
    const key = String(req.auth?.sub || req.auth?.userId || req.ip || "anon")
    const now = Date.now()
    const cutoff = now - windowMs

    if (buckets.size > 10_000) {
      for (const [k, arr] of buckets) {
        if (arr[arr.length - 1] < cutoff) buckets.delete(k)
      }
    }

    const hits = (buckets.get(key) || []).filter((t) => t >= cutoff)
    if (hits.length >= max) {
      return res
        .status(429)
        .json({ message: message || "Too many requests. Please try again in a moment." })
    }

    hits.push(now)
    buckets.set(key, hits)
    next()
  }
}
