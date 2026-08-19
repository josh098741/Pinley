import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import {
  Avatar,
  ClayCard,
  ClayChip,
  ClayButton,
  clay,
  displayName,
} from "../../../components/clay";

import { useEvents } from "../../../context/EventsContext";

const CARD_BORDER = {
  borderWidth: 2,
  borderColor: clay.primaryBorder,
};

const TONE_BY_STATUS = {
  going: "success",
  attending: "success",
  pending: "pending",
  maybe: "pending",
  invited: "muted",
  cancelled: "danger",
  none: "muted",
};

const STATUS_LABEL = {
  going: "You're going",
  attending: "You're going",
  pending: "Pending",
  maybe: "Maybe",
  invited: "Invited",
  cancelled: "Cancelled",
  none: "Not going",
};

function Header({ onBack }) {
  return (
    <View className="flex-row items-center justify-between px-4 pt-3 pb-1">
      <PressableRow onPress={onBack}>
        <View
          className="h-10 w-10 items-center justify-center rounded-full bg-white"
          style={{
            borderWidth: 1,
            borderColor: clay.primaryBorder,
          }}
        >
          <Ionicons name="chevron-back" size={20} color={clay.ink} />
        </View>
      </PressableRow>

      <Text className="text-[20px] font-bold text-slate-900">Event</Text>

      <View className="w-10" />
    </View>
  );
}

function PressableRow({ onPress, children }) {
  return (
    <Pressable onPress={onPress} hitSlop={8}>
      {children}
    </Pressable>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <View className="flex-row items-center py-3" style={{ gap: 12 }}>
      <View
        className="items-center justify-center rounded-2xl"
        style={{
          width: 42,
          height: 42,
          backgroundColor: clay.primarySoft,
        }}
      >
        <Ionicons name={icon} size={19} color={clay.primary} />
      </View>
      <View className="flex-1">
        <Text className="text-[12px] font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </Text>
        <Text className="mt-0.5 text-[14.5px] font-bold text-slate-900">
          {value}
        </Text>
      </View>
    </View>
  );
}

function SectionCard({ title, icon, children }) {
  return (
    <ClayCard style={{ marginTop: 14, padding: 18, ...CARD_BORDER }}>
      <View className="mb-1 flex-row items-center" style={{ gap: 8 }}>
        <Ionicons name={icon} size={17} color={clay.primary} />
        <Text className="text-[15px] font-bold text-slate-900">{title}</Text>
      </View>
      <View style={{ marginTop: 6 }}>{children}</View>
    </ClayCard>
  );
}

function AttendeeRow({ user }) {
  return (
    <View
      className="flex-row items-center py-2.5"
      style={{ borderTopWidth: 1, borderTopColor: clay.line }}
    >
      <Avatar name={displayName(user)} uri={user.imageUrl} size={38} />
      <View className="ml-3 flex-1">
        <Text className="text-[14px] font-semibold text-slate-900">
          {displayName(user)}
        </Text>
        <Text className="mt-0.5 text-[12px] font-medium text-slate-500">
          {user.username || user.email}
        </Text>
      </View>
    </View>
  );
}

