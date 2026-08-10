import { Redirect, Stack } from "expo-router";
import { SignedIn, SignedOut } from "@clerk/clerk-expo";

export default function AuthLayout() {
  return (
    <>
      <SignedIn>
        <Redirect href="/(tabs)" />
      </SignedIn>
      <SignedOut>
        <Stack screenOptions={{ headerShown: false }} />
      </SignedOut>
    </>
  );
}
