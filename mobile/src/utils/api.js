import { API_URL_CANDIDATES } from "../config";

const REQUEST_TIMEOUT_MS = 4000;

export const apiRequest = async (
  path,
  { token, method = "GET", body, signal } = {}
) => {
  let lastError;

  for (const baseUrl of API_URL_CANDIDATES) {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    const onAbort = () => controller.abort();
    signal?.addEventListener("abort", onAbort);

    let settled = false;
    let failsafeTimer;
    // Some React Native fetch implementations ignore signal-driven aborts and can
    // leave the promise pending forever. This races fetch so a bad candidate can
    // never block the busy state / retry loop indefinitely.
    const failsafe = new Promise((_, reject) => {
      failsafeTimer = setTimeout(() => {
        if (!settled) reject(new Error(`Request timed out after ${REQUEST_TIMEOUT_MS}ms`));
      }, REQUEST_TIMEOUT_MS);
    });

    try {
      const response = await Promise.race([
        fetch(`${baseUrl}${path}`, {
          method,
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        }),
        failsafe,
      ]);
      settled = true;

      // A server answered us — trust it and stop. Only fall through on network-level
      // errors, never retry an answered mutation (4xx/5xx) against another backend.
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }
      return data;
    } catch (err) {
      if (signal?.aborted) throw err;
      lastError = err;
    } finally {
      settled = true;
      clearTimeout(timeout);
      clearTimeout(failsafeTimer);
      signal?.removeEventListener("abort", onAbort);
    }
  }

  throw lastError;
};