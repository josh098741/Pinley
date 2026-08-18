import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Keyboard,
  Pressable,
  StatusBar,
  Text,
  TextInput,
  View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
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

/* -------------------------------------------------------
   Date scroll picker helpers
------------------------------------------------------- */

const ITEM_HEIGHT = 48;
const VISIBLE_ITEMS = 3; // odd number so centre row is obvious
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const HALF_VISIBLE_ITEMS = Math.floor(VISIBLE_ITEMS / 2); // rows padded above/below centre

const MONTH_NAMES = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December",
];

function buildYearList() {
  const current = new Date().getFullYear();
  return Array.from({ length: 5 }, (_, i) => current + i);
}

function buildDayList(month, year) {
  // month is 0-indexed
  const days = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: days }, (_, i) => i + 1);
}

/* -------------------------------------------------------
   Single drum-roll column
------------------------------------------------------- */

function PickerColumn({ data, selectedIndex, onSelect, renderLabel, keyExtractor }) {
  const listRef = useRef(null);
  const isMounting = useRef(true);

  // Gesture Handler's ScrollView (not RN's), so it can live inside the
  // screen's ScrollView and still claim its own vertical pan gesture
  // instead of the outer ScrollView stealing the touch. Lists are tiny,
  // so virtualization is unnecessary here.
  const scrollToOffset = useCallback((offset, animated) => {
    listRef.current?.scrollTo({ y: offset, animated });
  }, []);

  // After layout, jump without animation
  const onLayout = useCallback(() => {
    if (isMounting.current) {
      isMounting.current = false;
      scrollToOffset(selectedIndex * ITEM_HEIGHT, false);
    }
  }, [selectedIndex, scrollToOffset]);

  // When parent changes selected (e.g. month changes → day clamps)
  const prevSelected = useRef(selectedIndex);
  if (prevSelected.current !== selectedIndex) {
    prevSelected.current = selectedIndex;
    // Use a small timeout so the list has settled
    setTimeout(() => scrollToOffset(selectedIndex * ITEM_HEIGHT, true), 50);
  }

  const handleMomentumEnd = useCallback(
    (e) => {
      const index = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(index, data.length - 1));
      onSelect(clamped);
      scrollToOffset(clamped * ITEM_HEIGHT, true);
    },
    [data.length, onSelect, scrollToOffset]
  );

  return (
    <View style={{ flex: 1, height: PICKER_HEIGHT, overflow: "hidden" }}>
      <ScrollView
        ref={listRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        disableIntervalMomentum
        overScrollMode="never"
        nestedScrollEnabled
        onMomentumScrollEnd={handleMomentumEnd}
        onLayout={onLayout}
        // Padding so first/last items can centre — kept in sync with
        // VISIBLE_ITEMS so the highlight bar always lands on the right row.
        contentContainerStyle={{
          paddingTop: ITEM_HEIGHT * HALF_VISIBLE_ITEMS,
          paddingBottom: ITEM_HEIGHT * HALF_VISIBLE_ITEMS,
        }}
      >
        {data.map((item, index) => {
          const isSelected = index === selectedIndex;
          return (
            <Pressable
              key={keyExtractor(item)}
              onPress={() => {
                onSelect(index);
                scrollToOffset(index * ITEM_HEIGHT, true);
              }}
              style={{
                height: ITEM_HEIGHT,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontSize: isSelected ? 17 : 15,
                  fontWeight: isSelected ? "700" : "400",
                  color: isSelected ? "#1E1B4B" : "#94A3B8",
                }}
              >
                {renderLabel(item)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

/* -------------------------------------------------------
   Three-column date picker
------------------------------------------------------- */

function DateScrollPicker({ selectedDate, onDateChange }) {
  const today = new Date();

  const years = useMemo(() => buildYearList(), []);

  // Derive initial indices from selectedDate (or today)
  const initDate = selectedDate || today;
  const [monthIdx, setMonthIdx] = useState(initDate.getMonth());
  const [yearIdx, setYearIdx] = useState(
    Math.max(0, years.indexOf(initDate.getFullYear()))
  );

  const currentYear = years[yearIdx];
  const days = useMemo(() => buildDayList(monthIdx, currentYear), [monthIdx, currentYear]);

  const [dayIdx, setDayIdx] = useState(
    Math.min(initDate.getDate() - 1, days.length - 1)
  );

  // Tracks the most recent date we reported to the parent so we only call
  // onDateChange when the value actually changes (prevents feedback loops).
  const lastEmittedRef = useRef(null);

  // Clamp dayIdx when month/year changes and propagate
  const clampedDayIdx = Math.min(dayIdx, days.length - 1);

  const notify = useCallback(
    (mIdx, dIdx, yIdx) => {
      const yr = years[yIdx];
      const mo = mIdx;
      const daysInMonth = new Date(yr, mo + 1, 0).getDate();
      const day = Math.min(dIdx + 1, daysInMonth);
      const next = new Date(yr, mo, day);

      if (
        lastEmittedRef.current &&
        lastEmittedRef.current.getTime() === next.getTime()
      ) {
        return;
      }

      lastEmittedRef.current = next;
      onDateChange(next);
    },
    [years, onDateChange]
  );

  const dayIdxRef = useRef(dayIdx);
  dayIdxRef.current = dayIdx;

  const handleMonthSelect = useCallback(
    (idx) => {
      const maxDay = buildDayList(idx, years[yearIdx]).length - 1;
      const clamped = Math.min(dayIdxRef.current, maxDay);
      setMonthIdx(idx);
      setDayIdx(clamped);
      notify(idx, clamped, yearIdx);
    },
    [yearIdx, years, notify]
  );

  const handleDaySelect = useCallback(
    (idx) => {
      setDayIdx(idx);
      notify(monthIdx, idx, yearIdx);
    },
    [monthIdx, yearIdx, notify]
  );

  const handleYearSelect = useCallback(
    (idx) => {
      const maxDay = buildDayList(monthIdx, years[idx]).length - 1;
      const clamped = Math.min(dayIdxRef.current, maxDay);
      setYearIdx(idx);
      setDayIdx(clamped);
      notify(monthIdx, clamped, idx);
    },
    [monthIdx, years, notify]
  );

  return (
    <View style={{ position: "relative" }}>
      {/* Selection highlight */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: PICKER_HEIGHT / 2 - ITEM_HEIGHT / 2,
          left: 0,
          right: 0,
          height: ITEM_HEIGHT,
          borderTopWidth: 1,
          borderBottomWidth: 1,
          borderColor: "#8B5CF6",
          backgroundColor: "rgba(139,92,246,0.06)",
          borderRadius: 8,
          zIndex: 10,
        }}
      />

      <View style={{ flexDirection: "row" }}>
        {/* Month column */}
        <PickerColumn
          data={MONTH_NAMES}
          selectedIndex={monthIdx}
          onSelect={handleMonthSelect}
          renderLabel={(m) => m}
          keyExtractor={(m) => m}
        />

        {/* Day column */}
        <PickerColumn
          data={days}
          selectedIndex={clampedDayIdx}
          onSelect={handleDaySelect}
          renderLabel={(d) => String(d)}
          keyExtractor={(d) => String(d)}
        />

        {/* Year column */}
        <PickerColumn
          data={years}
          selectedIndex={yearIdx}
          onSelect={handleYearSelect}
          renderLabel={(y) => String(y)}
          keyExtractor={(y) => String(y)}
        />
      </View>
    </View>
  );
}

/* -------------------------------------------------------
   Time scroll picker
------------------------------------------------------- */

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);       // 1-12
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);     // 0,5,10,...55
const PERIODS = ["AM", "PM"];

function TimeScrollPicker({ selectedTime, onTimeChange }) {
  // Derive initial indices
  const init = selectedTime || (() => { const d = new Date(); return d; })();
  const initH24 = init.getHours();
  const initPeriodIdx = initH24 >= 12 ? 1 : 0;
  const initH12 = initH24 % 12 === 0 ? 12 : initH24 % 12;
  const initMinuteIdx = Math.round(init.getMinutes() / 5) % 12;

  const [hourIdx, setHourIdx] = useState(initH12 - 1);        // 0-11
  const [minuteIdx, setMinuteIdx] = useState(initMinuteIdx);   // 0-11
  const [periodIdx, setPeriodIdx] = useState(initPeriodIdx);   // 0=AM 1=PM

  // Tracks the most recent time we reported to the parent so we only call
  // onTimeChange when the value actually changes (prevents feedback loops).
  const lastEmittedRef = useRef(null);

  const composeTime = useCallback((hIdx, mIdx, pIdx) => {
    const h12 = hIdx + 1;
    const isAM = pIdx === 0;
    let h24 = h12 % 12 + (isAM ? 0 : 12);
    const d = new Date();
    d.setHours(h24, mIdx * 5, 0, 0);
    return d;
  }, []);

  const notify = useCallback(
    (hIdx, mIdx, pIdx) => {
      const next = composeTime(hIdx, mIdx, pIdx);

      if (
        lastEmittedRef.current &&
        lastEmittedRef.current.getTime() === next.getTime()
      ) {
        return;
      }

      lastEmittedRef.current = next;
      onTimeChange(next);
    },
    [composeTime, onTimeChange]
  );

  const handleHour = useCallback(
    (idx) => { setHourIdx(idx); notify(idx, minuteIdx, periodIdx); },
    [minuteIdx, periodIdx, notify]
  );
  const handleMinute = useCallback(
    (idx) => { setMinuteIdx(idx); notify(hourIdx, idx, periodIdx); },
    [hourIdx, periodIdx, notify]
  );
  const handlePeriod = useCallback(
    (idx) => { setPeriodIdx(idx); notify(hourIdx, minuteIdx, idx); },
    [hourIdx, minuteIdx, notify]
  );

  return (
    <View style={{ position: "relative" }}>
      {/* Selection highlight */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: PICKER_HEIGHT / 2 - ITEM_HEIGHT / 2,
          left: 0,
          right: 0,
          height: ITEM_HEIGHT,
          borderTopWidth: 1,
          borderBottomWidth: 1,
          borderColor: "#8B5CF6",
          backgroundColor: "rgba(139,92,246,0.06)",
          borderRadius: 8,
          zIndex: 10,
        }}
      />
      <View style={{ flexDirection: "row" }}>
        <PickerColumn
          data={HOURS}
          selectedIndex={hourIdx}
          onSelect={handleHour}
          renderLabel={(h) => String(h)}
          keyExtractor={(h) => String(h)}
        />
        <PickerColumn
          data={MINUTES}
          selectedIndex={minuteIdx}
          onSelect={handleMinute}
          renderLabel={(m) => String(m).padStart(2, "0")}
          keyExtractor={(m) => String(m)}
        />
        <PickerColumn
          data={PERIODS}
          selectedIndex={periodIdx}
          onSelect={handlePeriod}
          renderLabel={(p) => p}
          keyExtractor={(p) => p}
        />
      </View>
    </View>
  );
}

/* -------------------------------------------------------
   Section label
------------------------------------------------------- */

function SectionLabel({ icon, children, right }) {
  return (
    <View className="mb-2.5 flex-row items-center justify-between">
      <View className="flex-row items-center">
        <Ionicons name={icon} size={18} color="#8B5CF6" style={{ marginRight: 8 }} />
        <Text className="text-[15px] font-semibold text-slate-800">
          {children}
        </Text>
      </View>
      {right}
    </View>
  );
}

/* -------------------------------------------------------
   Floating label input
------------------------------------------------------- */

function FloatingLabelInput({
  label,
  value,
  onChangeText,
  returnKeyType,
  onSubmitEditing,
}) {
  const [focused, setFocused] = useState(false);
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;
  const active = focused || (value && value.length > 0);

  useEffect(() => {
    Animated.timing(anim, {
      toValue: active ? 1 : 0,
      duration: 160,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [active, anim]);

  return (
    <View style={{ position: "relative" }}>
      <View
        style={{
          height: 52,
          borderWidth: 1,
          borderColor: active ? "#8B5CF6" : "#E2E8F0",
          borderRadius: 14,
          backgroundColor: "#fff",
          justifyContent: "center",
          paddingHorizontal: 14,
        }}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          style={{ flex: 1, fontSize: 15, color: "#1E1B4B", paddingVertical: 0 }}
        />
      </View>

      <Animated.Text
        style={{
          position: "absolute",
          left: 10,
          top: anim.interpolate({
            inputRange: [0, 1],
            outputRange: [15, -9],
          }),
          fontSize: anim.interpolate({
            inputRange: [0, 1],
            outputRange: [15, 11],
          }),
          fontWeight: "600",
          color: active ? "#8B5CF6" : "#94A3B8",
          backgroundColor: "#fff",
          paddingHorizontal: 4,
        }}
      >
        {label}
      </Animated.Text>
    </View>
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
      <Avatar
        name={displayName(user)}
        uri={user.imageUrl}
        size={40}
      />

      <View className="ml-3 flex-1">
        <Text
          numberOfLines={1}
          className="text-[14px] font-semibold text-slate-900"
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
        className="h-6 w-6 items-center justify-center rounded-full"
        style={{
          backgroundColor: selected ? "#8B5CF6" : "#FFFFFF",
          borderWidth: 1.5,
          borderColor: selected ? "#8B5CF6" : "#CBD5E1",
        }}
      >
        {selected ? (
          <Ionicons
            name="checkmark"
            size={14}
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
  const [selectedTime, setSelectedTime] = useState(() => {
    const d = new Date();
    d.setMinutes(Math.round(d.getMinutes() / 5) * 5, 0, 0);
    return d;
  });

  const [invitees, setInvitees] = useState(() => new Set());

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const inviteList = useMemo(
    () => connections || [],
    [connections]
  );

  const canSubmit =
    Boolean(title.trim() && selectedDate) && !submitting;

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
        backgroundColor: "#FAF8FF",
      }}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FAF8FF"
      />

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-white"
          style={{
            borderWidth: 1,
            borderColor: "#E2E8F0",
          }}
        >
          <Ionicons name="close" size={20} color="#0F172A" />
        </Pressable>

        <View className="flex-row items-center">
          <View className="mr-2 h-7 w-7 items-center justify-center rounded-lg bg-purple-100">
            <Ionicons name="calendar-sharp" size={16} color="#8B5CF6" />
          </View>
          <Text className="text-[20px] font-bold text-slate-900">
            Create event
          </Text>
        </View>

        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 24,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {error ? (
          <View className="mb-4 flex-row items-center rounded-2xl bg-rose-50 px-4 py-3 border border-rose-200">
            <Ionicons name="alert-circle" size={18} color="#E11D48" />
            <Text className="ml-2 flex-1 text-[13px] font-semibold text-rose-600">
              {error}
            </Text>
          </View>
        ) : null}

        {/* Event Title Card */}
        <View className="mb-3 rounded-[24px] bg-white p-3">
          <FloatingLabelInput
            label="Title"
            value={title}
            onChangeText={setTitle}
            returnKeyType="next"
            onSubmitEditing={() => Keyboard.dismiss()}
          />
        </View>

        {/* Date Card */}
        <View className="mb-3 rounded-[24px] bg-white p-3">
          <SectionLabel icon="calendar-outline">Date</SectionLabel>
          <DateScrollPicker
            selectedDate={selectedDate}
            onDateChange={(date) => setSelectedDate(date)}
          />
        </View>

        {/* Time Card */}
        <View className="mb-3 rounded-[24px] bg-white p-3">
          <SectionLabel icon="time-outline">Time</SectionLabel>
          <TimeScrollPicker
            selectedTime={selectedTime}
            onTimeChange={(t) => setSelectedTime(t)}
          />
        </View>

        {/* Location Card */}
        <View className="mb-3 rounded-[24px] bg-white p-3">
          <SectionLabel icon="location-outline">
            Location <Text className="text-[13px] font-normal text-slate-400">(optional)</Text>
          </SectionLabel>
          <View className="flex-row items-center rounded-2xl bg-white px-3 py-2 border border-slate-200">
            <Ionicons name="search-outline" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
            <TextInput
              value={location}
              onChangeText={setLocation}
              placeholder="Add a place or address"
              placeholderTextColor="#94A3B8"
              returnKeyType="next"
              onSubmitEditing={() => Keyboard.dismiss()}
              className="flex-1 text-[14px] text-slate-800"
            />
            <Pressable className="flex-row items-center rounded-full bg-purple-50 px-3 py-1.5">
              <Ionicons name="map-outline" size={15} color="#8B5CF6" />
              <Text className="ml-1 text-[12px] font-semibold text-purple-700">Map</Text>
            </Pressable>
          </View>
        </View>

        {/* Description Card */}
        <View className="mb-3 rounded-[24px] bg-white p-3">
          <SectionLabel icon="document-text-outline">
            Description <Text className="text-[13px] font-normal text-slate-400">(optional)</Text>
          </SectionLabel>
          <View className="rounded-2xl bg-white p-3 border border-slate-200">
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
              numberOfLines={3}
              maxLength={300}
              textAlignVertical="top"
              className="min-h-[70px] text-[14px] text-slate-800"
            />
            <Text className="mt-1 text-right text-[11px] font-medium text-slate-400">
              {description.length}/300
            </Text>
          </View>
        </View>

        {/* Invite Circles Card */}
        <View className="mb-4 rounded-[24px] bg-white p-4">
          <View className="flex-row items-center justify-between">
            <SectionLabel icon="people-outline">
              Invite your circles <Text className="text-[13px] font-normal text-slate-400">(optional)</Text>
            </SectionLabel>
            {inviteList.length === 0 ? (
              <Ionicons name="chevron-forward" size={18} color="#8B5CF6" />
            ) : null}
          </View>

          {inviteList.length === 0 ? (
            <Text className="text-[13px] text-slate-400">
              No connections yet — you can invite people after creating the event.
            </Text>
          ) : (
            <View>
              {inviteList.map((user, index) => (
                <View
                  key={user._id}
                  style={index > 0 ? { borderTopWidth: 1, borderTopColor: "#F1F5F9" } : undefined}
                >
                  <InviteRow
                    user={user}
                    selected={invitees.has(user._id)}
                    onToggle={() => toggleInvitee(user._id)}
                  />
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Create Event Button */}
        <Pressable
          onPress={handleSubmit}
          disabled={!canSubmit}
          className="flex-row items-center justify-center rounded-full py-4"
          style={{
            backgroundColor: canSubmit ? "#8B5CF6" : "#A78BFA",
            opacity: canSubmit ? 1 : 0.7,
          }}
        >
          <Ionicons name="checkmark" size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text className="text-[16px] font-bold text-white">
            {submitting ? "Creating…" : "Create event"}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}