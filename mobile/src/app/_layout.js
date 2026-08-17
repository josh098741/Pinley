import "../global.css";
import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { Stack } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { RequestsProvider } from "../context/RequestsContext";
import { MapProvider } from "../context/MapContext";

WebBrowser.maybeCompleteAuthSession();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <RequestsProvider>
        <MapProvider>
          <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="setup-check" />
          <Stack.Screen name="sos" />
          <Stack.Screen
            name="request-search"
            options={{ presentation: "modal" }}
          />
          <Stack.Screen
            name="[...unmatched]"
            options={{ headerShown: false }}
          />
          </Stack>
        </MapProvider>
      </RequestsProvider>
    </ClerkProvider>
  );
}
