import { Redirect, Tabs } from "expo-router";
import { SignedIn, SignedOut } from "@clerk/clerk-expo";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
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
      <Text style={[styles.tabLabel, { color: active ? ACTIVE : INACTIVE }]}>
        {label}
      </Text>
    </View>
  );
}

function GlassBackground() {
  if (Platform.OS === "ios") {
    return (
      <BlurView
        intensity={85}
        tint="systemChromeMaterialDark"
        style={StyleSheet.absoluteFill}
      />
    );
  }
  return <View style={[StyleSheet.absoluteFill, styles.tabBarBgAndroid]} />;
}

function CustomTabBar({ state, descriptors, navigation }) {
  return (
    <View style={styles.tabBarWrapper}>
      <View style={styles.tabBarPill}>
        <GlassBackground />
        <View style={styles.tabRow}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;
            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };
            return (
              <Pressable
                key={route.key}
                onPress={onPress}
                style={styles.tabButton}
                accessibilityRole="button"
                accessibilityLabel={options.tabBarAccessibilityLabel}
                accessibilityState={isFocused ? { selected: true } : {}}
              >
                {options.tabBarIcon({
                  focused: isFocused,
                  color: isFocused ? ACTIVE : INACTIVE,
                  size: 22,
                })}
              </Pressable>
            );
          })}
        </View>
      </View>
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
          }}
          tabBar={(props) => <CustomTabBar {...props} />}
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
  tabBarWrapper: {
    position: "absolute",
    bottom: 24,
    left: 24,
    right: 24,
    height: 68,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  tabBarPill: {
    flex: 1,
    borderRadius: 34,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.15)",
    borderTopColor: "rgba(255,255,255,0.3)",
    borderBottomColor: "rgba(255,255,255,0.05)",
    backgroundColor: "rgba(15,23,42,0.4)",
  },
  tabBarBgAndroid: {
    backgroundColor: "rgba(15,23,42,0.75)",
  },
  tabRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  tabButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  tabItem: {
    width: 104,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  tabItemActive: {
    backgroundColor: "rgba(56,189,248,0.28)",
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 13,
  },
});
