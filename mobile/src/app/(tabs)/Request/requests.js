import { ActivityIndicator, ScrollView, StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useRequests } from "../../../context/RequestsContext";
import {
  Avatar,
  ClayButton,
  ClayCard,
  ClayChip,
  EmptyState,
  SectionTitle,
  clay,
  displayName,
} from "../../../components/clay";
import { formatPinCode } from "../../../utils/pincode";

function RequestCard({ request }) {
  const { respond, cancelRequest } = useRequests();
  const { sender, recipient, status, _id } = request;
  const isIncoming = status === "pending" && sender && sender._id;
  const user = isIncoming ? sender : recipient;
  const busy = status !== "pending";

  return (
    <ClayCard style={{ marginBottom: 14 }}>
      <View className="flex-row items-center gap-4">
        <Avatar name={displayName(user)} uri={user?.imageUrl} size={52} />
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text numberOfLines={1} className="text-[16px] font-bold text-slate-900">
              {displayName(user)}
            </Text>
            {isIncoming ? (
              <ClayChip label="New" tone="pending" />
            ) : (
              <ClayChip label="Pending" tone="pending" />
            )}
          </View>
          <Text numberOfLines={1} className="mt-0.5 text-[13px] font-medium text-slate-500">
            {user?.email || (user?.pinCode ? `PinCode ${formatPinCode(user.pinCode)}` : "")}
          </Text>
          {user?.pinCode ? (
            <Text className="mt-0.5 text-[12px] font-bold tracking-wider text-violet-700">
              {formatPinCode(user.pinCode)}
            </Text>
          ) : null}
        </View>
      </View>

      <View className="mt-4 flex-row gap-3">
        {isIncoming ? (
          <>
            <ClayButton
              style={{ flex: 1 }}
              label="Accept"
              icon="checkmark"
              onPress={() => respond(_id, "accept")}
              disabled={busy}
            />
            <ClayButton
              style={{ flex: 1 }}
              label="Decline"
              variant="danger"
              onPress={() => respond(_id, "decline")}
              disabled={busy}
            />
          </>
        ) : (
          <ClayButton
            style={{ flex: 1 }}
            label="Cancel request"
            variant="ghost"
            icon="close"
            onPress={() => cancelRequest(_id)}
            disabled={busy}
          />
        )}
      </View>
    </ClayCard>
  );
}

function RecentCard({ request }) {
  const { sender, recipient, status, incoming } = request;
  const other = incoming ? sender : recipient;
  const labels = {
    accepted: { tone: "success", text: "Accepted" },
    declined: { tone: "danger", text: "Declined" },
    cancelled: { tone: "muted", text: "Cancelled" },
  };
  const meta = labels[status] || labels.cancelled;

  return (
    <View className="flex-row items-center gap-3 px-2 py-3">
      <Avatar name={displayName(other)} uri={other?.imageUrl} size={42} />
      <View className="flex-1">
        <Text numberOfLines={1} className="text-[14.5px] font-bold text-slate-800">
          {displayName(other)}
        </Text>
        <Text className="mt-0.5 text-[12px] font-medium text-slate-400">
          {incoming ? "Requested you" : "You requested"}
        </Text>
      </View>
      <ClayChip label={meta.text} tone={meta.tone} />
    </View>
  );
}

export default function Requests() {
  const router = useRouter();
  const { incoming, outgoing, recent, loading, connected } = useRequests();

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: clay.bg }}>
      <StatusBar barStyle="dark-content" backgroundColor={clay.bg} />
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View className="mb-6 mt-2 flex-row items-center justify-between">
          <View>
            <View className="flex-row items-center gap-2">
              <Text className="text-[28px] font-bold text-slate-900 tracking-tight">
                Requests
              </Text>
              <View
                className={`mt-1.5 h-2 w-2 rounded-full ${connected ? "bg-emerald-500" : "bg-slate-300"}`}
              />
            </View>
            <Text className="mt-1 text-[13.5px] font-medium text-slate-500">
              {connected
                ? "Live — updates appear instantly"
                : "Connecting for live updates…"}
            </Text>
          </View>
          <ClayButton
            label="Add"
            icon="add"
            compact
            onPress={() => router.push("/request-search")}
          />
        </View>

        {loading ? (
          <View className="items-center justify-center py-20">
            <ActivityIndicator color={clay.primary} size="large" />
            <Text className="mt-3 text-[13px] font-medium text-slate-400">
              Loading requests…
            </Text>
          </View>
        ) : (
          <>
            {incoming.length > 0 && (
              <>
                <SectionTitle title="For you" count={incoming.length} />
                {incoming.map((req) => (
                  <RequestCard key={req._id} request={req} />
                ))}
              </>
            )}

            {outgoing.length > 0 && (
              <>
                <SectionTitle title="Sent by you" count={outgoing.length} />
                {outgoing.map((req) => (
                  <RequestCard key={req._id} request={req} />
                ))}
              </>
            )}

            {incoming.length === 0 && outgoing.length === 0 && (
              <EmptyState
                icon="paper-plane-outline"
                title="No requests yet"
                subtitle="Tap “Add” to find someone by their PinCode, name or email and send them a request."
              />
            )}

            {recent.length > 0 && (
              <>
                <SectionTitle title="Recent" />
                <ClayCard style={{ paddingVertical: 4, paddingHorizontal: 8 }}>
                  {recent.map((req) => (
                    <RecentCard key={req._id} request={req} />
                  ))}
                </ClayCard>
              </>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
