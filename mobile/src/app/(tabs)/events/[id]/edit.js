import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@clerk/clerk-expo";
import * as ImagePicker from "expo-image-picker";

import { ClayButton, clay } from "../../../../components/clay";
import { useEvents } from "../../../../context/EventsContext";
import { uploadImage } from "../../../../utils/api";
import {
  DateScrollPicker,
  TimeScrollPicker,
  FloatingLabelInput,
  SectionLabel,
} from "../create-event";

/* ─── Cover photo picker ────────────────────────────────────── */

function CoverPicker({ uri, onChange }) {
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled) {
      onChange(result.assets[0].uri);
    }
  };

  return (
    <Pressable
      onPress={pickImage}
      className="h-32 w-full overflow-hidden rounded-2xl"
      style={{ backgroundColor: "#F8FAFC", borderWidth: 1, borderColor: "#E2E8F0" }}
    >
      {uri ? (
        <View className="relative flex-1">
          <Image source={{ uri }} className="h-full w-full" resizeMode="cover" />
          <View className="absolute bottom-2 right-2 flex-row items-center rounded-full bg-black/50 px-3 py-1.5">
            <Ionicons name="pencil" size={14} color="white" />
            <Text className="ml-1 text-[12px] font-semibold text-white">Edit</Text>
          </View>
        </View>
      ) : (
        <View className="flex-1 items-center justify-center">
          <View className="mb-2 h-10 w-10 items-center justify-center rounded-full bg-purple-100">
            <Ionicons name="add" size={24} color="#8B5CF6" />
          </View>
          <Text className="text-[13px] font-medium text-slate-500">
            Add a cover photo
          </Text>
        </View>
      )}
    </Pressable>
  );
}

/* ─── Delete button ─────────────────────────────────────────── */

function DeleteButton({ deleting, onPress }) {
  return (
    <View
      style={{
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderTopWidth: 1,
        borderTopColor: clay.line,
        backgroundColor: clay.bg,
      }}
    >
      <TouchableOpacity onPress={onPress} disabled={deleting}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 999,
            paddingVertical: 15,
            borderWidth: 1.5,
            borderColor: clay.danger,
            backgroundColor: clay.dangerSoft,
            opacity: deleting ? 0.6 : 1,
          }}
        >
          <Ionicons name="trash-outline" size={18} color={clay.danger} style={{ marginRight: 8 }} />
          <Text style={{ fontSize: 15, fontWeight: "700", color: clay.danger }}>
            {deleting ? "Deleting…" : "Delete event"}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

/* ─── Main screen ──────────────────────────────────────────── */

