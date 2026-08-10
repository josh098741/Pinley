import { Redirect, Tabs } from "expo-router";
import { SignedIn, SignedOut } from "@clerk/clerk-expo";
import { Platform, StyleSheet, Text, View } from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";

const ACTIVE = "#7dd3fc";
const INACTIVE = "#e2e8f0";

function TabBarIcon({ icon, label, active }) {
  return (
    <View style={[styles.tabItem, active && styles.tabItemActive]}>
      <Ionicons
        name={active ? icon : `${icon}-outline`}
        size={22}
        color={active ? ACTIVE : INACTIVE}
      />
      <Text 
        numberOfLines={1} 
        adjustsFontSizeToFit 
        style={[styles.tabLabel, { color: active ? ACTIVE : INACTIVE }]}
      >
        {label}
      </Text>
    </View>
  );
}

function GlassBackground() {
  return (
    <View style={StyleSheet.absoluteFill}>
      <BlurView
        intensity={Platform.OS === "ios" ? 85 : 100}
        tint={Platform.OS === "ios" ? "systemChromeMaterialDark" : "dark"}
        style={styles.tabBarBg}
      />
      <View style={[styles.tabBarBg, styles.purpleOverlay]} />
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
            tabBarShowLabel: false,
            tabBarActiveTintColor: ACTIVE,
            tabBarInactiveTintColor: INACTIVE,
            tabBarStyle: styles.tabBar,
            tabBarBackground: () => <GlassBackground />,
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: "Home",
              tabBarIcon: ({ focused }) => (
                <TabBarIcon icon="home" label="Home" active={focused} />
              ),
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: "Profile",
              tabBarIcon: ({ focused }) => (
                <TabBarIcon icon="person" label="Profile" active={focused} />
              ),
            }}
          />
        </Tabs>
      </SignedIn>
    </>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    bottom: 24,
    left: 24,
    right: 24,
    height: 68,
    borderRadius: 34,
    borderTopWidth: 0,
    backgroundColor: "transparent",
    elevation: 0,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
  tabBarBg: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 34,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.15)",
    borderTopColor: "rgba(255,255,255,0.3)",
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  purpleOverlay: {
    backgroundColor: "rgba(147, 51, 234, 0.25)",
    borderWidth: 0,
  },
  tabBarBgAndroid: {
    backgroundColor: "rgba(15,23,42,0.5)",
  },
  tabItem: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  tabItemActive: {},
  tabLabel: {
    fontSize: 11,
    fontWeight: "700",
  },
});
