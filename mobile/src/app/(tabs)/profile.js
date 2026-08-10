import { SafeAreaView, ScrollView, Text, View } from "react-native";
import { useUser } from "@clerk/clerk-expo";

function ProfileRow({ label, value }) {
  return (
    <View className="mb-3 flex-row items-center justify-between rounded-lg bg-slate-800 px-4 py-3">
      <Text className="text-sm font-semibold text-slate-400">{label}</Text>
      <Text className="text-sm font-semibold text-white">{value || "—"}</Text>
    </View>
  );
}

export default function Profile() {
  const { user } = useUser();

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <ScrollView
        className="flex-1 px-6 py-8"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <Text className="mb-6 text-2xl font-bold text-white">Profile</Text>

        <ProfileRow label="Name" value={user?.fullName} />
        <ProfileRow
          label="Email"
          value={user?.emailAddresses?.[0]?.emailAddress}
        />
        <ProfileRow label="User ID" value={user?.id} />
        <ProfileRow
          label="Last signed in"
          value={
            user?.lastSignInAt
              ? new Date(user.lastSignInAt).toLocaleString()
              : undefined
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
}
