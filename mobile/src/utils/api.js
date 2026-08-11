import { API_URL_CANDIDATES } from "../config";

const REQUEST_TIMEOUT_MS = 8000;

export const apiRequest = async (
  path,
  { token, method = "GET", body } = {}
) => {
  let lastError;

  for (const baseUrl of API_URL_CANDIDATES) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (err) {
      lastError = err;
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError;
};
