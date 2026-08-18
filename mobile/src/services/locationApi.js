import { API_URL_CANDIDATES } from "../config";

const REQUEST_TIMEOUT_MS = 8000;

export const updateUserLocation = async (token, { latitude, longitude, accuracy }) => {
  let lastError;

  for (const baseUrl of API_URL_CANDIDATES) {
    const controller = new AbortController();
    let settled = false;
    // React Native's fetch throws "This request has already been handled" if
    // abort() is called on a request that already settled.
    const timeout = setTimeout(() => {
      if (!settled) {
        try {
          controller.abort();
        } catch {
          /* already settled */
        }
      }
    }, REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(`${baseUrl}/api/users/location`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ latitude, longitude, accuracy }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Location update failed with status ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      lastError = err;
    } finally {
      settled = true;
      clearTimeout(timeout);
    }
  }

  throw lastError;
};
