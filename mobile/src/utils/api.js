import { API_URL_CANDIDATES } from "../config";

const REQUEST_TIMEOUT_MS = 10000;

export const apiRequest = async (
  path,
  { token, method = "GET", body, signal } = {}
) => {
  let lastError;

  for (const baseUrl of API_URL_CANDIDATES) {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

    const controller = new AbortController();
    // React Native's fetch throws "This request has already been handled" if
    // abort() is called on a request that has already settled. Guard every
    // abort call on the settled flag (and swallow the harmless error) so a
    // late timeout/abort can't surface as an uncaught rejection.
    let settled = false;
    const safeAbort = () => {
      if (settled) return;
      try {
        controller.abort();
      } catch {
        /* already settled — nothing to do */
      }
    };

    const timeout = setTimeout(() => safeAbort(), REQUEST_TIMEOUT_MS);
    const onAbort = () => safeAbort();
    signal?.addEventListener("abort", onAbort);

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

export const uploadImage = async (localUri, token) => {
  // 1. Get signature from backend
  const signData = await apiRequest("/api/upload/sign", {
    method: "POST",
    token,
    body: { folder: "events" },
  });

  const { signature, timestamp, apiKey, cloudName, folder } = signData;

  // 2. Upload directly to Cloudinary
  const formData = new FormData();
  formData.append("file", {
    uri: localUri,
    type: "image/jpeg",
    name: "upload.jpg",
  });
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp);
  formData.append("signature", signature);
  formData.append("folder", folder);

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  const response = await fetch(url, {
    method: "POST",
    body: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || "Image upload failed");
  }

  return data.secure_url;
};