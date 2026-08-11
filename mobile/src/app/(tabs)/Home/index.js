import { useEffect, useRef, useState } from "react";
import { Image, StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { syncUserToDatabase } from "../../(auth)/index.js";

const LOGO = require("../../../../assets/images/pinley_image.png");

export default function Home() {
  const { user } = useUser();
  const { getToken, isSignedIn, sessionId } = useAuth();
  const [syncState, setSyncState] = useState("syncing");
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  useEffect(() => {
    if (!isSignedIn || !sessionId) return;
    let cancelled = false;
    setSyncState("syncing");

    const performSync = async () => {
      try {
        const token = await getTokenRef.current();
        if (!token || cancelled) return;
        const res = await syncUserToDatabase(token);
        if (res?.user && !cancelled) {
          setSyncState("synced");
        } else if (!cancelled) {
          setSyncState("error");
        }
      } catch (err) {
        console.error("Account sync error:", err);
        if (!cancelled) {
          setSyncState("error");
        }
      }
    };

    performSync();

    return () => {
      cancelled = true;
    };
  }, [isSignedIn, sessionId]);

  const syncColor = syncState === "synced" ? "text-green-400" : "text-amber-400";
  const syncText =
    syncState === "syncing"
      ? "Syncing your account…"
      : syncState === "synced"
        ? "Account synced to database"
        : "Account sync pending — check your connection";

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View className="flex-1 items-center justify-center px-6">
        <Image source={LOGO} className="mb-6 h-24 w-24" resizeMode="contain" />
        <Text className="text-3xl font-bold text-slate-900">Pinley</Text>
        <Text className="mt-3 text-base text-slate-500">
          {user?.emailAddresses?.[0]?.emailAddress || "You are signed in"}
        </Text>
        <Text className={`mt-2 text-sm ${syncColor}`}>{syncText}</Text>
      </View>
    </SafeAreaView>
  );
}
