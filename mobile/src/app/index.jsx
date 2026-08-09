import { useEffect, useState } from "react";
import { Image, Pressable, SafeAreaView, Text, View } from "react-native";
import {
  SignedIn,
  SignedOut,
  useAuth,
  useClerk,
  useUser,
} from "@clerk/clerk-expo";
import AuthScreen from "../components/AuthScreen";
import { syncUserToDatabase } from "../utils/api";

const LOGO = require("../../assets/images/pinley_image.png");

function SignedInHome() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const { getToken } = useAuth();
  const [syncState, setSyncState] = useState("syncing");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const token = await getToken();
        if (!token) throw new Error("No session token");
        const { user: dbUser } = await syncUserToDatabase(token);
        if (!cancelled) {
          setSyncState(dbUser?.clerkUserId === user?.id ? "synced" : "synced");
        }
      } catch (_err) {
        if (!cancelled) setSyncState("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id, getToken]);

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

export default function Index() {
  return (
    <>
      <SignedIn>
        <SignedInHome />
      </SignedIn>
      <SignedOut>
        <AuthScreen />
      </SignedOut>
    </>
  );
}
