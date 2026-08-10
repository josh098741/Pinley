import { Redirect, Tabs } from "expo-router";
import { SignedIn, SignedOut } from "@clerk/clerk-expo";
import { View, Text } from "react-native";

function TabBarIcon({ label, active }) {
  return (
    <View className="items-center">
      <Text className={`text-xs font-semibold ${active ? "text-sky-400" : "text-slate-400"}`}>
        {label}
      </Text>
    </View>
  );
}

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
              tabBarIcon: ({ focused }) => <TabBarIcon label="Home" active={focused} />,
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: "Profile",
              tabBarIcon: ({ focused }) => <TabBarIcon label="Profile" active={focused} />,
            }}
          />
        </Tabs>
      </SignedIn>
    </>
  );
}
