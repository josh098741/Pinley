import { Pressable, SafeAreaView, ScrollView, Text, View, Image } from "react-native";
import { useClerk, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";

function MenuItem({ icon, label, iconColor = "#fff", iconBg = "bg-slate-800", onPress }) {
  return (
    <Pressable className="flex-row items-center justify-between py-4" onPress={onPress}>
      <View className="flex-row items-center gap-4">
        <View className={`h-8 w-8 items-center justify-center rounded-full ${iconBg}`}>
          <Ionicons name={icon} size={16} color={iconColor} />
        </View>
        <Text className="text-[15px] font-semibold text-slate-900">{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
    </Pressable>
  );
}

export default function Profile() {
  const { user } = useUser();
  const { signOut } = useClerk();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1 px-6 pt-8"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <Text className="mb-8 text-[28px] font-bold text-slate-900 tracking-tight">Settings</Text>

        {/* Profile Card */}
        <Pressable className="mb-8 flex-row items-center justify-between">
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
              <Text className="text-[13px] font-medium text-slate-500 mt-0.5">View Profile</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
        </Pressable>

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
          <MenuItem icon="information-circle" label="About" />
        </View>

        {/* Log Out */}
        <Pressable
          onPress={() => signOut()}
          className="mt-6 items-center py-4"
        >
          <Text className="text-[15px] font-bold text-red-500">Log Out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
