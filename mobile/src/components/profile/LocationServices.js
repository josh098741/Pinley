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
import { NavHeader, SectionLabel, Divider, LoadingScreen, BLUE, GREEN, RED, SLATE_400, PURPLE } from "./common";
import { useProfilePrefs } from "../../hooks/useProfilePrefs";

const LOCATION_STATUS_META = {
  granted_always: { label: "Always", color: GREEN, bg: "bg-emerald-50" },
  granted_foreground: { label: "While Using App", color: BLUE, bg: "bg-blue-50" },
  denied: { label: "Denied", color: RED, bg: "bg-red-50" },
  undetermined: { label: "Not Set", color: SLATE_400, bg: "bg-slate-100" },
};

function LocationStatusRow({ label, statusKey, actionLabel, onAction, busy }) {
  const meta = LOCATION_STATUS_META[statusKey] || LOCATION_STATUS_META.undetermined;
  return (
    <View className="flex-row items-center justify-between py-4">
      <View className="flex-1 pr-4">
        <Text className="text-[15px] font-semibold text-slate-900">{label}</Text>
        <View className={`mt-1.5 self-start rounded-full px-2.5 py-1 ${meta.bg}`}>
          <Text style={{ color: meta.color }} className="text-[11px] font-bold">
            {meta.label}
          </Text>
        </View>
      </View>
      {actionLabel ? (
        <Pressable onPress={onAction} disabled={busy} className="rounded-full bg-slate-900 px-4 py-2.5">
          {busy ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text className="text-[13px] font-bold text-white">{actionLabel}</Text>
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
    <View className="flex-1 bg-white">
      <NavHeader title="Location Services" onBack={onBack} />

      <ScrollView
        className="flex-1 px-6 pt-2"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View className="flex-row items-center justify-between rounded-2xl bg-slate-50 px-4 py-4">
          <View className="flex-1 pr-4">
            <Text className="text-[15px] font-bold text-slate-900">Share My Location</Text>
            <Text className="mt-1 text-[13px] text-slate-500">
              Friends in your circles can see where you are
            </Text>
          </View>
          {savingToggle ? (
            <ActivityIndicator size="small" color={PURPLE} />
          ) : (
            <Switch value={sharingEnabled} onValueChange={toggleSharing} trackColor={{ true: PURPLE }} />
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

        <Text className="mt-6 mb-10 text-[13px] leading-5 text-slate-400">
          “Always” access lets Pinley keep sharing your live location with friends even when the
          app is closed. You can turn this off anytime.
        </Text>
      </ScrollView>
    </View>
  );
}