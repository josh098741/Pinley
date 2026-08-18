import { useMemo, useState } from "react";
import {
  Keyboard,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import {
  Avatar,
  ClayButton,
  clay,
  displayName,
} from "../components/clay";

import { useEvents } from "../context/EventsContext";
import { useRequests } from "../context/RequestsContext";

const DAY_COUNT = 30;
const DAY_MS = 86400000;

function buildDays(count) {
  const base = new Date();

  const start = new Date(
    base.getFullYear(),
    base.getMonth(),
    base.getDate()
  );

  return Array.from(
    { length: count },
    (_, i) => new Date(start.getTime() + i * DAY_MS)
  );
}

const TIME_SLOTS = Array.from({ length: 17 }, (_, i) => {
  const d = new Date();
  d.setHours(6 + i, 0, 0, 0);
  return d;
});

/* -------------------------------------------------------
   Section label
------------------------------------------------------- */

function SectionLabel({ icon, children, right }) {
  return (
    <View className="mb-3 flex-row items-center justify-between">
      <View className="flex-row items-center">
        <View
          className="mr-2 h-8 w-8 items-center justify-center rounded-full"
          style={{
            backgroundColor: "#F1E9FF",
          }}
        >
          <Ionicons name={icon} size={17} color={clay.primary} />
        </View>

        <Text
          className="text-[15px] font-extrabold"
          style={{
            color: clay.primaryDeep,
          }}
        >
          {children}
        </Text>
      </View>

      {right}
    </View>
  );
}

/* -------------------------------------------------------
   Date chip
------------------------------------------------------- */

function DayChip({ date, selected, onPress }) {
  const weekday = date.toLocaleDateString("en-US", {
    weekday: "short",
  });

  const day = date.getDate();

  const month = date.toLocaleDateString("en-US", {
    month: "short",
  });

  return (
    <Pressable
      onPress={onPress}
      className="items-center justify-center rounded-[20px]"
      style={{
        width: 82,
        height: 112,
        marginRight: 12,

        backgroundColor: selected ? "#FAF7FF" : "#FFFFFF",

        borderWidth: selected ? 2 : 1,
        borderColor: selected ? clay.primary : "#E9E4F4",

        shadowColor: "#4C1D95",
        shadowOpacity: selected ? 0.12 : 0.04,
        shadowRadius: selected ? 10 : 5,
        shadowOffset: {
          width: 0,
          height: 4,
        },

        elevation: selected ? 3 : 1,
      }}
    >
      <Text
        className="text-[12px] font-extrabold uppercase"
        style={{
          color: selected ? clay.primary : "#64748B",
        }}
      >
        {weekday}
      </Text>

      <Text
        className="mt-1 text-[28px] font-extrabold"
        style={{
          color: selected ? "#17132B" : "#1E293B",
        }}
      >
        {day}
      </Text>

      <Text
        className="mt-1 text-[12px] font-semibold"
        style={{
          color: selected ? "#8A7FA6" : "#94A3B8",
        }}
      >
        {month}
      </Text>

      {selected ? (
        <View
          className="absolute bottom-2 h-1.5 w-7 rounded-full"
          style={{
            backgroundColor: clay.primary,
          }}
        />
      ) : null}
    </Pressable>
  );
}

/* -------------------------------------------------------
   Time chip
------------------------------------------------------- */

function TimeChip({ time, selected, onPress }) {
  const label = time.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <Pressable
      onPress={onPress}
      className="items-center justify-center rounded-full"
      style={{
        width: "23%",
        minHeight: 48,
        marginBottom: 10,

        backgroundColor: selected ? clay.primary : "#FAF8FF",

        borderWidth: 1,
        borderColor: selected ? clay.primary : "#E5DFF2",

        shadowColor: clay.primaryDeep,
        shadowOpacity: selected ? 0.16 : 0,
        shadowRadius: 8,
        shadowOffset: {
          width: 0,
          height: 3,
        },

        elevation: selected ? 2 : 0,
      }}
    >
      {selected ? (
        <View className="flex-row items-center">
          <Ionicons
            name="time-outline"
            size={15}
            color="#FFFFFF"
            style={{ marginRight: 5 }}
          />

          <Text className="text-[13px] font-extrabold text-white">
            {label}
          </Text>
        </View>
      ) : (
        <Text
          className="text-[13px] font-bold"
          style={{
            color: clay.primaryDeep,
          }}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

/* -------------------------------------------------------
   Invite row
------------------------------------------------------- */

function InviteRow({ user, selected, onToggle }) {
  return (
    <Pressable
      onPress={onToggle}
      className="flex-row items-center py-3"
    >
      <View
        className="rounded-full"
        style={{
          borderWidth: 2,
          borderColor: "#EDE9FE",
          padding: 2,
        }}
      >
        <Avatar
          name={displayName(user)}
          uri={user.imageUrl}
          size={42}
        />
      </View>

      <View className="ml-3 flex-1">
        <Text
          numberOfLines={1}
          className="text-[14px] font-bold text-slate-900"
        >
          {displayName(user)}
        </Text>

        <Text
          numberOfLines={1}
          className="mt-0.5 text-[12px] font-medium text-slate-500"
        >
          {user.email || user.username}
        </Text>
      </View>

      <View
        className="h-7 w-7 items-center justify-center rounded-full"
        style={{
          backgroundColor: selected ? clay.primary : "#FFFFFF",
          borderWidth: 2,
          borderColor: selected ? clay.primary : "#DDD6FE",
        }}
      >
        {selected ? (
          <Ionicons
            name="checkmark"
            size={16}
            color="#FFFFFF"
          />
        ) : null}
      </View>
    </Pressable>
  );
}

/* -------------------------------------------------------
   Main screen
------------------------------------------------------- */

export default function CreateEvent() {
  const router = useRouter();

  const { createEvent } = useEvents();
  const { connections } = useRequests();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  const [invitees, setInvitees] = useState(() => new Set());

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const days = useMemo(() => buildDays(DAY_COUNT), []);

  const inviteList = useMemo(
    () => connections || [],
    [connections]
  );

  const canSubmit =
    Boolean(
      title.trim() &&
        selectedDate &&
        selectedTime
    ) && !submitting;

  const toggleInvitee = (id) => {
    setInvitees((prev) => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  const handleSubmit = async () => {
    setError("");

    if (!title.trim()) {
      setError("Add a title for your event.");
      return;
    }

    if (!selectedDate) {
      setError("Pick a date for your event.");
      return;
    }

    if (!selectedTime) {
      setError("Pick a time for your event.");
      return;
    }

    const date = new Date(selectedDate);

    date.setHours(
      selectedTime.getHours(),
      selectedTime.getMinutes(),
      0,
      0
    );

    setSubmitting(true);

    try {
      const created = await createEvent({
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        date: date.toISOString(),
        attendeeIds: [...invitees],
      });

      if (!created) {
        throw new Error("Could not create the event.");
      }

      router.back();
    } catch (err) {
      setError(
        err?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{
        backgroundColor: "#F8F6FF",
      }}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F8F6FF"
      />

      {/* -------------------------------------------------
          Header
      ------------------------------------------------- */}

      <View
        className="px-5 pt-2"
        style={{
          paddingBottom: 12,
        }}
      >
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => router.back()}
            className="h-12 w-12 items-center justify-center rounded-full"
            style={{
              backgroundColor: "#FFFFFF",
              borderWidth: 1,
              borderColor: "#E9E4F4",

              shadowColor: "#4C1D95",
              shadowOpacity: 0.06,
              shadowRadius: 8,
              shadowOffset: {
                width: 0,
                height: 3,
              },

              elevation: 2,
            }}
          >
            <Ionicons
              name="close"
              size={24}
              color="#172033"
            />
          </Pressable>

          <View className="flex-row items-center">
            <View
              className="mr-3 h-11 w-11 items-center justify-center rounded-2xl"
              style={{
                backgroundColor: "#EEE4FF",
              }}
            >
              <Ionicons
                name="calendar"
                size={22}
                color={clay.primary}
              />
            </View>

            <Text className="text-[23px] font-extrabold text-slate-900">
              Create event
            </Text>
          </View>

          <View className="w-12" />
        </View>
      </View>

      {/* -------------------------------------------------
          Content
      ------------------------------------------------- */}

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 35,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Error */}

        {error ? (
          <View
            className="mb-4 flex-row items-center rounded-2xl px-4 py-3"
            style={{
              backgroundColor: "#FFF1F2",
              borderWidth: 1,
              borderColor: "#FECDD3",
            }}
          >
            <Ionicons
              name="alert-circle"
              size={18}
              color="#E11D48"
            />

            <Text className="ml-2 flex-1 text-[13px] font-semibold text-rose-600">
              {error}
            </Text>
          </View>
        ) : null}

        {/* -------------------------------------------------
            Event title
        ------------------------------------------------- */}

        <View
          className="mb-4 rounded-[26px] p-5"
          style={{
            backgroundColor: "#FFFFFF",
            shadowColor: "#4C1D95",
            shadowOpacity: 0.045,
            shadowRadius: 12,
            shadowOffset: {
              width: 0,
              height: 4,
            },
            elevation: 1,
          }}
        >
          <SectionLabel icon="text-outline">
            Event title
          </SectionLabel>

          <View
            className="flex-row items-center rounded-2xl px-4"
            style={{
              minHeight: 58,
              backgroundColor: "#FFFFFF",
              borderWidth: 1.5,
              borderColor: "#DDD6FE",
            }}
          >
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Sunset picnic at the park"
              placeholderTextColor="#9CA3AF"
              returnKeyType="next"
              onSubmitEditing={() => Keyboard.dismiss()}
              className="flex-1 text-[16px] font-semibold text-slate-900"
            />

            <Ionicons
              name="sparkles"
              size={21}
              color={clay.primary}
            />
          </View>
        </View>

        {/* -------------------------------------------------
            Date
        ------------------------------------------------- */}

        <View
          className="mb-4 rounded-[26px] p-5"
          style={{
            backgroundColor: "#FFFFFF",
            shadowColor: "#4C1D95",
            shadowOpacity: 0.045,
            shadowRadius: 12,
            shadowOffset: {
              width: 0,
              height: 4,
            },
            elevation: 1,
          }}
        >
          <SectionLabel icon="calendar-outline">
            Date
          </SectionLabel>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingRight: 8,
            }}
          >
            {days.map((date) => (
              <DayChip
                key={date.toISOString()}
                date={date}
                selected={
                  selectedDate &&
                  selectedDate.toDateString() ===
                    date.toDateString()
                }
                onPress={() => setSelectedDate(date)}
              />
            ))}
          </ScrollView>
        </View>

        {/* -------------------------------------------------
            Time
        ------------------------------------------------- */}

        <View
          className="mb-4 rounded-[26px] p-5"
          style={{
            backgroundColor: "#FFFFFF",
            shadowColor: "#4C1D95",
            shadowOpacity: 0.045,
            shadowRadius: 12,
            shadowOffset: {
              width: 0,
              height: 4,
            },
            elevation: 1,
          }}
        >
          <SectionLabel icon="time-outline">
            Time
          </SectionLabel>

          <View
            className="flex-row flex-wrap justify-between"
          >
            {TIME_SLOTS.map((time) => (
              <TimeChip
                key={time.toISOString()}
                time={time}
                selected={
                  selectedTime &&
                  selectedTime.getHours() ===
                    time.getHours() &&
                  selectedTime.getMinutes() ===
                    time.getMinutes()
                }
                onPress={() => setSelectedTime(time)}
              />
            ))}
          </View>
        </View>

        {/* -------------------------------------------------
            Location
        ------------------------------------------------- */}

        <View
          className="mb-4 rounded-[26px] p-5"
          style={{
            backgroundColor: "#FFFFFF",
            shadowColor: "#4C1D95",
            shadowOpacity: 0.045,
            shadowRadius: 12,
            shadowOffset: {
              width: 0,
              height: 4,
            },
            elevation: 1,
          }}
        >
          <SectionLabel icon="location-outline">
            Location
            <Text className="text-[12px] font-medium text-slate-400">
              {" "}
              (optional)
            </Text>
          </SectionLabel>

          <View
            className="flex-row items-center rounded-2xl px-4"
            style={{
              minHeight: 58,
              borderWidth: 1.5,
              borderColor: "#DDD6FE",
              backgroundColor: "#FFFFFF",
            }}
          >
            <Ionicons
              name="search-outline"
              size={21}
              color="#94A3B8"
            />

            <TextInput
              value={location}
              onChangeText={setLocation}
              placeholder="Add a place or address"
              placeholderTextColor="#94A3B8"
              returnKeyType="next"
              onSubmitEditing={() => Keyboard.dismiss()}
              className="ml-3 flex-1 text-[15px] font-semibold text-slate-900"
            />

            <Pressable
              className="flex-row items-center rounded-full px-3 py-2"
              style={{
                backgroundColor: "#F1E9FF",
              }}
            >
              <Ionicons
                name="map-outline"
                size={17}
                color={clay.primary}
              />

              <Text
                className="ml-1.5 text-[12px] font-extrabold"
                style={{
                  color: clay.primaryDeep,
                }}
              >
                Map
              </Text>
            </Pressable>
          </View>
        </View>

        {/* -------------------------------------------------
            Description
        ------------------------------------------------- */}

        <View
          className="mb-4 rounded-[26px] p-5"
          style={{
            backgroundColor: "#FFFFFF",
            shadowColor: "#4C1D95",
            shadowOpacity: 0.045,
            shadowRadius: 12,
            shadowOffset: {
              width: 0,
              height: 4,
            },
            elevation: 1,
          }}
        >
          <SectionLabel icon="document-text-outline">
            Description
            <Text className="text-[12px] font-medium text-slate-400">
              {" "}
              (optional)
            </Text>
          </SectionLabel>

          <View
            className="rounded-2xl px-4 pt-3"
            style={{
              minHeight: 120,
              borderWidth: 1.5,
              borderColor: "#DDD6FE",
              backgroundColor: "#FFFFFF",
            }}
          >
            <TextInput
              value={description}
              onChangeText={(text) => {
                if (text.length <= 300) {
                  setDescription(text);
                }
              }}
              placeholder="What's this event about?"
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={4}
              maxLength={300}
              textAlignVertical="top"
              className="flex-1 text-[15px] font-medium leading-5 text-slate-700"
            />

            <Text className="pb-3 text-right text-[11px] font-semibold text-slate-400">
              {description.length}/300
            </Text>
          </View>
        </View>

        {/* -------------------------------------------------
            Invite circles
        ------------------------------------------------- */}

        <View
          className="mb-4 rounded-[26px] p-5"
          style={{
            backgroundColor: "#FFFFFF",
            shadowColor: "#4C1D95",
            shadowOpacity: 0.045,
            shadowRadius: 12,
            shadowOffset: {
              width: 0,
              height: 4,
            },
            elevation: 1,
          }}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <SectionLabel
                icon="people-outline"
                right={
                  invitees.size > 0 ? (
                    <Text
                      className="text-[12px] font-extrabold"
                      style={{
                        color: clay.primary,
                      }}
                    >
                      {invitees.size} selected
                    </Text>
                  ) : null
                }
              >
                Invite your circles
                <Text className="text-[12px] font-medium text-slate-400">
                  {" "}
                  (optional)
                </Text>
              </SectionLabel>
            </View>

            {inviteList.length === 0 ? (
              <Ionicons
                name="chevron-forward"
                size={20}
                color={clay.primary}
              />
            ) : null}
          </View>

          {inviteList.length === 0 ? (
            <Text className="mt-1 text-[13px] font-medium leading-5 text-slate-400">
              No connections yet — you can invite people
              after creating the event.
            </Text>
          ) : (
            <View>
              {inviteList.map((user, index) => (
                <View
                  key={user._id}
                  style={
                    index > 0
                      ? {
                          borderTopWidth: 1,
                          borderTopColor: "#F1EEF7",
                        }
                      : undefined
                  }
                >
                  <InviteRow
                    user={user}
                    selected={invitees.has(user._id)}
                    onToggle={() =>
                      toggleInvitee(user._id)
                    }
                  />
                </View>
              ))}
            </View>
          )}
        </View>

        {/* -------------------------------------------------
            Create button
        ------------------------------------------------- */}

        <View
          className="mt-1 rounded-full"
          style={{
            opacity: canSubmit ? 1 : 0.55,
            shadowColor: clay.primaryDeep,
            shadowOpacity: canSubmit ? 0.22 : 0,
            shadowRadius: 12,
            shadowOffset: {
              width: 0,
              height: 5,
            },
            elevation: canSubmit ? 4 : 0,
          }}
        >
          <ClayButton
            label={
              submitting
                ? "Creating…"
                : "Create event"
            }
            icon={
              submitting
                ? null
                : "checkmark"
            }
            onPress={handleSubmit}
            disabled={!canSubmit}
            loading={submitting}
            style={{
              minHeight: 58,
              borderRadius: 30,
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}