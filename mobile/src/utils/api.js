import { API_URL } from "../config";

const MAX_RETRIES = 3;
const BACKOFF_MS = 1000;

export const syncUserToDatabase = async (token) => {
  let lastError;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(`${API_URL}/api/auth/sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Sync failed with status ${response.status}`);
      }

      return response.json();
    } catch (err) {
      lastError = err;
      if (attempt < MAX_RETRIES - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, BACKOFF_MS * (attempt + 1))
        );
      }
    }
  }

  throw lastError;
};
