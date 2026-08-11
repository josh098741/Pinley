import { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth, useClerk, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { apiRequest } from "../../../utils/api";
import { formatPinCode } from "../../../utils/pincode";

// Matches the tab bar purple (rgba(91,63,214, ...)) from Circles/circles tab layout
const PURPLE = "#5B3FD6";

function MenuItem({ icon, label, iconColor = "#fff", iconBg = "bg-slate-800", onPress, last = false }) {
  return (
    <>
      <Pressable className="flex-row items-center justify-between py-4" onPress={onPress}>
        <View className="flex-row items-center gap-4">
          <View className={`h-8 w-8 items-center justify-center rounded-full ${iconBg}`}>
            <Ionicons name={icon} size={16} color={iconColor} />
          </View>
          <Text className="text-[15px] font-semibold text-slate-900">{label}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
      </Pressable>
      {!last && <View className="h-px bg-slate-300" />}
    </>
  );
}

function PinCodeSection({ pinCode, copying, copyCode }) {
  return (
    <View className="mt-5 flex-row items-center justify-between rounded-2xl bg-white/12 px-4 py-3.5">
      <View className="flex-1">
        <Text className="text-[11px] font-bold uppercase tracking-widest text-white/60">
          Your PinCode
        </Text>
        {pinCode ? (
          <Text
            className="mt-1 text-[20px] font-extrabold tracking-[0.15em] text-white"
            style={{ fontVariant: ["tabular-nums"] }}
          >
            {formatPinCode(pinCode)}
          </Text>
        ) : (
          <View className="mt-1 flex-row items-center gap-2">
            <ActivityIndicator size="small" color="#fff" />
            <Text className="text-[13px] font-medium text-white/60">Loading…</Text>
          </View>
        )}
      </View>

      {pinCode ? (
        <Pressable
          onPress={copyCode}
          className="flex-row items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-2"
        >
          {copying ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="copy-outline" size={13} color="#fff" />
          )}
          <Text className="text-[12px] font-bold text-white">Copy</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function ProfileHeader({ user, pinCode, copying, copyCode }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        backgroundColor: PURPLE,
        paddingTop: insets.top + 12,
        paddingHorizontal: 24,
        paddingBottom: 24,
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
      }}
    >
      {/* Top row: title + help */}
      <View className="mb-6 flex-row items-center justify-between">
        <Text className="text-[22px] font-bold text-white tracking-tight">Profile</Text>
        <Pressable className="flex-row items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-2">
          <Ionicons name="help-circle-outline" size={16} color="#fff" />
          <Text className="text-[13px] font-bold text-white">Help</Text>
        </Pressable>
      </View>

      {/* Avatar + name row */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-4">
          <View>
            {user?.imageUrl ? (
              <Image source={{ uri: user.imageUrl }} className="h-14 w-14 rounded-full" />
            ) : (
              <View className="h-14 w-14 items-center justify-center rounded-full bg-white/25">
                <Text className="text-[20px] font-bold text-white">
                  {(user?.fullName || "U").charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View
              className="absolute -bottom-1 -right-1 items-center justify-center rounded-full bg-white"
              style={{ width: 22, height: 22 }}
            >
              <Ionicons name="camera" size={12} color={PURPLE} />
            </View>
          </View>
          <View>
            <Text className="text-[18px] font-bold text-white">{user?.fullName || "User"}</Text>
            <Text className="mt-0.5 text-[13px] font-medium text-white/70">
              {user?.emailAddresses?.[0]?.emailAddress || ""}
            </Text>
          </View>
        </View>
      </View>

      {/* PinCode now lives inside the header, right below user details */}
      <PinCodeSection pinCode={pinCode} copying={copying} copyCode={copyCode} />
    </View>
  );
}

export default function Profile() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const { signOut } = useClerk();
  const [pinCode, setPinCode] = useState(null);
  const [copying, setCopying] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const data = await apiRequest("/api/auth/me", { token });
        if (!cancelled && data?.user?.pinCode) {
          setPinCode(data.user.pinCode);
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [getToken]);

  const copyCode = async () => {
    if (!pinCode) return;
    setCopying(true);
    try {
      await Clipboard.setStringAsync(formatPinCode(pinCode));
      Alert.alert("Copied", "Your PinCode is on your clipboard. Share it with the people you trust.");
    } finally {
      setCopying(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header (with PinCode inside) scrolls away with the rest of the content */}
        <ProfileHeader user={user} pinCode={pinCode} copying={copying} copyCode={copyCode} />

        <SafeAreaView edges={["bottom"]} className="flex-1 bg-white">
          <View className="px-6 pt-6">
            {/* Menu Items */}
            <View className="mb-10 flex-1">
              <MenuItem icon="person" label="Account Settings" />
              <MenuItem icon="shield-checkmark" label="Privacy & Safety" />
              <MenuItem icon="notifications" label="Notifications" />
              <MenuItem icon="battery-half" label="Battery Optimization" iconBg="bg-emerald-700" />
              <MenuItem icon="pie-chart" label="Data Usage" />
              <MenuItem icon="color-palette" label="Appearance" />
              <MenuItem icon="globe-outline" label="Language" />
              <MenuItem icon="people" label="Invite Friends" iconBg="bg-blue-600" />
              <MenuItem icon="help-circle" label="Help & Support" />
              <MenuItem icon="information-circle" label="About" last />

              {/* Log Out */}
              <Pressable onPress={() => signOut()} className="mt-0 items-center py-4">
                <Text className="text-[15px] font-bold text-red-500">Log Out</Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </ScrollView>
    </View>
  );
}