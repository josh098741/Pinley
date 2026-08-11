import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
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
import { useAuth } from "@clerk/clerk-expo";
import { apiRequest } from "../utils/api";
import { useRequests } from "../context/RequestsContext";
import {
  Avatar,
  ClayButton,
  ClayCard,
  ClayChip,
  clay,
  displayName,
} from "../components/clay";
import { formatPinCode } from "../utils/pincode";

const CODE_LENGTH = 8;

const normalize = (input) =>
  input
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, CODE_LENGTH);

const ACTION_TIMEOUT_MS = 12000;
const withTimeout = (promise, ms = ACTION_TIMEOUT_MS) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out. Please try again.")), ms)
    ),
  ]);

// Small radar-ring badge used across the empty / loading states.
// Echoes the "search nearby" feel of a location app without being literal.
function RadarBadge({ icon, tone = clay.primary }) {
  return (
    <View className="mb-3 h-20 w-20 items-center justify-center">
      <View className="absolute h-20 w-20 rounded-full border border-violet-100" />
      <View className="absolute h-14 w-14 rounded-full border border-violet-200" />
      <View className="h-10 w-10 items-center justify-center rounded-2xl bg-violet-100 border border-violet-200">
        <Ionicons name={icon} size={20} color={tone} />
      </View>
    </View>
  );
}

// Shows live progress toward a complete 8-character PinCode.
function ModeChip({ norm }) {
  return (
    <View className="flex-row items-center gap-1.5 self-start rounded-full bg-violet-100 border border-violet-200 px-2.5 py-1">
      <Ionicons name="location" size={12} color={clay.primary} />
      <Text className="text-[11px] font-bold text-violet-700">
        {norm.length >= CODE_LENGTH ? "PinCode ready" : `PinCode · ${norm.length}/${CODE_LENGTH}`}
      </Text>
    </View>
  );
}

function PinTag({ pinCode }) {
  if (!pinCode) return null;
  return (
    <View className="mt-1 flex-row items-center gap-1 self-start rounded-full bg-violet-50 border border-violet-200 px-2 py-0.5">
      <Ionicons name="location" size={10} color={clay.primary} />
      <Text className="text-[11px] font-bold tracking-wider text-violet-700">
        {formatPinCode(pinCode)}
      </Text>
    </View>
  );
}

