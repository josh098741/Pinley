import { ActivityIndicator, ScrollView, StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useRequests } from "../../../context/RequestsContext";
import {
  Avatar,
  ClayButton,
  ClayCard,
  clay,
  displayName,
} from "../../../components/clay";
import { formatPinCode } from "../../../utils/pincode";

function PersonCard({ person }) {
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
        <Ionicons name="people" size={18} color={clay.success} />
      </View>
    </ClayCard>
  );
}

function CirclesEmptyState({ router }) {
  return (
    <View className="items-center px-2 pb-6 pt-4">
      <View className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-violet-100 border border-violet-200">
        <Ionicons name="people-outline" size={30} color={clay.primary} />
      </View>
      <Text className="text-center text-[19px] font-bold text-slate-900">
        Your circle is empty
      </Text>
      <Text className="mt-2 text-center text-[13.5px] font-medium leading-5 text-slate-500">
        Send a request to someone and connect in seconds. Once they accept, they&apos;ll show up here.
      </Text>
      <ClayButton
        style={{ width: "100%", marginTop: 20 }}
        label="Add someone"
        icon="person-add"
        onPress={() => router.push("/request-search")}
      />
    </View>
  );
}

export default function Circles() {
  const router = useRouter();
  const { connections, connectionsLoading } = useRequests();

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: clay.bg }}>
      <StatusBar barStyle="dark-content" backgroundColor={clay.bg} />
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View className="mb-5 mt-2 flex-row items-center justify-between">
          <View>
            <Text className="text-[28px] font-bold text-slate-900 tracking-tight">
              Circles
            </Text>
            <Text className="mt-1 text-[13.5px] font-medium text-slate-500">
              {connections.length > 0
                ? `${connections.length} ${connections.length === 1 ? "person" : "people"} connected`
                : "Stay close to the people who matter"}
            </Text>
          </View>
          <ClayButton
            label="Add"
            icon="add"
            compact
            onPress={() => router.push("/request-search")}
          />
        </View>

        {connectionsLoading ? (
          <View className="items-center justify-center py-20">
            <ActivityIndicator color={clay.primary} size="large" />
            <Text className="mt-3 text-[13px] font-medium text-slate-400">
              Loading your circle…
            </Text>
          </View>
        ) : connections.length > 0 ? (
          <>
            <Text className="mb-2 text-[16px] font-bold text-slate-800">Connected</Text>
            {connections.map((person) => (
              <PersonCard key={person._id} person={person} />
            ))}
          </>
        ) : (
          <CirclesEmptyState router={router} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}