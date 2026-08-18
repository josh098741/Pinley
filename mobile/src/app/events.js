import {
  ActivityIndicator,
  StatusBar,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { ClayCard, SectionTitle, clay } from "../components/clay";
import { useEvents } from "../context/EventsContext";

const CARD_BORDER = {
  borderWidth: 2,
  borderColor: clay.primary,
};

const TONE_BY_STATUS = {
  going: "success",
  attending: "success",
  pending: "pending",
  maybe: "pending",
  invited: "muted",
  cancelled: "danger",
};

const STATUS_LABEL = {
  going: "You're going",
  attending: "You're going",
  pending: "Pending",
  maybe: "Maybe",
  invited: "Invited",
  cancelled: "Cancelled",
};

function Sparkle({ top, left, size = 8, opacity = 0.5 }) {
  return (
    <View style={{ position: "absolute", top, left }}>
      <Ionicons name="sparkles" size={size} color="#fff" style={{ opacity }} />
    </View>
  );
}

function HeroBanner({ onLearnMore }) {
  return (
    <ClayCard style={{ marginTop: 16, padding: 0, overflow: "hidden", ...CARD_BORDER }}>
      <View
        className="flex-row items-center px-5 py-5"
        style={{ backgroundColor: clay.primarySoft, borderRadius: 24 }}
      >
        {/* Decorative sparkles */}
        <Sparkle top={8} left={70} size={10} opacity={0.55} />
        <Sparkle top={40} left={100} size={7} opacity={0.4} />
        <Sparkle top={70} left={65} size={6} opacity={0.35} />

        <View className="flex-1" style={{ paddingRight: 12 }}>
          <View
            className="items-center justify-center rounded-2xl"
            style={{
              width: 34,
              height: 34,
              backgroundColor: "#fff",
              marginBottom: 10,
            }}
          >
            <Ionicons name="calendar" size={17} color={clay.primary} />
          </View>

          <Text
            className="text-[15.5px] font-bold"
            style={{ color: clay.primaryDeep }}
          >
            Bring people together
          </Text>
          <Text className="mt-1.5 text-[12.5px] font-medium leading-[17px] text-slate-600">
            Create events, invite your circles and share live location for
            safer meetups.
          </Text>

          <TouchableOpacity
            className="mt-3 self-start flex-row items-center rounded-full px-3.5 py-2"
            style={{ backgroundColor: "#fff" }}
            onPress={onLearnMore}
          >
            <Text
              className="text-[12.5px] font-bold"
              style={{ color: clay.primaryDeep }}
            >
              Learn more
            </Text>
            <Ionicons
              name="chevron-forward"
              size={14}
              color={clay.primaryDeep}
              style={{ marginLeft: 2 }}
            />
          </TouchableOpacity>
        </View>

        <Image
          source={require("../../assets/images/events_calendar.png")}
          style={{ width: 108, height: 108 }}
          resizeMode="contain"
        />
      </View>
    </ClayCard>
  );
}

function DateBadge({ event }) {
  const month = (event.month || "").slice(0, 3).toUpperCase();
  const day = event.day || "—";

  return (
    <View
      className="items-center justify-center rounded-2xl"
      style={{
        width: 54,
        height: 54,
        backgroundColor: clay.primarySoft,
        borderWidth: 1,
        borderColor: clay.primaryBorder,
      }}
    >
      <Text
        className="text-[10px] font-bold tracking-wide"
        style={{ color: clay.primary }}
      >
        {month || "TBD"}
      </Text>
      <Text
        className="text-[17px] font-extrabold leading-5"
        style={{ color: clay.primaryDeep }}
      >
        {day}
      </Text>
    </View>
  );
}

function AvatarStack({ attendees = 0 }) {
  const shown = Math.min(attendees, 3);

  return (
    <View className="flex-row items-center" style={{ marginRight: 6 }}>
      {Array.from({ length: shown }).map((_, i) => (
        <View
          key={i}
          className="items-center justify-center rounded-full"
          style={{
            width: 20,
            height: 20,
            marginLeft: i === 0 ? 0 : -6,
            backgroundColor: clay.primarySoft,
            borderWidth: 1.5,
            borderColor: "#fff",
          }}
        >
          <Ionicons name="person" size={10} color={clay.primary} />
        </View>
      ))}
    </View>
  );
}

function EventCard({ event, onPress }) {
  const tone = TONE_BY_STATUS[event.status] || "muted";
  const statusLabel = STATUS_LABEL[event.status] || "View";

  return (
    <ClayCard style={{ marginTop: 12, ...CARD_BORDER }} onPress={onPress}>
      <View className="flex-row items-start">
        <DateBadge event={event} />

        <View className="flex-1" style={{ marginLeft: 12 }}>
          <View className="flex-row items-start justify-between">
            <Text className="flex-1 text-[15.5px] font-bold text-slate-900">
              {event.title}
            </Text>
          </View>

          <View className="mt-1.5 flex-row items-center" style={{ gap: 5 }}>
            <Ionicons name="time-outline" size={13} color={clay.muted} />
            <Text className="text-[12.5px] font-semibold text-slate-500">
              {event.dateLabel || event.date} {event.time ? `· ${event.time}` : ""}
            </Text>
          </View>

          {event.location ? (
            <View className="mt-1 flex-row items-center" style={{ gap: 5 }}>
              <Ionicons name="location-outline" size={13} color={clay.muted} />
              <Text className="text-[12.5px] font-semibold text-slate-500">
                {event.location}
              </Text>
            </View>
          ) : null}

          <View
            className="mt-2.5 flex-row items-center justify-between"
            style={{
              paddingTop: 10,
              borderTopWidth: 1,
              borderTopColor: clay.line,
            }}
          >
            <View className="flex-row items-center">
              <AvatarStack attendees={event.attendees || 0} />
              <Text className="text-[12px] font-bold" style={{ color: clay.primaryDeep }}>
                {typeof event.attendees === "number"
                  ? `${event.attendees} going`
                  : "Join event"}
              </Text>
            </View>

            <View
              className="flex-row items-center rounded-full px-2.5 py-1"
              style={{ gap: 4, backgroundColor: clay.primarySoft }}
            >
              {tone === "success" ? (
                <Ionicons name="checkmark" size={12} color={clay.primaryDeep} />
              ) : null}
              <Text
                className="text-[11.5px] font-bold"
                style={{ color: clay.primaryDeep }}
              >
                {statusLabel}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ClayCard>
  );
}

const EMPTY_FEATURES = [
  {
    icon: "people",
    title: "Invite your circles",
    subtitle: "Invite members and keep everyone in the loop.",
  },
  {
    icon: "location",
    title: "Share live location",
    subtitle: "Share your location in real-time for added safety.",
  },
  {
    icon: "notifications",
    title: "Get reminders",
    subtitle: "Never miss an event with timely reminders.",
  },
];

function FeatureCard({ icon, title, subtitle, divider }) {
  return (
    <View
      style={{
        flex: 1,
        minWidth: 0,
        alignItems: "center",
        paddingVertical: 16,
        paddingHorizontal: 8,
        borderLeftWidth: divider ? 1 : 0,
        borderLeftColor: clay.line,
      }}
    >
      <View
        className="items-center justify-center rounded-full"
        style={{
          width: 40,
          height: 40,
          backgroundColor: clay.primarySoft,
        }}
      >
        <Ionicons name={icon} size={18} color={clay.primary} />
      </View>
      <Text
        className="mt-2 text-center text-[11.5px] font-bold"
        style={{ color: clay.primaryDeep, flexShrink: 1 }}
        numberOfLines={2}
      >
        {title}
      </Text>
      <Text
        className="mt-1 text-center text-[10.5px] font-medium leading-[13px] text-slate-500"
        style={{ flexShrink: 1 }}
        numberOfLines={3}
      >
        {subtitle}
      </Text>
    </View>
  );
}

function EventsEmptyState({ onCreatePress }) {
  return (
    <View className="mt-3">
      <ClayCard style={CARD_BORDER}>
        <View className="items-center py-2">
          <View
            className="items-center justify-center rounded-2xl"
            style={{ width: 44, height: 44, backgroundColor: clay.primarySoft }}
          >
            <Ionicons name="calendar" size={20} color={clay.primary} />
          </View>
          <Text className="mt-3 text-[14.5px] font-bold text-slate-900">
            No events yet
          </Text>
          <Text className="mt-1 text-center text-[12.5px] font-medium leading-[17px] text-slate-500">
            Create an event or join one from your circles to see it here.
          </Text>

          <TouchableOpacity
            className="mt-4 flex-row items-center rounded-full px-4 py-3"
            style={{ backgroundColor: clay.primary }}
            onPress={onCreatePress}
          >
            <Ionicons name="add" size={16} color="#fff" />
            <Text className="ml-1.5 text-[13px] font-bold text-white">
              Create your first event
            </Text>
          </TouchableOpacity>
        </View>
      </ClayCard>

      <View
        style={{
          marginTop: 24,
          borderWidth: 2.5,
          borderColor: "#E6E4ED",
          borderRadius: 22,
          backgroundColor: "#fff",
          overflow: "hidden",
        }}
      >
        <View className="flex-row" style={{ alignItems: "stretch" }}>
          {EMPTY_FEATURES.map((f, i) => (
            <FeatureCard key={f.title} {...f} divider={i > 0} />
          ))}
        </View>
      </View>
    </View>
  );
}

function CreateEventBanner({ onPress }) {
  return (
    <ClayCard style={{ padding: 0, overflow: "hidden", ...CARD_BORDER }} onPress={onPress}>
      <LinearGradient
        colors={[clay.primary, clay.primaryDeep]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="flex-row items-center justify-between px-5 py-4"
        style={{ borderRadius: 24 }}
      >
        <View className="flex-1 flex-row items-center">
          <View
            className="items-center justify-center rounded-2xl"
            style={{
              width: 44,
              height: 44,
              backgroundColor: "rgba(255,255,255,0.18)",
            }}
          >
            <Ionicons name="add" size={22} color="#fff" />
          </View>
          <View style={{ marginLeft: 12 }}>
            <Text className="text-[15px] font-bold text-white">
              Create an event
            </Text>
            <Text className="mt-0.5 text-[12px] font-medium text-white opacity-90">
              Invite your circles and share live location.
            </Text>
          </View>
        </View>

        <View className="flex-row items-center" style={{ marginLeft: 8 }}>
          <View
            style={{
              width: 22,
              height: 1,
              borderWidth: 1,
              borderStyle: "dashed",
              borderColor: "rgba(255,255,255,0.5)",
              marginRight: 4,
            }}
          />
          <Ionicons
            name="location"
            size={14}
            color="rgba(255,255,255,0.85)"
            style={{ marginRight: 6 }}
          />
          <View
            className="items-center justify-center rounded-full"
            style={{
              width: 30,
              height: 30,
              backgroundColor: "rgba(255,255,255,0.18)",
            }}
          >
            <Ionicons name="chevron-forward" size={16} color="#fff" />
          </View>
        </View>
      </LinearGradient>
    </ClayCard>
  );
}

export default function Events() {
  const router = useRouter();
  const { events, loading } = useEvents();

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: clay.bg }}>
      <StatusBar barStyle="dark-content" backgroundColor={clay.bg} />

      <View className="flex-1 px-5">
        {/* Back button + Header */}
        <View className="mt-2 flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
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

            <View style={{ maxWidth: 230 }}>
              <Text className="text-[20px] font-bold text-slate-900 tracking-tight">
                Events
              </Text>
              <Text className="mt-0.5 text-[12.5px] font-medium leading-4 text-slate-500">
                Plan, join, and stay safe at gatherings with your circles.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            className="flex-row items-center gap-1 rounded-full px-3 py-2"
            style={{ backgroundColor: clay.primary }}
            onPress={() => {
              // 👉 navigate to create event
            }}
          >
            <Ionicons name="add" size={16} color="#fff" />
            <Text className="text-[12.5px] font-bold text-white">
              New event
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          className="mt-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <HeroBanner onLearnMore={() => {
            // 👉 navigate to learn more / info modal
          }} />

          {loading ? (
            <View className="items-center justify-center py-20">
              <ActivityIndicator color={clay.primary} size="large" />
              <Text className="mt-3 text-[13px] font-medium text-slate-400">
                Loading events…
              </Text>
            </View>
          ) : (
            <>
              <View className="mt-5 flex-row items-center justify-between">
                <SectionTitle title="Upcoming" count={events.length} />
                {events.length > 0 ? (
                  <TouchableOpacity onPress={() => {}}>
                    <Text
                      className="text-[13px] font-bold"
                      style={{ color: clay.purple }}
                    >
                      View all
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>

              {events.length === 0 ? (
                <EventsEmptyState
                  onCreatePress={() => {
                    // 👉 navigate to create event
                  }}
                />
              ) : (
                events.map((event) => (
                  <EventCard
                    key={event._id || event.id}
                    event={event}
                    onPress={() => {
                      // 👉 navigate to event details
                    }}
                  />
                ))
              )}

              <View style={{ marginTop: 32 }}>
                <CreateEventBanner
                  onPress={() => {
                    // 👉 navigate to create event
                  }}
                />
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}