import { useEffect, useState } from "react";
import { Image, Pressable, SafeAreaView, Text, View } from "react-native";
import { useAuth, useClerk, useUser } from "@clerk/clerk-expo";
import { syncUserToDatabase } from "../../utils/api.js";

const LOGO = require("../../../assets/images/pinley_image.png");

export default function Home() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const { getToken, isSignedIn, sessionId } = useAuth();
  const [syncState, setSyncState] = useState("syncing");

  useEffect(() => {
    if (!isSignedIn || !sessionId) return;
    let cancelled = false;

    const performSync = async () => {
      let attempts = 0;
      const maxAttempts = 5;

      while (attempts < maxAttempts && !cancelled) {
        try {
          const token = await getToken();
          if (token) {
            const res = await syncUserToDatabase(token);
            if (res?.user && !cancelled) {
              setSyncState("synced");
              return;
            }
          }
        } catch (err) {
          console.error(`Account sync attempt ${attempts + 1} error:`, err);
        }
        attempts++;
        if (attempts < maxAttempts && !cancelled) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      if (!cancelled) {
        setSyncState("error");
      }
    };

    performSync();

    return () => {
      cancelled = true;
    };
  }, [isSignedIn, sessionId, getToken]);

  const syncColor = syncState === "synced" ? "text-green-400" : "text-amber-400";
  const syncText =
    syncState === "syncing"
      ? "Syncing your account…"
      : syncState === "synced"
        ? "Account synced to database"
        : "Account sync pending — check your connection";

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <View className="flex-1 items-center justify-center px-6">
        <Image source={LOGO} className="mb-6 h-24 w-24" resizeMode="contain" />
        <Text className="text-3xl font-bold text-white">Pinley</Text>
        <Text className="mt-3 text-base text-slate-400">
          {user?.emailAddresses?.[0]?.emailAddress || "You are signed in"}
        </Text>
        <Text className={`mt-2 text-sm ${syncColor}`}>{syncText}</Text>
        <Pressable
          onPress={() => signOut()}
          className="mt-8 items-center rounded-xl bg-red-500 px-8 py-3"
        >
          <Text className="text-base font-semibold text-white">Sign Out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
