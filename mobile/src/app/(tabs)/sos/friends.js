import { Alert, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
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

function FriendCard({ person, trusted, pending, onAdd, onRemove }) {
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

        {trusted ? (
          <View className="items-end gap-1.5">
            <View
              className="flex-row items-center gap-1 rounded-full px-3 py-1.5"
              style={{ backgroundColor: clay.successSoft }}
            >
              <Ionicons name="shield-checkmark" size={14} color={clay.success} />
              <Text className="font-extrabold" style={{ color: clay.success, fontSize: 12 }}>
                Trusted
              </Text>
            </View>
            <TouchableOpacity onPress={() => onRemove(person)}>
              <Text className="font-bold" style={{ color: clay.danger, fontSize: 12 }}>
                Remove
              </Text>
            </TouchableOpacity>
          </View>
        ) : pending ? (
          <View
            className="rounded-full px-3 py-1.5"
            style={{ backgroundColor: clay.primarySoft }}
          >
            <Text className="font-extrabold" style={{ color: clay.purple, fontSize: 12 }}>
              Pending
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => onAdd(person)}
            className="flex-row items-center gap-1 rounded-full px-3 py-2"
            style={{ backgroundColor: clay.primary }}
          >
            <Ionicons name="add" size={14} color="#fff" />
            <Text className="font-extrabold" style={{ color: "#fff", fontSize: 12 }}>
              Add
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </ClayCard>
  );
}

function FriendsEmptyState() {
  return (
    <EmptyState
      icon="people"
      title="No friends yet"
      subtitle="Trusted contacts are chosen from your friends. Add friends first, then mark the ones you trust with your safety."
    />
  );
}

export default function TrustedContacts() {
  const router = useRouter();
  const {
    connections,
    connectionsLoading,
    trustedContacts,
    outgoing,
    sendRequest,
    removeTrustedContact,
  } = useRequests();

  const trustedSet = new Set((trustedContacts || []).map(String));
  const pendingTrustSet = new Set(
    (outgoing || [])
      .filter((r) => r.type === "trust" && r.status === "pending")
      .map((r) => String(r.recipient?._id || r.recipient))
  );

  const handleAdd = async (person) => {
    try {
      await sendRequest({ recipientId: person._id, type: "trust" });
      Alert.alert(
        "Request sent",
        `We asked ${displayName(person)} to be your trusted contact. They'll be added once they accept.`
      );
    } catch (e) {
      Alert.alert("Couldn't send", e?.message || "Something went wrong.");
    }
  };

  const handleRemove = async (person) => {
    try {
      await removeTrustedContact(person._id);
    } catch (e) {
      Alert.alert("Couldn't remove", e?.message || "Something went wrong.");
    }
  };

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
            onPress={() => router.replace("/sos/sos")}
          >
            <Ionicons name="chevron-back" size={20} color={clay.purple} />
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <Text className="text-[20px] font-bold text-slate-900 tracking-tight">
              Trusted Contacts
            </Text>
            <Text className="mt-0.5 text-[12.5px] font-medium leading-4 text-slate-500">
              Your friends. Tap “Add” to ask someone to be a trusted contact.
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
                {connections.length} {connections.length === 1 ? "friend" : "friends"}
              </Text>
              {connections.map((person) => {
                const id = String(person._id);
                return (
                  <FriendCard
                    key={person._id}
                    person={person}
                    trusted={trustedSet.has(id)}
                    pending={pendingTrustSet.has(id)}
                    onAdd={handleAdd}
                    onRemove={handleRemove}
                  />
                );
              })}
            </>
          ) : (
            <FriendsEmptyState />
          )}

          <View className="mt-4">
            <ClayButton
              label="Find friends"
              icon="person-add"
              onPress={() => router.push("/request-search")}
            />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
