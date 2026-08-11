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
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth, useClerk, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { apiRequest } from "../../../utils/api";
import { formatPinCode } from "../../../utils/pincode";
import { ClayCard } from "../../../components/clay";

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
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <Text className="mb-8 text-[28px] font-bold text-slate-900 tracking-tight">Profile</Text>

        {/* Profile Card */}
        <Pressable className="mb-6 flex-row items-center justify-between">
          <View className="flex-row items-center gap-4">
            {user?.imageUrl ? (
              <Image source={{ uri: user.imageUrl }} className="h-14 w-14 rounded-full" />
            ) : (
              <View className="h-14 w-14 items-center justify-center rounded-full bg-slate-200">
                <Ionicons name="person" size={24} color="#64748b" />
              </View>
            )}
            <View>
              <Text className="text-lg font-bold text-slate-900">{user?.fullName || "User"}</Text>
              <Text className="text-[13px] font-medium text-slate-500 mt-0.5">{user?.emailAddresses?.[0]?.emailAddress || ""}</Text>
            </View>
          </View>
        </Pressable>

        {/* PinCode Card */}
        <ClayCard style={{ marginBottom: 20, backgroundColor: "#F5F2FE", shadowOpacity: 0.18 }}>
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center gap-2">
              <View className="h-7 w-7 items-center justify-center rounded-full bg-violet-200">
                <Ionicons name="key" size={14} color="#5B21B6" />
              </View>
              <Text className="text-[13px] font-bold uppercase tracking-wide text-violet-900">
                Your PinCode
              </Text>
            </View>
            {pinCode ? (
              <Pressable
                onPress={copyCode}
                className="flex-row items-center gap-1 rounded-full bg-white px-3 py-1.5 border border-violet-200"
              >
                {copying ? (
                  <ActivityIndicator size="small" color="#7C3AED" />
                ) : (
                  <Ionicons name="copy-outline" size={13} color="#5B21B6" />
                )}
                <Text className="text-[12px] font-bold text-violet-900">Copy</Text>
              </Pressable>
            ) : null}
          </View>

          {pinCode ? (
            <>
              <View className="items-center py-2">
                <Text
                  className="text-[34px] font-extrabold tracking-[0.25em] text-violet-950"
                  style={{ fontVariant: ["tabular-nums"] }}
                >
                  {formatPinCode(pinCode)}
                </Text>
              </View>
              <Text className="text-center text-[12.5px] leading-5 text-violet-700/80 px-4">
                Share this code with family and friends so they can find you and send you a request.
              </Text>
            </>
          ) : (
            <View className="items-center py-4">
              <ActivityIndicator color="#7C3AED" />
              <Text className="mt-2 text-[13px] font-medium text-violet-700/80">Loading your code…</Text>
            </View>
          )}
        </ClayCard>

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
          <Pressable
            onPress={() => signOut()}
            className="mt-0 items-center py-4"
          >
            <Text className="text-[15px] font-bold text-red-500">Log Out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
