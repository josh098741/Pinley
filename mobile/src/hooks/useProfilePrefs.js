import { useCallback, useMemo, useState } from "react";

// Profile preferences are persisted on the Clerk user (unsafeMetadata), so they
// survive sign-out / sign-in and sync across devices without backend changes.
const PREFS_KEY = "profilePrefs";

export const DEFAULT_PREFS = {
  privacy: {
    visibility: "friends",
    showOnlineStatus: true,
    allowFriendRequests: true,
    ghostMode: false,
    shareLiveLocationOnSOS: true,
  },
  notifications: {
    pushEnabled: true,
    friendRequests: true,
    circleInvites: true,
    nearbyFriends: true,
    sosAlerts: true,
    eventReminders: true,
    eventInvites: true,
    locationAlerts: false,
    chatMessages: true,
    appUpdates: false,
    productTips: false,
  },
  battery: {
    accuracy: "balanced",
    backgroundUpdates: true,
    pauseWhenStill: true,
    lowPowerFallback: true,
  },
  data: {
    reduceDataMode: false,
    wifiOnlyMapTiles: false,
    autoDownloadMedia: true,
  },
  appearance: {
    theme: "system",
    accentColor: "purple",
    reduceMotion: false,
  },
  account: {
    phone: "",
  },
  location: {
    sharingEnabled: false,
  },
  language: "en",
};

const isPlainObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

export const deepMerge = (...sources) => {
  const out = {};
  for (const source of sources) {
    if (!source) continue;
    for (const key of Object.keys(source)) {
      const value = source[key];
      if (isPlainObject(value)) {
        out[key] = deepMerge(isPlainObject(out[key]) ? out[key] : {}, value);
      } else {
        out[key] = value;
      }
    }
  }
  return out;
};

export function useProfilePrefs(user) {
  const [saving, setSaving] = useState(false);

  const prefs = useMemo(
    () => deepMerge(DEFAULT_PREFS, user?.unsafeMetadata?.[PREFS_KEY] || {}),
    [user?.unsafeMetadata]
  );

  const save = useCallback(
    async (patch) => {
      if (!user) return false;
      setSaving(true);
      try {
        const current = user.unsafeMetadata?.[PREFS_KEY] || {};
        const merged = deepMerge(DEFAULT_PREFS, current, patch);
        await user.update({
          unsafeMetadata: { ...user.unsafeMetadata, [PREFS_KEY]: merged },
        });
        return true;
      } catch (err) {
        console.error("Failed to save profile preference:", err);
        return false;
      } finally {
        setSaving(false);
      }
    },
    [user]
  );

  return { prefs, save, saving };
}