import "../global.css";
import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as WebBrowser from "expo-web-browser";
import { RequestsProvider } from "../context/RequestsContext";
import { MapProvider } from "../context/MapContext";
import { EventsProvider } from "../context/EventsContext";

WebBrowser.maybeCompleteAuthSession();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <GestureHandlerRootView style={{ flex: 1 }}>
      <RequestsProvider>
        <MapProvider>
          <EventsProvider>
          <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="setup-check" />
          <Stack.Screen name="sos" />
          <Stack.Screen name="events" />
          <Stack.Screen name="create-event" />
          <Stack.Screen
            name="request-search"
            options={{ presentation: "modal" }}
          />
          <Stack.Screen
            name="[...unmatched]"
            options={{ headerShown: false }}
          />
          </Stack>
          </EventsProvider>
        </MapProvider>
      </RequestsProvider>
      </GestureHandlerRootView>
    </ClerkProvider>
  );
}