export default function EditEvent() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { getEvent, updateEvent, deleteEvent } = useEvents();
  const { getToken } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [coverChanged, setCoverChanged] = useState(false);

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
          setTitle(data.title || "");
          setDescription(data.description || "");
          setLocation(data.location || "");
          const d = data.date ? new Date(data.date) : new Date();
          setSelectedDate(d);
          setSelectedTime(d);
          setCoverImage(data.coverImageUrl || null);
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

  const canSave = Boolean(title.trim() && selectedDate) && !saving && !deleting;

  const handleSave = async () => {
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

    setSaving(true);
    try {
      let coverImageUrl = coverChanged ? "" : coverImage || "";
      if (coverChanged && coverImage) {
        const token = await getToken();
        if (!token) throw new Error("Not authenticated");
        coverImageUrl = await uploadImage(coverImage, token);
      }

      const updated = await updateEvent(id, {
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        date: date.toISOString(),
        coverImageUrl,
      });

      if (!updated) throw new Error("Could not update the event.");
      router.back();
    } catch (err) {
      Alert.alert("Could not save", err?.message || "Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (deleting) return;
    Alert.alert(
      "Delete event",
      "This event will be removed for everyone. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteEvent(id);
              router.replace("/events");
            } catch (err) {
              setDeleting(false);
              Alert.alert("Could not delete", err?.message || "Please try again.");
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: "#FAF8FF" }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF8FF" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-3 pb-1">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-white"
          style={{ borderWidth: 1, borderColor: "#E2E8F0" }}
        >
          <Ionicons name="close" size={20} color="#0F172A" />
        </Pressable>

        <View className="flex-row items-center">
          <View className="mr-2 h-7 w-7 items-center justify-center rounded-lg bg-purple-100">
            <Ionicons name="create-outline" size={16} color="#8B5CF6" />
          </View>
          <Text className="text-[20px] font-bold text-slate-900">Edit event</Text>
        </View>

        <View className="w-10" />
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#8B5CF6" size="large" />
          <Text className="mt-3 text-[13px] font-medium text-slate-400">
            Loading event…
          </Text>
        </View>
      ) : error && !event ? (
        <View className="flex-1 items-center justify-center px-8">
          <View
            className="h-14 w-14 items-center justify-center rounded-2xl"
            style={{ backgroundColor: clay.dangerSoft }}
          >
            <Ionicons name="alert-circle" size={26} color={clay.danger} />
          </View>
          <Text className="mt-3 text-center text-[14.5px] font-bold text-slate-900">
            {error}
          </Text>
          <View className="mt-4">
            <ClayButton label="Go back" variant="soft" onPress={() => router.back()} />
          </View>
        </View>
      ) : (
        <>
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {error ? (
              <View
                className="mb-4 flex-row items-center rounded-2xl border border-rose-200"
                style={{ backgroundColor: "#FEF2F2", paddingHorizontal: 16, paddingVertical: 12 }}
              >
                <Ionicons name="alert-circle" size={18} color="#E11D48" />
                <Text className="ml-2 flex-1 text-[13px] font-semibold text-rose-600">
                  {error}
                </Text>
              </View>
            ) : null}

            <View className="mb-3 rounded-[24px] bg-white p-4">
              <SectionLabel icon="image-outline">
                Cover photo <Text className="text-[13px] font-normal text-slate-400">(optional)</Text>
              </SectionLabel>
              <CoverPicker
                uri={coverImage}
                onChange={(uri) => {
                  setCoverImage(uri);
                  setCoverChanged(true);
                }}
              />
            </View>

            <View className="mb-3 rounded-[24px] bg-white p-4">
              <SectionLabel icon="text">Event title</SectionLabel>
              <FloatingLabelInput
                label="Add an event title"
                value={title}
                onChangeText={setTitle}
                returnKeyType="next"
                onSubmitEditing={() => Keyboard.dismiss()}
                leftAccessory={
                  <Text style={{ marginRight: 14, fontSize: 16, fontWeight: "700", color: "#94A3B8" }}>
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
                  if (text.length <= 300) setDescription(text);
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

            <View className="mb-3 rounded-[24px] bg-white p-4">
              <SectionLabel icon="calendar-outline">Date</SectionLabel>
              <DateScrollPicker selectedDate={selectedDate} onDateChange={(date) => setSelectedDate(date)} />
            </View>

            <View className="mb-3 rounded-[24px] bg-white p-4">
              <SectionLabel icon="time-outline">Time</SectionLabel>
              <TimeScrollPicker selectedTime={selectedTime} onTimeChange={(t) => setSelectedTime(t)} />
            </View>

            <View className="mb-3 rounded-[24px] bg-white p-4">
              <SectionLabel icon="location-outline">
                Location <Text className="text-[13px] font-normal text-slate-400">(optional)</Text>
              </SectionLabel>
              <FloatingLabelInput
                label="Add a place or address"
                value={location}
                onChangeText={setLocation}
                returnKeyType="next"
                onSubmitEditing={() => Keyboard.dismiss()}
                inputStyle={{ fontSize: 14 }}
                leftAccessory={
                  <Ionicons name="search-outline" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
                }
              />
            </View>
          </ScrollView>

          {/* Footer actions */}
          <View className="px-4 pb-4 pt-2" style={{ backgroundColor: "#FAF8FF" }}>
            <Pressable
              onPress={handleSave}
              disabled={!canSave}
              className="flex-row items-center justify-center rounded-full py-4"
              style={{ backgroundColor: canSave ? "#8B5CF6" : "#A78BFA", opacity: canSave ? 1 : 0.7 }}
            >
              <Ionicons name="checkmark" size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text className="text-[16px] font-bold text-white">
                {saving ? "Saving…" : "Save changes"}
              </Text>
            </Pressable>
          </View>

          <DeleteButton deleting={deleting} onPress={handleDelete} />
        </>
      )}
    </SafeAreaView>
  );
}
