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
  ClayCard,
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
  return Array.from({ length: count }, (_, i) => new Date(start.getTime() + i * DAY_MS));
}

const TIME_SLOTS = Array.from({ length: 17 }, (_, i) => {
  const d = new Date();
  d.setHours(6 + i, 0, 0, 0);
  return d;
});

function FieldLabel({ icon, children }) {
  return (
    <View className="mb-2 flex-row items-center gap-1.5">
      <Ionicons name={icon} size={14} color={clay.primary} />
      <Text className="text-[13px] font-bold" style={{ color: clay.primaryDeep }}>
        {children}
      </Text>
    </View>
  );
}

function DayChip({ date, selected, onPress }) {
  const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
  const day = date.getDate();
  return (
    <Pressable
      onPress={onPress}
      className="items-center justify-center rounded-2xl"
      style={{
        width: 52,
        height: 62,
        marginRight: 10,
        backgroundColor: selected ? clay.primary : "#fff",
        borderWidth: 1.5,
        borderColor: selected ? clay.primary : clay.primaryBorder,
        shadowColor: clay.primaryDeep,
        shadowOpacity: selected ? 0.18 : 0,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: selected ? 3 : 0,
      }}
    >
      <Text
        className="text-[10px] font-bold uppercase tracking-wide"
        style={{ color: selected ? "#fff" : clay.muted }}
      >
        {weekday}
      </Text>
      <Text
        className="mt-0.5 text-[18px] font-extrabold leading-5"
        style={{ color: selected ? "#fff" : clay.ink }}
      >
        {day}
      </Text>
      <Text
        className="text-[10px] font-semibold"
        style={{ color: selected ? "rgba(255,255,255,0.85)" : clay.faint }}
      >
        {date.toLocaleDateString("en-US", { month: "short" })}
      </Text>
    </Pressable>
  );
}

