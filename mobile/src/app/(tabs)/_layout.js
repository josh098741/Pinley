import { Redirect, Tabs } from "expo-router";
import { SignedIn, SignedOut } from "@clerk/clerk-expo";
import { FontAwesome } from "@expo/vector-icons";

export default function TabsLayout() {
  return (
    <>
      <SignedOut>
        <Redirect href="/(auth)" />
      </SignedOut>
      <SignedIn>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: { backgroundColor: "#0f172a", borderTopColor: "#1e293b" },
            tabBarActiveTintColor: "#38bdf8",
            tabBarInactiveTintColor: "#64748b",
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: "Home",
              tabBarIcon: ({ color, size }) => (
                <FontAwesome name="home" color={color} size={size} />
              ),
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: "Profile",
              tabBarIcon: ({ color, size }) => (
                <FontAwesome name="user" color={color} size={size} />
              ),
            }}
          />
        </Tabs>
      </SignedIn>
    </>
  );
}
