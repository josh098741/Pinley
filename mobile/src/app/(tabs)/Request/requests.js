import { ActivityIndicator, Image, ScrollView, StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useRequests } from "../../../context/RequestsContext";
import {
  Avatar,
  ClayButton,
  ClayCard,
  ClayChip,
  SectionTitle,
  clay,
  displayName
} from "../../../components/clay";
import { formatPinCode } from "../../../utils/pincode";

// 👉 Add your illustration to: assets/images/requests-empty.png
const REQUESTS_EMPTY_IMAGE = require("../../../../assets/images/requests_back.png");

function RequestCard({ request }) {
  const { respond, cancelRequest } = useRequests();
  const { sender, recipient, status, _id, type, event } = request;
  const isIncoming = status === "pending" && sender && sender._id;
  const user = isIncoming ? sender : recipient;
  const busy = status !== "pending";
  const isEvent = type === "event";

  const eventDateLabel = event?.date
    ? new Date(event.date).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <ClayCard style={{ marginBottom: 14 }}>
      <View className="flex-row items-center gap-4">
        <Avatar name={displayName(user)} uri={user?.imageUrl} size={52} />
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text numberOfLines={1} className="text-[16px] font-bold text-slate-900">
              {displayName(user)}
            </Text>
            {isEvent ? (
              <ClayChip label="Event" tone="pending" />
            ) : isIncoming ? (
              <ClayChip label="New" tone="pending" />
            ) : (
              <ClayChip label="Pending" tone="pending" />
            )}
          </View>
          <Text numberOfLines={1} className="mt-0.5 text-[13px] font-medium text-slate-500">
            {isEvent
              ? `Invited you to “${event?.title || "an event"}”${
                  eventDateLabel ? ` · ${eventDateLabel}` : ""
                }`
              : user?.email ||
                (user?.pinCode ? `PinCode ${formatPinCode(user.pinCode)}` : "")}
          </Text>
          {!isEvent && user?.pinCode ? (
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
              label={isEvent ? "Join event" : "Accept"}
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
            label={isEvent ? "Cancel invite" : "Cancel request"}
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
  const { sender, recipient, status, incoming, type, event } = request;
  const other = incoming ? sender : recipient;
  const labels = {
    accepted: { tone: "success", text: "Accepted" },
    declined: { tone: "danger", text: "Declined" },
    cancelled: { tone: "muted", text: "Cancelled" },
  };
  const meta = labels[status] || labels.cancelled;

  const subtitle = type === "event"
    ? `Event: ${event?.title || "Invite"}`
    : incoming
    ? "Requested you"
    : "You requested";

  return (
    <View className="flex-row items-center gap-3 px-2 py-3">
      <Avatar name={displayName(other)} uri={other?.imageUrl} size={42} />
      <View className="flex-1">
        <Text numberOfLines={1} className="text-[14.5px] font-bold text-slate-800">
          {displayName(other)}
        </Text>
        <Text numberOfLines={1} className="mt-0.5 text-[12px] font-medium text-slate-400">
          {subtitle}
        </Text>
      </View>
      <ClayChip label={meta.text} tone={meta.tone} />
    </View>
  );
}

function InfoBanner() {
  return (
    <ClayCard style={{ marginBottom: 18, paddingVertical: 16 }}>
      <View className="flex-row items-center gap-4">
        <View
          className="items-center justify-center rounded-full bg-violet-100"
          style={{ width: 48, height: 48 }}
        >
          <Ionicons name="shield-checkmark" size={24} color="#6d28d9" />
        </View>
        <View className="flex-1">
          <Text className="text-[15px] font-bold text-slate-900">
            You&apos;re in control
          </Text>
          <Text className="mt-0.5 text-[13px] font-medium text-slate-500">
            Only you decide who can see your location.
          </Text>
        </View>
      </View>
    </ClayCard>
  );
}

function RequestsEmptyState({ router }) {
  return (
    <View className="items-center px-2 pb-6 pt-2">
      <Image
        source={REQUESTS_EMPTY_IMAGE}
        resizeMode="contain"
        style={{ width: "100%", height: 260, marginBottom: 8 }}
      />

      <Text className="text-center text-[19px] font-bold text-slate-900">
        No requests yet
      </Text>
      <Text className="mt-2 text-center text-[13.5px] font-medium leading-5 text-slate-500">
        Stay close to the people who matter.{"\n"}Send a request and connect in seconds.
      </Text>

      <ClayButton
        style={{ width: "100%", marginTop: 20 }}
        label="Add someone"
        icon="person-add"
        onPress={() => router.push("/request-search")}
      />

      <View className="my-4 w-full flex-row items-center gap-3">
        <View className="h-[1px] flex-1 bg-slate-200" />
        <Text className="text-[12px] font-semibold text-slate-400">or</Text>
        <View className="h-[1px] flex-1 bg-slate-200" />
      </View>

      <ClayButton
        style={{ width: "100%" }}
        label="Share your PinCode"
        icon="qr-code-outline"
        variant="ghost"
        onPress={() => router.push("/profile")} // 👉 point this at your share-PinCode screen
      />
      <Text className="mt-2 text-[12px] font-medium text-slate-400">
        Let others find and connect with you
      </Text>
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

        <InfoBanner />

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
              <RequestsEmptyState router={router} />
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