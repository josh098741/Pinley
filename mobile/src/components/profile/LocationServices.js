import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  AppState,
  Linking,
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
} from "react-native";
import * as Location from "expo-location";
import { NavHeader, SectionLabel, Divider, LoadingScreen, BLUE, GREEN, RED, SLATE_400 } from "./common";
import { useProfilePrefs } from "../../hooks/useProfilePrefs";
import { useTheme } from "../../theme/ThemeProvider";

const LOCATION_STATUS_META = {
  granted_always: { label: "Always", color: GREEN, bg: "rgba(5,150,105,0.12)" },
  granted_foreground: { label: "While Using App", color: BLUE, bg: "rgba(37,99,235,0.12)" },
  denied: { label: "Denied", color: RED, bg: "rgba(225,29,72,0.12)" },
  undetermined: { label: "Not Set", color: SLATE_400, bg: "rgba(148,163,184,0.16)" },
};

function LocationStatusRow({ label, statusKey, actionLabel, onAction, busy }) {
  const { colors } = useTheme();
  const meta = LOCATION_STATUS_META[statusKey] || LOCATION_STATUS_META.undetermined;
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 16 }}>
      <View style={{ flex: 1, paddingRight: 16 }}>
        <Text style={{ fontSize: 15, fontWeight: "600", color: colors.text }}>{label}</Text>
        <View style={{ marginTop: 6, alignSelf: "flex-start", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: meta.bg }}>
          <Text style={{ color: meta.color, fontSize: 11, fontWeight: "700" }}>{meta.label}</Text>
        </View>
      </View>
      {actionLabel ? (
        <Pressable onPress={onAction} disabled={busy} style={{ borderRadius: 999, backgroundColor: "#0f172a", paddingHorizontal: 16, paddingVertical: 10 }}>
          {busy ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={{ fontSize: 13, fontWeight: "700", color: "#fff" }}>{actionLabel}</Text>
          )}
        </Pressable>
      ) : null}
    </View>
  );
}

export default function LocationServicesView({ onBack, user }) {
  const { prefs, save } = useProfilePrefs(user);
  const [fgStatus, setFgStatus] = useState("undetermined");
  const [bgStatus, setBgStatus] = useState("undetermined");
  const [canAskFg, setCanAskFg] = useState(true);
  const [canAskBg, setCanAskBg] = useState(true);
  const [sharingEnabled, setSharingEnabled] = useState(false);
  const [busyFg, setBusyFg] = useState(false);
  const [busyBg, setBusyBg] = useState(false);
  const [savingToggle, setSavingToggle] = useState(false);
  const [loading, setLoading] = useState(true);
  const { colors, accent } = useTheme();

  const refreshPermissions = useCallback(async () => {
    const fg = await Location.getForegroundPermissionsAsync();
    const bg = await Location.getBackgroundPermissionsAsync();
    setFgStatus(fg.granted ? "granted_foreground" : fg.status === "denied" ? "denied" : "undetermined");
    setCanAskFg(fg.canAskAgain);
    setBgStatus(bg.granted ? "granted_always" : bg.status === "denied" ? "denied" : "undetermined");
    setCanAskBg(bg.canAskAgain);
  }, []);

  useEffect(() => {
    setSharingEnabled(!!prefs.location.sharingEnabled);
  }, [prefs.location.sharingEnabled]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await refreshPermissions();
      if (!cancelled) setLoading(false);
    })();
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") refreshPermissions();
    });
    return () => {
      cancelled = true;
      sub.remove();
    };
  }, [refreshPermissions]);

  const requestForeground = async () => {
    if (!canAskFg) {
      Linking.openSettings();
      return;
    }
    setBusyFg(true);
    try {
      await Location.requestForegroundPermissionsAsync();
      await refreshPermissions();
    } finally {
      setBusyFg(false);
    }
  };

  const requestBackground = async () => {
    if (fgStatus !== "granted_foreground" && fgStatus !== "granted_always") {
      Alert.alert("Enable location access first", "Grant \"While Using App\" access before enabling Always.");
      return;
    }
    if (!canAskBg) {
      Linking.openSettings();
      return;
    }
    setBusyBg(true);
    try {
      await Location.requestBackgroundPermissionsAsync();
      await refreshPermissions();
    } finally {
      setBusyBg(false);
    }
  };

  const toggleSharing = async (value) => {
    if (value && fgStatus === "denied") {
      Linking.openSettings();
      return;
    }
    setSharingEnabled(value);
    setSavingToggle(true);
    const ok = await save({ location: { sharingEnabled: value } });
    if (!ok) setSharingEnabled(!value);
    setSavingToggle(false);
  };

  if (loading) {
    return <LoadingScreen title="Location Services" onBack={onBack} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <NavHeader title="Location Services" onBack={onBack} />

      <ScrollView
        className="flex-1 px-6 pt-2"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderRadius: 16, backgroundColor: colors.soft, paddingHorizontal: 16, paddingVertical: 16 }}>
          <View style={{ flex: 1, paddingRight: 16 }}>
            <Text style={{ fontSize: 15, fontWeight: "700", color: colors.text }}>Share My Location</Text>
            <Text style={{ marginTop: 4, fontSize: 13, color: colors.textMuted }}>
              Friends in your circles can see where you are
            </Text>
          </View>
          {savingToggle ? (
            <ActivityIndicator size="small" color={accent.primary} />
          ) : (
            <Switch value={sharingEnabled} onValueChange={toggleSharing} trackColor={{ true: accent.primary }} />
          )}
        </View>

        <SectionLabel>Device Permissions</SectionLabel>
        <Divider />
        <LocationStatusRow
          label="While Using the App"
          statusKey={fgStatus}
          actionLabel={
            fgStatus === "granted_foreground" || fgStatus === "granted_always"
              ? null
              : canAskFg
              ? "Enable"
              : "Open Settings"
          }
          onAction={requestForeground}
          busy={busyFg}
        />
        <Divider />
        <LocationStatusRow
          label="Always (Live Location)"
          statusKey={bgStatus}
          actionLabel={bgStatus === "granted_always" ? null : canAskBg ? "Enable" : "Open Settings"}
          onAction={requestBackground}
          busy={busyBg}
        />

        <Text style={{ marginTop: 24, marginBottom: 40, fontSize: 13, lineHeight: 20, color: colors.textFaint }}>
          “Always” access lets Pinley keep sharing your live location with friends even when the
          app is closed. You can turn this off anytime.
        </Text>
      </ScrollView>
    </View>
  );
}