export default function RequestSearch() {
  const router = useRouter();
  const { getToken } = useAuth();
  const { sendRequest, respond, cancelRequest } = useRequests();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [hint, setHint] = useState("");
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [focused, setFocused] = useState(false);
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;
  const searchSeq = useRef(0);
  const abortRef = useRef(null);
  const timerRef = useRef(null);
  const inputRef = useRef(null);

  const runSearch = useCallback(async (value) => {
    const norm = normalize(value);
    if (norm.length !== CODE_LENGTH) {
      setResults([]);
      setHint("");
      setSearched(false);
      setSearching(false);
      setError("");
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const seq = ++searchSeq.current;

    setSearching(true);
    setHint("");
    try {
      const token = await getTokenRef.current();
      if (!token || seq !== searchSeq.current) return;
      const data = await apiRequest(`/api/users/search?code=${encodeURIComponent(norm)}`, {
        token,
        signal: controller.signal,
      });
      if (seq !== searchSeq.current) return;
      setResults(data.users || []);
      setHint(data.hint || "");
      setSearched(true);
    } catch (err) {
      if (seq !== searchSeq.current || err?.name === "AbortError") return;
      setError(err.message || "Search failed. Please try again.");
      setResults([]);
      setHint("");
      setSearched(true);
    } finally {
      if (seq === searchSeq.current) setSearching(false);
    }
  }, []);

  useEffect(() => {
    const norm = normalize(query);
    if (norm.length !== CODE_LENGTH) {
      setResults([]);
      setHint("");
      setSearched(false);
      setSearching(false);
      setError("");
      return;
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    setError("");
    timerRef.current = setTimeout(() => runSearch(query), 300);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, runSearch]);

  const handleSend = async (userId) => {
    setBusyId(userId);
    setError("");
    let ok = false;
    try {
      const sent = await withTimeout(sendRequest({ recipientId: userId }));
      ok = true;
      if (sent) {
        setResults((prev) =>
          prev.map((u) =>
            u._id === userId
              ? { ...u, relationship: "pending_outgoing", requestId: sent._id }
              : u
          )
        );
      }
    } catch (err) {
      setError(err.message || "Could not send request.");
    } finally {
      setBusyId(null);
      if (ok) await runSearch(query).catch(() => {});
    }
  };

  const handleAccept = async (requestId) => {
    setBusyId(requestId);
    setError("");
    let ok = false;
    try {
      await withTimeout(respond(requestId, "accept"));
      ok = true;
    } catch (err) {
      setError(err.message || "Could not accept request.");
    } finally {
      setBusyId(null);
      if (ok) await runSearch(query).catch(() => {});
    }
  };

  const handleCancel = async (requestId) => {
    setBusyId(requestId);
    setError("");
    let ok = false;
    try {
      await withTimeout(cancelRequest(requestId));
      ok = true;
    } catch (err) {
      setError(err.message || "Could not cancel request.");
    } finally {
      setBusyId(null);
      if (ok) await runSearch(query).catch(() => {});
    }
  };

  const renderAction = (user) => {
    const busy = busyId === user._id || busyId === user.requestId;
    switch (user.relationship) {
      case "none":
        return (
          <ClayButton
            compact
            label="Add"
            icon="add"
            onPress={() => handleSend(user._id)}
            loading={busy}
            disabled={busy}
          />
        );
      case "pending_outgoing":
        return (
          <View className="flex-row items-center gap-2">
            <ClayChip label="Sent" tone="pending" />
            <Pressable
              onPress={() => handleCancel(user.requestId)}
              disabled={busy}
              className="p-1.5"
            >
              <Ionicons name="close-circle" size={20} color={clay.danger} />
            </Pressable>
          </View>
        );
      case "pending_incoming":
        return (
          <ClayButton
            compact
            label="Accept"
            icon="checkmark"
            onPress={() => handleAccept(user.requestId)}
            disabled={busy}
          />
        );
      case "connected":
        return <ClayChip label="Connected" tone="success" />;
      case "self":
        return <ClayChip label="That's you" tone="muted" />;
      default:
        return null;
    }
  };

  const trimmed = query.trim();
  const norm = normalize(trimmed);
  const tooShort = trimmed.length > 0 && norm.length < CODE_LENGTH;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: "#FFFFFF" }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View className="flex-1 px-5 pt-3">
        {/* Header */}
        <View className="mb-5 flex-row items-center justify-between">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-white border border-violet-200"
          >
            <Ionicons name="close" size={20} color={clay.ink} />
          </Pressable>
          <View className="flex-row items-center gap-2">
            <View className="h-7 w-7 items-center justify-center rounded-full bg-violet-100 border border-violet-200">
              <Ionicons name="location" size={14} color={clay.primary} />
            </View>
            <Text className="text-[18px] font-bold text-slate-900">Find people</Text>
          </View>
          <View className="w-10" />
        </View>

        {/* Search bar */}
        <View
          className="flex-row items-center rounded-2xl bg-white px-4"
          style={{
            borderWidth: 1.5,
            borderColor: focused ? clay.primary : "#EDE9FE",
            shadowColor: "#7C3AED",
            shadowOpacity: focused ? 0.12 : 0,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
            elevation: focused ? 2 : 0,
          }}
        >
          <Ionicons
            name={norm.length >= CODE_LENGTH ? "location" : "search"}
            size={18}
            color={focused ? clay.primary : "#94A3B8"}
          />
          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={setQuery}
            placeholder="Enter their PinCode"
            placeholderTextColor="#94A3B8"
            autoFocus
            autoCapitalize="characters"
            autoCorrect={false}
            returnKeyType="search"
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onSubmitEditing={() => {
              if (timerRef.current) clearTimeout(timerRef.current);
              setError("");
              Keyboard.dismiss();
              runSearch(query);
            }}
            className="flex-1 py-3.5 px-3 text-[15px] font-semibold text-slate-900"
          />
          {query.length > 0 ? (
            <Pressable
              hitSlop={10}
              onPress={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
            >
              <Ionicons name="close-circle" size={18} color="#CBD5E1" />
            </Pressable>
          ) : null}
        </View>

        <View className="mt-3 mb-1 flex-row items-center justify-between px-0.5">
          {trimmed.length > 0 ? (
            <ModeChip norm={norm} />
          ) : (
            <Text className="text-[12px] font-medium text-slate-400">
              PinCodes are 8 characters — e.g. AB12-CD34
            </Text>
          )}
          <Text className="text-[11px] font-semibold text-slate-300">
            {trimmed.length > 0 ? `${norm.length}/${CODE_LENGTH}` : ""}
          </Text>
        </View>

        {error ? (
          <View className="mt-3 flex-row items-center gap-2 rounded-2xl bg-rose-50 border border-rose-200 px-4 py-3">
            <Ionicons name="alert-circle" size={16} color={clay.danger} />
            <Text className="flex-1 text-[13px] font-semibold text-rose-600">{error}</Text>
          </View>
        ) : null}

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 40, paddingTop: 8 }}
          keyboardShouldPersistTaps="handled"
        >
          {searching ? (
            <View className="items-center justify-center py-16">
              <RadarBadge icon="search" />
              <ActivityIndicator color={clay.primary} />
              <Text className="mt-3 text-[13px] font-medium text-slate-400">
                Searching…
              </Text>
            </View>
          ) : null}

          {tooShort ? (
            <ClayCard style={{ alignItems: "center", paddingVertical: 30, marginTop: 12 }}>
              <RadarBadge icon="pencil" />
              <Text className="text-[15px] font-bold text-slate-900">Keep typing…</Text>
              <Text className="mt-1 px-8 text-center text-[13px] leading-5 text-slate-500">
                Type the full PinCode — search runs automatically at{" "}
                {CODE_LENGTH} characters.{"\n"}
                {norm.length > 0 ? "It looks like AB12-CD34." : ""}
              </Text>
            </ClayCard>
          ) : null}

          {!searching && !tooShort && !trimmed ? (
            <ClayCard style={{ alignItems: "center", paddingVertical: 34, marginTop: 12 }}>
              <RadarBadge icon="location" />
              <Text className="text-[15px] font-bold text-slate-900">Find your people</Text>
              <Text className="mt-1 px-8 text-center text-[13px] leading-5 text-slate-500">
                Enter someone&apos;s PinCode to send them a request. You&apos;ll only find people you have a
                code for.
              </Text>
            </ClayCard>
          ) : null}

          {!searching && !tooShort && searched && results.length === 0 ? (
            <ClayCard style={{ alignItems: "center", paddingVertical: 30, marginTop: 12 }}>
              <RadarBadge icon="people-outline" />
              <Text className="text-[15px] font-bold text-slate-900">No one found</Text>
              <Text className="mt-1 px-8 text-center text-[13px] leading-5 text-slate-500">
                {hint || "No user has that PinCode. Double-check it and try again."}
              </Text>
            </ClayCard>
          ) : null}

          {!searching &&
            results.map((user) => (
              <ClayCard key={user._id} style={{ marginBottom: 12 }}>
                <View className="flex-row items-center gap-4">
                  <View className="rounded-full" style={{ borderWidth: 2, borderColor: "#EDE9FE" }}>
                    <Avatar name={displayName(user)} uri={user.imageUrl} size={50} />
                  </View>
                  <View className="flex-1">
                    <Text numberOfLines={1} className="text-[15.5px] font-bold text-slate-900">
                      {displayName(user)}
                    </Text>
                    <Text numberOfLines={1} className="mt-0.5 text-[12.5px] font-medium text-slate-500">
                      {user.email || user.username}
                    </Text>
                    <PinTag pinCode={user.pinCode} />
                  </View>
                  {renderAction(user)}
                </View>
              </ClayCard>
            ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}