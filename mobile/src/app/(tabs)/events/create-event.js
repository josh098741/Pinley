import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
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
} from "../../../components/clay";

import { useEvents } from "../../../context/EventsContext";
import { useRequests } from "../../../context/RequestsContext";

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
  leftAccessory,
  rightAccessory,
  inputStyle,
  placeholder,
  multiline,
  numberOfLines,
  minHeight,
}) {
  const [focused, setFocused] = useState(false);
  const hasValue = !!(value && value.length > 0);
  const showLabel = Boolean(label);
  const staticLabel = showLabel && Boolean(placeholder);
  const floated = staticLabel ? true : focused || hasValue;
  const borderActive = focused || hasValue;

  const boxMinHeight = minHeight ?? 52;

  const anim = useRef(new Animated.Value(floated ? 1 : 0)).current;

  useEffect(() => {
    if (!showLabel) return;
    Animated.timing(anim, {
      toValue: floated ? 1 : 0,
      duration: 160,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [floated, anim, showLabel]);

  return (
    <View style={{ position: "relative" }}>
      <View
        style={{
          minHeight: boxMinHeight,
          flexDirection: "row",
          alignItems: multiline ? "flex-start" : "center",
          borderWidth: 1,
          borderColor: borderActive ? "#8B5CF6" : "#E2E8F0",
          borderRadius: 14,
          backgroundColor: "#fff",
          paddingHorizontal: 14,
          paddingVertical: multiline ? 14 : 0,
        }}
      >
        {leftAccessory}
        <View
          style={{
            flex: 1,
            minHeight: boxMinHeight,
            justifyContent: multiline ? "flex-start" : "center",
          }}
        >
          <TextInput
            value={value}
            onChangeText={onChangeText}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={placeholder}
            placeholderTextColor={placeholder ? "#94A3B8" : undefined}
            returnKeyType={returnKeyType}
            onSubmitEditing={onSubmitEditing}
            multiline={multiline}
            numberOfLines={numberOfLines}
            textAlignVertical={multiline ? "top" : undefined}
            style={[
              { flex: 1, fontSize: 15, color: "#1E1B4B", paddingVertical: 0 },
              inputStyle,
            ]}
          />
        </View>
        {rightAccessory}
      </View>

      {showLabel ? (
        <Animated.Text
          style={{
            position: "absolute",
            left: leftAccessory ? 44 : 10,
            top: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [15, -9],
            }),
            fontSize: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [15, 11],
            }),
            fontWeight: "600",
            color: borderActive ? "#8B5CF6" : "#94A3B8",
            backgroundColor: "#fff",
            paddingHorizontal: 4,
          }}
        >
          {label}
        </Animated.Text>
      ) : null}
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
   Wizard steps
------------------------------------------------------- */

const STEPS = ["Details", "Date & time", "Location", "Invite", "Review"];

function StepProgress({ step }) {
  const total = STEPS.length;
  const fraction = (step + 1) / total;

  return (
    <View className="px-5 pt-1 pb-3">
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-[13px] font-bold text-purple-700">
          {STEPS[step]}
        </Text>
        <Text className="text-[12px] font-semibold text-slate-400">
          Step {step + 1} of {total}
        </Text>
      </View>

      <View
        className="h-1.5 w-full overflow-hidden rounded-full"
        style={{ backgroundColor: "#EDE9FE" }}
      >
        <View
          className="h-full rounded-full"
          style={{
            width: `${fraction * 100}%`,
            backgroundColor: "#8B5CF6",
          }}
        />
      </View>
    </View>
  );
}

function DetailsStep({ title, setTitle, description, setDescription }) {
  return (
    <View>
      <View className="mb-3 rounded-[24px] bg-white p-4">
        <SectionLabel icon="text">Event title</SectionLabel>
        <FloatingLabelInput
          label="Add an event title"
          value={title}
          onChangeText={setTitle}
          returnKeyType="next"
          onSubmitEditing={() => Keyboard.dismiss()}
          leftAccessory={
            <Text
              style={{
                marginRight: 14,
                fontSize: 16,
                fontWeight: "700",
                color: "#94A3B8",
              }}
            >
              Aa
            </Text>
          }
        />
      </View>

      <View className="mb-3 rounded-[24px] bg-white p-4">
        <SectionLabel icon="document-text-outline">
          Description <Text className="text-[13px] font-normal text-slate-400">(optional)</Text>
        </SectionLabel>
        <FloatingLabelInput
          label="Add a description"
          value={description}
          onChangeText={(text) => {
            if (text.length <= 300) {
              setDescription(text);
            }
          }}
          multiline
          numberOfLines={4}
          minHeight={96}
          inputStyle={{ fontSize: 14, lineHeight: 20 }}
        />
        <Text className="mt-1 text-right text-[11px] font-medium text-slate-400">
          {description.length}/300
        </Text>
      </View>
    </View>
  );
}

function DateTimeStep({ selectedDate, setSelectedDate, selectedTime, setSelectedTime }) {
  return (
    <View>
      <View className="mb-3 rounded-[24px] bg-white p-4">
        <SectionLabel icon="calendar-outline">Date</SectionLabel>
        <DateScrollPicker
          selectedDate={selectedDate}
          onDateChange={(date) => setSelectedDate(date)}
        />
      </View>

      <View className="mb-3 rounded-[24px] bg-white p-4">
        <SectionLabel icon="time-outline">Time</SectionLabel>
        <TimeScrollPicker
          selectedTime={selectedTime}
          onTimeChange={(t) => setSelectedTime(t)}
        />
      </View>
    </View>
  );
}

function LocationStep({ location, setLocation }) {
  return (
    <View className="mb-3 rounded-[24px] bg-white p-4">
      <SectionLabel icon="location-outline">
        Location <Text className="text-[13px] font-normal text-slate-400">(optional)</Text>
      </SectionLabel>
      <Text className="mb-3 text-[12.5px] leading-[17px] text-slate-500">
        Add a place so your circles know where to meet. You can skip this and
        add it later.
      </Text>
      <FloatingLabelInput
        label="Add a place or address"
        value={location}
        onChangeText={setLocation}
        returnKeyType="next"
        onSubmitEditing={() => Keyboard.dismiss()}
        inputStyle={{ fontSize: 14 }}
        leftAccessory={
          <Ionicons
            name="search-outline"
            size={18}
            color="#94A3B8"
            style={{ marginRight: 8 }}
          />
        }
        rightAccessory={
          <Pressable className="flex-row items-center rounded-full bg-purple-50 px-3 py-1.5">
            <Ionicons name="map-outline" size={15} color="#8B5CF6" />
            <Text className="ml-1 text-[12px] font-semibold text-purple-700">Map</Text>
          </Pressable>
        }
      />
    </View>
  );
}

function InviteStep({ inviteList, invitees, toggleInvitee }) {
  return (
    <View className="rounded-[24px] bg-white p-4">
      <SectionLabel icon="people-outline">
        Invite your circles <Text className="text-[13px] font-normal text-slate-400">(optional)</Text>
      </SectionLabel>

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
  );
}

function ReviewStep({ title, description, location, selectedDate, selectedTime, invitedUsers }) {
  const dateLabel = selectedDate
    ? selectedDate.toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";
  const timeLabel = selectedTime
    ? selectedTime.toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
      })
    : "—";

  return (
    <View>
      <View className="mb-3 rounded-[24px] bg-white p-4">
        <Text className="text-[12.5px] font-bold uppercase tracking-wide text-purple-700">
          {dateLabel} · {timeLabel}
        </Text>
        <Text className="mt-1 text-[20px] font-bold text-slate-900">
          {title || "Untitled event"}
        </Text>
        {description ? (
          <Text className="mt-1.5 text-[13.5px] leading-[19px] text-slate-500">
            {description}
          </Text>
        ) : null}
        {location ? (
          <View className="mt-3 flex-row items-center" style={{ gap: 6 }}>
            <Ionicons name="location-outline" size={15} color="#8B5CF6" />
            <Text className="text-[13px] font-medium text-slate-600">
              {location}
            </Text>
          </View>
        ) : null}
      </View>

      <View className="mb-3 rounded-[24px] bg-white p-4">
        <Text className="mb-1 text-[15px] font-semibold text-slate-800">
          Invited friends
        </Text>
        {invitedUsers.length === 0 ? (
          <Text className="text-[13px] text-slate-400">
            No one invited yet — you can add people later.
          </Text>
        ) : (
          <View>
            {invitedUsers.map((user, index) => (
              <View
                key={user._id}
                style={index > 0 ? { borderTopWidth: 1, borderTopColor: "#F1F5F9" } : undefined}
              >
                <InviteRow user={user} selected={true} onToggle={() => {}} />
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

export default function CreateEvent() {
  const router = useRouter();

  const { createEvent } = useEvents();
  const { connections } = useRequests();

  const [step, setStep] = useState(0);
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

  // Bumped to force-remount the steps (esp. the date/time pickers, which
  // keep their own internal state) so their values clear on reset.
  const [formKey, setFormKey] = useState(0);

  const resetForm = useCallback(() => {
    setStep(0);
    setTitle("");
    setDescription("");
    setLocation("");
    setSelectedDate(null);
    setSelectedTime(() => {
      const d = new Date();
      d.setMinutes(Math.round(d.getMinutes() / 5) * 5, 0, 0);
      return d;
    });
    setInvitees(new Set());
    setSubmitting(false);
    setError("");
    setFormKey((k) => k + 1);
  }, []);

  // The screen stays mounted in the navigator, so its state is preserved
  // between visits. Reset the form each time it gains focus so a fresh
  // "create" never shows a previous event's details.
  useFocusEffect(
    useCallback(() => {
      resetForm();
    }, [resetForm])
  );

  const inviteList = useMemo(
    () => connections || [],
    [connections]
  );

  const isLastStep = step === STEPS.length - 1;
  const canSubmit = Boolean(title.trim() && selectedDate) && !submitting;
  const invitedUsers = inviteList.filter((u) => invitees.has(u._id));

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

  const validateStep = () => {
    if (step === 0 && !title.trim()) {
      setError("Add a title for your event.");
      return false;
    }
    if (step === 1 && !selectedDate) {
      setError("Pick a date for your event.");
      return false;
    }
    return true;
  };

  const goBack = () => {
    if (step === 0) {
      router.back();
    } else {
      setError("");
      setStep((s) => s - 1);
    }
  };

  const goNext = () => {
    if (!validateStep()) return;
    setError("");

    if (isLastStep) {
      handleSubmit();
    } else {
      setStep((s) => s + 1);
    }
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
        inviteeIds: [...invitees],
      });

      if (!created) {
        throw new Error("Could not create the event.");
      }

      router.replace("/events");
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
      <View className="flex-row items-center justify-between px-4 pt-3 pb-1">
        <Pressable
          onPress={goBack}
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

      <StepProgress step={step} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 16,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {error ? (
          <View className="mb-4 flex-row items-center rounded-2xl border border-rose-200" style={{ backgroundColor: "#FEF2F2", paddingHorizontal: 16, paddingVertical: 12 }}>
            <Ionicons name="alert-circle" size={18} color="#E11D48" />
            <Text className="ml-2 flex-1 text-[13px] font-semibold text-rose-600">
              {error}
            </Text>
          </View>
        ) : null}

        <View key={formKey}>
          {step === 0 ? (
            <DetailsStep
              title={title}
              setTitle={setTitle}
              description={description}
              setDescription={setDescription}
            />
          ) : null}

          {step === 1 ? (
            <DateTimeStep
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              selectedTime={selectedTime}
              setSelectedTime={setSelectedTime}
            />
          ) : null}

          {step === 2 ? (
            <LocationStep location={location} setLocation={setLocation} />
          ) : null}

          {step === 3 ? (
            <InviteStep
              inviteList={inviteList}
              invitees={invitees}
              toggleInvitee={toggleInvitee}
            />
          ) : null}

          {step === 4 ? (
            <ReviewStep
              title={title}
              description={description}
              location={location}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              invitedUsers={invitedUsers}
            />
          ) : null}
        </View>
      </ScrollView>

      {/* Footer action */}
      <View
        className="px-4 pb-4 pt-2"
        style={{ backgroundColor: "#FAF8FF" }}
      >
        <Pressable
          onPress={goNext}
          disabled={isLastStep && !canSubmit}
          className="flex-row items-center justify-center rounded-full py-4"
          style={{
            backgroundColor: isLastStep && !canSubmit ? "#A78BFA" : "#8B5CF6",
            opacity: isLastStep && !canSubmit ? 0.7 : 1,
          }}
        >
          {isLastStep ? (
            <Ionicons name="checkmark" size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
          ) : (
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
          )}
          <Text className="text-[16px] font-bold text-white">
            {isLastStep ? (submitting ? "Creating…" : "Create event") : "Continue"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
