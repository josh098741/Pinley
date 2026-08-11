import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
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
  ClayInput,
  clay,
  displayName,
} from "../components/clay";
import { formatPinCode } from "../utils/pincode";

export default function RequestSearch() {
  const router = useRouter();
  const { getToken } = useAuth();
  const { sendRequest, respond, cancelRequest } = useRequests();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const debounceRef = useRef(null);

  const runSearch = useCallback(
    async (value) => {
      const q = value.trim();
      if (!q) {
        setResults([]);
        setSearched(false);
        return;
      }
      setSearching(true);
      setError("");
      try {
        const token = await getToken();
        if (!token) return;
        const data = await apiRequest(`/api/users/search?q=${encodeURIComponent(q)}`, { token });
        setResults(data.users || []);
        setSearched(true);
      } catch (err) {
        setError(err.message || "Search failed. Please try again.");
        setResults([]);
        setSearched(true);
      } finally {
        setSearching(false);
      }
    },
    [getToken]
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(query), 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, runSearch]);

  const handleSend = async (userId) => {
    setBusyId(userId);
    setError("");
    try {
      await sendRequest({ recipientId: userId });
    } catch (err) {
      setError(err.message || "Could not send request.");
    } finally {
      setBusyId(null);
      await runSearch(query);
    }
  };

  const handleAccept = async (requestId) => {
    setBusyId(requestId);
    setError("");
    try {
      await respond(requestId, "accept");
    } catch (err) {
      setError(err.message || "Could not accept request.");
    } finally {
      setBusyId(null);
      await runSearch(query);
    }
  };

  const handleCancel = async (requestId) => {
    setBusyId(requestId);
    setError("");
    try {
      await cancelRequest(requestId);
    } catch (err) {
      setError(err.message || "Could not cancel request.");
    } finally {
      setBusyId(null);
      await runSearch(query);
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
      default:
        return null;
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: clay.bg }}>
      <StatusBar barStyle="dark-content" backgroundColor={clay.bg} />
      <View className="flex-1 px-5 pt-3">
        <View className="mb-4 flex-row items-center justify-between">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-white border border-violet-200"
          >
            <Ionicons name="close" size={20} color={clay.ink} />
          </Pressable>
          <Text className="text-[18px] font-bold text-slate-900">Find people</Text>
          <View className="w-10" />
        </View>

        <ClayInput
          value={query}
          onChangeText={setQuery}
          placeholder="PinCode, name or email"
          autoFocus
          autoCapitalize="characters"
          autoCorrect={false}
          returnKeyType="search"
          onSubmitEditing={() => {
            Keyboard.dismiss();
            runSearch(query);
          }}
        />

        <Text className="mt-3 mb-1 px-1 text-[12px] font-medium text-slate-400">
          Tip: search by PinCode — it looks like AB12-CD34
        </Text>

        {error ? (
          <View className="mt-4 rounded-2xl bg-rose-50 border border-rose-200 px-4 py-3">
            <Text className="text-[13px] font-semibold text-rose-600">{error}</Text>
          </View>
        ) : null}

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 40, paddingTop: 8 }}
          keyboardShouldPersistTaps="handled"
        >
          {searching ? (
            <View className="items-center justify-center py-16">
              <ActivityIndicator color={clay.primary} size="large" />
              <Text className="mt-3 text-[13px] font-medium text-slate-400">
                Searching…
              </Text>
            </View>
          ) : null}

          {!searching && !searched && !query.trim() ? (
            <ClayCard style={{ alignItems: "center", paddingVertical: 30, marginTop: 12 }}>
              <View className="h-14 w-14 items-center justify-center rounded-[20px] bg-violet-100 border border-violet-200 mb-3">
                <Ionicons name="search" size={26} color={clay.primary} />
              </View>
              <Text className="text-[15px] font-bold text-slate-900">Find your people</Text>
              <Text className="mt-1 px-8 text-center text-[13px] leading-5 text-slate-500">
                Search by PinCode, name or email, then send them a request.
              </Text>
            </ClayCard>
          ) : null}

          {!searching && searched && results.length === 0 ? (
            <ClayCard style={{ alignItems: "center", paddingVertical: 30, marginTop: 12 }}>
              <View className="h-14 w-14 items-center justify-center rounded-[20px] bg-violet-100 border border-violet-200 mb-3">
                <Ionicons name="people-outline" size={26} color={clay.primary} />
              </View>
              <Text className="text-[15px] font-bold text-slate-900">No one found</Text>
              <Text className="mt-1 px-8 text-center text-[13px] leading-5 text-slate-500">
                Check the PinCode or try a name or email instead.
              </Text>
            </ClayCard>
          ) : null}

          {!searching &&
            results.map((user) => (
              <ClayCard key={user._id} style={{ marginBottom: 12 }}>
                <View className="flex-row items-center gap-4">
                  <Avatar name={displayName(user)} uri={user.imageUrl} size={50} />
                  <View className="flex-1">
                    <Text numberOfLines={1} className="text-[15.5px] font-bold text-slate-900">
                      {displayName(user)}
                    </Text>
                    <Text numberOfLines={1} className="mt-0.5 text-[12.5px] font-medium text-slate-500">
                      {user.email || user.username}
                    </Text>
                    {user.pinCode ? (
                      <Text className="mt-0.5 text-[12px] font-bold tracking-wider text-violet-700">
                        {formatPinCode(user.pinCode)}
                      </Text>
                    ) : null}
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