function TimeChip({ time, selected, onPress }) {
  const label = time.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  return (
    <Pressable
      onPress={onPress}
      className="items-center justify-center rounded-full px-3.5 py-2"
      style={{
        backgroundColor: selected ? clay.primary : clay.primarySoft,
        borderWidth: 1,
        borderColor: selected ? clay.primary : clay.primaryBorder,
        marginRight: 8,
        marginBottom: 8,
      }}
    >
      <Text
        className="text-[12.5px] font-bold"
        style={{ color: selected ? "#fff" : clay.primaryDeep }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function InviteRow({ user, selected, onToggle }) {
  return (
    <Pressable
      onPress={onToggle}
      className="flex-row items-center"
      style={{ paddingVertical: 10 }}
    >
      <View className="rounded-full" style={{ borderWidth: 2, borderColor: "#EDE9FE" }}>
        <Avatar name={displayName(user)} uri={user.imageUrl} size={42} />
      </View>
      <View className="ml-3 flex-1">
        <Text numberOfLines={1} className="text-[14.5px] font-bold text-slate-900">
          {displayName(user)}
        </Text>
        <Text numberOfLines={1} className="mt-0.5 text-[12px] font-medium text-slate-500">
          {user.email || user.username}
        </Text>
      </View>
      <View
        className="items-center justify-center rounded-full"
        style={{
          width: 26,
          height: 26,
          backgroundColor: selected ? clay.primary : "#fff",
          borderWidth: 2,
          borderColor: selected ? clay.primary : clay.primaryBorder,
        }}
      >
        {selected ? (
          <Ionicons name="checkmark" size={16} color="#fff" />
        ) : null}
      </View>
    </Pressable>
  );
}

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
  const inviteList = useMemo(() => connections || [], [connections]);

  const canSubmit = Boolean(title.trim() && selectedDate && selectedTime) && !submitting;

  const toggleInvitee = (id) => {
    setInvitees((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
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
    date.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);

    setSubmitting(true);
    try {
      const created = await createEvent({
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        date: date.toISOString(),
        attendeeIds: [...invitees],
      });
      if (!created) throw new Error("Could not create the event.");
      router.back();
    } catch (err) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: clay.bg }}>
      <StatusBar barStyle="dark-content" backgroundColor={clay.bg} />
      <View className="flex-1 px-5 pt-3">
        {/* Header */}
        <View className="mb-4 flex-row items-center justify-between">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-white border border-violet-200"
            style={{
              shadowColor: "#000",
              shadowOpacity: 0.05,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 2 },
            }}
          >
            <Ionicons name="close" size={20} color={clay.ink} />
          </Pressable>
          <View className="flex-row items-center gap-2">
            <View
              className="h-7 w-7 items-center justify-center rounded-full"
              style={{ backgroundColor: clay.primarySoft }}
            >
              <Ionicons name="calendar" size={14} color={clay.primary} />
            </View>
            <Text className="text-[18px] font-bold text-slate-900">Create event</Text>
          </View>
          <View className="w-10" />
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 40, paddingTop: 4 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {error ? (
            <View className="mb-4 flex-row items-center gap-2 rounded-2xl bg-rose-50 border border-rose-200 px-4 py-3">
              <Ionicons name="alert-circle" size={16} color={clay.danger} />
              <Text className="flex-1 text-[13px] font-semibold text-rose-600">
                {error}
              </Text>
            </View>
          ) : null}

          {/* Title */}
          <ClayCard style={{ marginBottom: 16 }}>
            <FieldLabel icon="text">Event title</FieldLabel>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Sunset picnic at the park"
              placeholderTextColor={clay.faint}
              returnKeyType="next"
              onSubmitEditing={() => Keyboard.dismiss()}
              className="text-[15.5px] font-semibold text-slate-900"
            />
          </ClayCard>

          {/* Date */}
          <View className="mb-2">
            <FieldLabel icon="calendar-outline">Date</FieldLabel>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 10 }}
            >
              {days.map((d) => (
                <DayChip
                  key={d.toISOString()}
                  date={d}
                  selected={selectedDate && selectedDate.toDateString() === d.toDateString()}
                  onPress={() => setSelectedDate(d)}
                />
              ))}
            </ScrollView>
          </View>

          {/* Time */}
          <View className="mt-4 mb-2">
            <FieldLabel icon="time-outline">Time</FieldLabel>
            <View className="flex-row flex-wrap">
              {TIME_SLOTS.map((t) => (
                <TimeChip
                  key={t.toISOString()}
                  time={t}
                  selected={
                    selectedTime &&
                    selectedTime.getHours() === t.getHours() &&
                    selectedTime.getMinutes() === t.getMinutes()
                  }
                  onPress={() => setSelectedTime(t)}
                />
              ))}
            </View>
          </View>

          {/* Location */}
          <ClayCard style={{ marginTop: 16, marginBottom: 16 }}>
            <FieldLabel icon="location-outline">Location</FieldLabel>
            <TextInput
              value={location}
              onChangeText={setLocation}
              placeholder="Add a place or address (optional)"
              placeholderTextColor={clay.faint}
              returnKeyType="next"
              onSubmitEditing={() => Keyboard.dismiss()}
              className="text-[15.5px] font-semibold text-slate-900"
            />
          </ClayCard>

          {/* Description */}
          <ClayCard style={{ marginBottom: 16 }}>
            <FieldLabel icon="document-text-outline">Description</FieldLabel>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="What's this event about? (optional)"
              placeholderTextColor={clay.faint}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              className="min-h-[64px] text-[15px] font-medium leading-5 text-slate-700"
            />
          </ClayCard>

          {/* Invite circles */}
          <ClayCard style={{ marginBottom: 16 }}>
            <View className="mb-1 flex-row items-center justify-between">
              <FieldLabel icon="people">Invite your circles</FieldLabel>
              {invitees.size > 0 ? (
                <Text className="text-[12px] font-bold" style={{ color: clay.primary }}>
                  {invitees.size} selected
                </Text>
              ) : null}
            </View>
            {inviteList.length === 0 ? (
              <Text className="mt-1 text-[13px] font-medium text-slate-400">
                No connections yet — you can invite people after creating the event.
              </Text>
            ) : (
              inviteList.map((user, i) => (
                <View
                  key={user._id}
                  style={
                    i > 0
                      ? { borderTopWidth: 1, borderTopColor: clay.line }
                      : undefined
                  }
                >
                  <InviteRow
                    user={user}
                    selected={invitees.has(user._id)}
                    onToggle={() => toggleInvitee(user._id)}
                  />
                </View>
              ))
            )}
          </ClayCard>

          <ClayButton
            label={submitting ? "Creating…" : "Create event"}
            icon={submitting ? null : "checkmark"}
            onPress={handleSubmit}
            disabled={!canSubmit}
            loading={submitting}
            style={{ marginTop: 4 }}
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
