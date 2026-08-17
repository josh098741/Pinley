import { StatusBar, Text, View, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { clay } from "../components/clay";
import { ClayCard, ClayChip, SectionTitle, EmptyState } from "../components/clay";

const EVENTS = [
  {
    title: "Sunset Beach Walk",
    host: "Maya Chen",
    date: "Today",
    time: "6:30 PM",
    location: "Venice Beach, CA",
    attendees: 12,
    tone: "success",
  },
  {
    title: "Late Night Study",
    host: "Jordan Lee",
    date: "Tomorrow",
    time: "9:00 PM",
    location: "Central Library",
    attendees: 4,
    tone: "pending",
  },
  {
    title: "Morning Run Club",
    host: "Alex Rivera",
    date: "Sat",
    time: "7:00 AM",
    location: "Riverside Park",
    attendees: 28,
    tone: "muted",
  },
  {
    title: "Rooftop Party",
    host: "Sam Patel",
    date: "Sat",
    time: "8:00 PM",
    location: "Downtown Loft",
    attendees: 40,
    tone: "danger",
  },
];

export default function Events() {
  const router = useRouter();

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
            className="flex-row items-center gap-1 rounded-full bg-white px-3 py-2"
            style={{
              shadowColor: "#000",
              shadowOpacity: 0.06,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 2 },
            }}
            onPress={() => {
              // 👉 navigate to create event
            }}
          >
            <Ionicons name="add" size={16} color={clay.purple} />
            <Text
              className="text-[12.5px] font-bold"
              style={{ color: clay.purple }}
            >
              New
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          className="mt-5"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <SectionTitle title="Upcoming" count={EVENTS.length} />

          {EVENTS.length === 0 ? (
            <EmptyState
              icon="calendar"
              title="No events yet"
              subtitle="Create an event or join one from your circles to see it here."
            />
          ) : (
            EVENTS.map((event, i) => (
              <ClayCard
                key={i}
                style={{ marginTop: i === 0 ? 0 : 12 }}
                onPress={() => {
                  // 👉 navigate to event details
                }}
              >
                <View className="flex-row items-start">
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
                    <Ionicons name="calendar" size={22} color={clay.primary} />
                  </View>

                  <View className="flex-1" style={{ marginLeft: 12 }}>
                    <View className="flex-row items-center justify-between">
                      <Text className="text-[15.5px] font-bold text-slate-900">
                        {event.title}
                      </Text>
                      <ClayChip label={event.date} tone={event.tone} />
                    </View>

                    <Text className="mt-1 text-[12.5px] font-medium text-slate-500">
                      Hosted by {event.host}
                    </Text>

                    <View
                      className="mt-2.5 flex-row items-center"
                      style={{ gap: 14 }}
                    >
                      <View className="flex-row items-center gap-1">
                        <Ionicons
                          name="time"
                          size={14}
                          color={clay.muted}
                        />
                        <Text className="text-[12.5px] font-semibold text-slate-600">
                          {event.time}
                        </Text>
                      </View>
                      <View className="flex-row items-center gap-1">
                        <Ionicons
                          name="location"
                          size={14}
                          color={clay.muted}
                        />
                        <Text className="text-[12.5px] font-semibold text-slate-600">
                          {event.location}
                        </Text>
                      </View>
                    </View>

                    <View
                      className="mt-2.5 flex-row items-center justify-between"
                      style={{
                        paddingTop: 10,
                        borderTopWidth: 1,
                        borderTopColor: clay.line,
                      }}
                    >
                      <View className="flex-row items-center gap-1">
                        <Ionicons
                          name="people"
                          size={14}
                          color={clay.primary}
                        />
                        <Text
                          className="text-[12px] font-bold"
                          style={{ color: clay.primaryDeep }}
                        >
                          {event.attendees} going
                        </Text>
                      </View>
                      <View className="flex-row items-center gap-0.5">
                        <Text
                          className="text-[12px] font-bold"
                          style={{ color: clay.purple }}
                        >
                          View
                        </Text>
                        <Ionicons
                          name="chevron-forward"
                          size={14}
                          color={clay.purple}
                        />
                      </View>
                    </View>
                  </View>
                </View>
              </ClayCard>
            ))
          )}

          {/* Create event banner */}
          <ClayCard
            style={{ marginTop: 16, padding: 0, overflow: "hidden" }}
            onPress={() => {
              // 👉 navigate to create event
            }}
          >
            <LinearGradient
              colors={[clay.primary, clay.primaryDeep]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="flex-row items-center justify-between px-5 py-4"
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
              <Ionicons name="chevron-forward" size={20} color="#fff" />
            </LinearGradient>
          </ClayCard>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
