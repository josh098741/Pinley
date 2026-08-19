import { ActivityIndicator, Image, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { formatPinCode } from "../../utils/pincode";
import { PURPLE } from "./common";

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

export function ProfileHeader({ user, pinCode, copying, copyCode, onHelp }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        backgroundColor: PURPLE,
        paddingTop: insets.top + 12,
        paddingHorizontal: 24,
        paddingBottom: 36,
      }}
    >
      {/* Top row: title + help */}
      <View className="mb-6 flex-row items-center justify-between">
        <Text className="text-[22px] font-bold text-white tracking-tight">Profile</Text>
        <Pressable
          onPress={onHelp}
          className="flex-row items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-2"
        >
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