export default function EventDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { getEvent } = useEvents();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getEvent(id);
        if (!active) return;
        if (!data) {
          setError("Event not found.");
        } else {
          setEvent(data);
        }
      } catch (err) {
        if (!active) return;
        setError(err?.message || "Could not load this event.");
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [id, getEvent]);

  const dateParts = useMemo(() => {
    if (!event?.date) return null;
    const d = new Date(event.date);
    if (isNaN(d.getTime())) return null;
    return {
      weekday: d.toLocaleDateString(undefined, { weekday: "long" }),
      date: d.toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
      time: d.toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
      }),
    };
  }, [event]);

  const tone = event ? TONE_BY_STATUS[event.status] || "muted" : "muted";
  const statusLabel = event
    ? STATUS_LABEL[event.status] || "View"
    : "View";

  const attendees = event?.attendees || [];
  const pending = event?.pendingInvites || [];

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: clay.bg }}>
      <StatusBar barStyle="dark-content" backgroundColor={clay.bg} />

      <Header onBack={() => router.back()} />

      {loading ? (
        <View className="flex-1 items-center justify-center py-24">
          <ActivityIndicator color={clay.primary} size="large" />
          <Text className="mt-3 text-[13px] font-medium text-slate-400">
            Loading event…
          </Text>
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-8 py-24">
          <View
            className="items-center justify-center rounded-2xl"
            style={{
              width: 56,
              height: 56,
              backgroundColor: clay.dangerSoft,
            }}
          >
            <Ionicons name="alert-circle" size={26} color={clay.danger} />
          </View>
          <Text className="mt-3 text-center text-[14.5px] font-bold text-slate-900">
            {error}
          </Text>
          <View className="mt-4">
            <ClayButton
              label="Go back"
              variant="soft"
              onPress={() => router.back()}
            />
          </View>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: 24,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero */}
          <ClayCard
            style={[CARD_BORDER, { overflow: "hidden", padding: 0 }]}
          >
            <View
              className="px-5 pt-5 pb-4"
              style={{
                backgroundColor: clay.primarySoft,
                borderTopLeftRadius: 22,
                borderTopRightRadius: 22,
              }}
            >
              <View className="flex-row items-center justify-between">
                <ClayChip label={statusLabel} tone={tone} />
                {event?.isHost ? (
                  <View
                    className="flex-row items-center rounded-full px-2.5 py-1"
                    style={{ backgroundColor: "#fff", gap: 4 }}
                  >
                    <Ionicons
                      name="star"
                      size={12}
                      color={clay.warning}
                    />
                    <Text
                      className="text-[11.5px] font-bold"
                      style={{ color: clay.warning }}
                    >
                      Host
                    </Text>
                  </View>
                ) : null}
              </View>

              <Text
                className="mt-3 text-[22px] font-extrabold leading-7 text-slate-900"
                style={{ letterSpacing: -0.3 }}
              >
                {event?.title}
              </Text>

              <View className="mt-3 flex-row items-center" style={{ gap: 10 }}>
                <Avatar
                  name={displayName(event?.host)}
                  uri={event?.host?.imageUrl}
                  size={34}
                />
                <View className="flex-1">
                  <Text className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Hosted by
                  </Text>
                  <Text className="mt-0.5 text-[13.5px] font-bold text-slate-800">
                    {displayName(event?.host)}
                  </Text>
                </View>
              </View>
            </View>
          </ClayCard>

          {/* Date & time */}
          {dateParts ? (
            <SectionCard title="Date & time" icon="calendar-outline">
              <View style={{ paddingTop: 4 }}>
                <InfoRow
                  icon="calendar"
                  label="Date"
                  value={`${dateParts.weekday}, ${dateParts.date}`}
                />
                <InfoRow
                  icon="time-outline"
                  label="Time"
                  value={dateParts.time}
                />
              </View>
            </SectionCard>
          ) : null}

          {/* Location */}
          {event?.location ? (
            <SectionCard title="Location" icon="location-outline">
              <View className="flex-row items-center" style={{ gap: 10 }}>
                <Ionicons name="location" size={18} color={clay.primary} />
                <Text className="flex-1 text-[14px] font-medium leading-5 text-slate-700">
                  {event.location}
                </Text>
              </View>
              <PressableRow
                onPress={() =>
                  Alert.alert("Open map", "Map view is coming soon.")
                }
              >
                <View
                  className="mt-3 flex-row items-center self-start rounded-full px-3 py-1.5"
                  style={{ backgroundColor: clay.primarySoft, gap: 5 }}
                >
                  <Ionicons name="map-outline" size={14} color={clay.primary} />
                  <Text className="text-[12px] font-bold" style={{ color: clay.primaryDeep }}>
                    View on map
                  </Text>
                </View>
              </PressableRow>
            </SectionCard>
          ) : null}

          {/* Description */}
          {event?.description ? (
            <SectionCard title="About" icon="document-text-outline">
              <Text className="text-[14px] font-medium leading-[21px] text-slate-600">
                {event.description}
              </Text>
            </SectionCard>
          ) : null}

          {/* Attendees */}
          <SectionCard
            title={`Going (${attendees.length})`}
            icon="people-outline"
          >
            {attendees.length === 0 ? (
              <Text className="py-2 text-[13px] font-medium text-slate-400">
                No one has joined yet.
              </Text>
            ) : (
              attendees.map((user) => (
                <AttendeeRow key={user._id} user={user} />
              ))
            )}
          </SectionCard>

          {/* Pending invites */}
          {pending.length > 0 ? (
            <SectionCard
              title={`Invited (${pending.length})`}
              icon="mail-outline"
            >
              {pending.map((user) => (
                <AttendeeRow key={user._id} user={user} />
              ))}
            </SectionCard>
          ) : null}

        </ScrollView>
      )}
    </SafeAreaView>
  );
}
