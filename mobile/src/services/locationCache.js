import * as SecureStore from "expo-secure-store";

const LOCATION_KEY = "pinley.lastKnownLocation";

export const getCachedLocation = async () => {
  try {
    const raw = await SecureStore.getItemAsync(LOCATION_KEY);
    if (!raw) return null;
    const loc = JSON.parse(raw);
    if (
      loc &&
      typeof loc.latitude === "number" &&
      typeof loc.longitude === "number" &&
      Number.isFinite(loc.latitude) &&
      Number.isFinite(loc.longitude)
    ) {
      return loc;
    }
    return null;
  } catch {
    return null;
  }
};

export const cacheLocation = async (coords) => {
  try {
    await SecureStore.setItemAsync(
      LOCATION_KEY,
      JSON.stringify({
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: typeof coords.accuracy === "number" ? coords.accuracy : null,
        updatedAt: Date.now(),
      })
    );
  } catch {
    // Caching is best-effort; ignore storage failures.
  }
};
