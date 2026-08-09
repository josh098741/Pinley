import { API_URL } from "../config";

export const syncUserToDatabase = async (token) => {
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
};
