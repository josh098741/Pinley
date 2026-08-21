import { ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useRequests } from "../../../context/RequestsContext";
import {
  Avatar,
  ClayButton,
  ClayCard,
  EmptyState,
  clay,
  displayName,
} from "../../../components/clay";
import { formatPinCode } from "../../../utils/pincode";

function FriendCard({ person }) {
  return (
    <ClayCard style={{ marginBottom: 12 }}>
      <View className="flex-row items-center gap-4">
        <Avatar name={displayName(person)} uri={person.imageUrl} size={52} />
        <View className="flex-1">
          <Text numberOfLines={1} className="text-[15.5px] font-bold text-slate-900">
            {displayName(person)}
          </Text>
          <Text numberOfLines={1} className="mt-0.5 text-[12.5px] font-medium text-slate-500">
            {person.email || person.username}
          </Text>
          {person.pinCode ? (
            <Text className="mt-1 text-[12px] font-bold tracking-wider text-violet-700">
              {formatPinCode(person.pinCode)}
            </Text>
          ) : null}
        </View>
        <View
          className="items-center justify-center rounded-full"
          style={{ width: 32, height: 32, backgroundColor: clay.primarySoft }}
        >
          <Ionicons name="shield-checkmark" size={16} color={clay.success} />
        </View>
      </View>
    </ClayCard>
  );
}

function FriendsEmptyState() {
  return (
    <EmptyState
      icon="people"
      title="No trusted contacts yet"
      subtitle="Add friends you trust so they can receive your SOS alerts and location in an emergency."
    />
  );
}

export default function TrustedContacts() {
  const router = useRouter();
  const { connections, connectionsLoading } = useRequests();

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: clay.bg }}>
      <StatusBar barStyle="dark-content" backgroundColor={clay.bg} />

      <View className="flex-1 px-5">
        {/* Header */}
        <View className="mt-2 flex-row items-center gap-3">
          <TouchableOpacity
            className="items-center justify-center rounded-2xl"
            style={{
              width: 40,
              height: 40,
              backgroundColor: "#fff",
              shadowColor: "#000",
              shadowOpacity: 0.06,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 2 },
            }}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={20} color={clay.purple} />
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <Text className="text-[20px] font-bold text-slate-900 tracking-tight">
              Trusted Contacts
            </Text>
            <Text className="mt-0.5 text-[12.5px] font-medium leading-4 text-slate-500">
              These friends will receive your SOS alert and live location.
            </Text>
          </View>
        </View>

        <ScrollView
          className="mt-4 flex-1"
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {connectionsLoading ? (
            <View className="items-center justify-center py-20">
              <Text className="text-[13px] font-medium text-slate-400">
                Loading your contacts…
              </Text>
            </View>
          ) : connections.length > 0 ? (
            <>
              <Text className="mb-3 text-[16px] font-bold text-slate-800">
                {connections.length} {connections.length === 1 ? "contact" : "contacts"}
              </Text>
              {connections.map((person) => (
                <FriendCard key={person._id} person={person} />
              ))}
            </>
          ) : (
            <FriendsEmptyState />
          )}

          <View className="mt-4">
            <ClayButton
              label="Add trusted contacts"
              icon="add"
              onPress={() => router.push("/request-search")}
            />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
