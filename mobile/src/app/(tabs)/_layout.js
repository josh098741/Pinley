import { Redirect, Tabs } from "expo-router";
import { SignedIn, SignedOut } from "@clerk/clerk-expo";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const ACTIVE = "#ffffff";
const INACTIVE = "#d8cffb";
const INDICATOR_INSET = 6; // horizontal gap between indicator and tab slot edges

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

function TabBarIcon({ icon, label, active }) {
  return (
    <>
      <Ionicons
        name={active ? icon : `${icon}-outline`}
        size={22}
        color={active ? ACTIVE : INACTIVE}
      />
      <Text style={[styles.tabLabel, { color: active ? ACTIVE : INACTIVE }]}>
        {label}
      </Text>
    </>
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
  const insets = useSafeAreaInsets();
  const [rowWidth, setRowWidth] = useState(0);

  // Only render routes that expose a tab bar icon. Screens registered with
  // `href: null` (e.g. the create-event flow) are reachable but hidden.
  const visibleRoutes = state.routes.filter(
    (route) => typeof descriptors[route.key]?.options?.tabBarIcon === "function"
  );
  const tabCount = visibleRoutes.length;
  const tabWidth = rowWidth / tabCount;

  const activeVisibleIndex = visibleRoutes.findIndex(
    (route) => route.key === state.routes[state.index]?.key
  );

  const translateX = useSharedValue(0);

  useEffect(() => {
    if (rowWidth > 0) {
      const focused = activeVisibleIndex < 0 ? 0 : activeVisibleIndex;
      translateX.value = withSpring(focused * tabWidth + INDICATOR_INSET, {
        damping: 18,
        stiffness: 180,
        mass: 0.6,
      });
    }
  }, [activeVisibleIndex, rowWidth]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  // Hide the bottom bar on the full-screen events screens.
  const activeRouteName = state.routeNames?.[state.index];
  if (
    activeRouteName === "events/index" ||
    activeRouteName === "events/create-event" ||
    activeRouteName === "events/[id]"
  ) {
    return null;
  }

  return (
    <View style={[styles.tabBarWrapper, { bottom: 24 + insets.bottom }]}>
      <View style={styles.tabBarPill}>
        <GlassBackground />
        <View
          style={styles.tabRow}
          onLayout={(e) => setRowWidth(e.nativeEvent.layout.width)}
        >
          {rowWidth > 0 && (
            <AnimatedLinearGradient
              colors={["rgba(196,181,253,0.9)", "rgba(124,58,237,0.55)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                styles.tabIndicator,
                { width: tabWidth - INDICATOR_INSET * 2 },
                indicatorStyle,
              ]}
            />
          )}
          {visibleRoutes.map((route, index) => {
            const { options } = descriptors[route.key];
            const isFocused = index === activeVisibleIndex;
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
                <View style={styles.tabButtonContent}>
                  {options.tabBarIcon({
                    focused: isFocused,
                    color: isFocused ? ACTIVE : INACTIVE,
                    size: 22,
                  })}
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

export const unstable_settings = {
  initialRouteName: "Home/index",
};

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
            name="Home/index"
            options={{
              title: "Home",
              tabBarIcon: ({ focused }) => (
                <TabBarIcon icon="home" label="Home" active={focused} />
              ),
            }}
          />
          <Tabs.Screen
            name="Circles/circles"
            options={{
              title: "Circles",
              tabBarIcon: ({ focused }) => (
                <TabBarIcon icon="people" label="Circles" active={focused} />
              ),
            }}
          />
          <Tabs.Screen
            name="Request/requests"
            options={{
              title: "Requests",
              tabBarIcon: ({ focused }) => (
                <TabBarIcon icon="mail" label="Requests" active={focused} />
              ),
            }}
          />
          {/* Reachable from the side panel / events flows, but hidden from the tab bar */}
          <Tabs.Screen
            name="events/index"
            options={{
              href: null,
              headerShown: false,
            }}
          />
          <Tabs.Screen
            name="Profile/profile"
            options={{
              title: "Profile",
              tabBarIcon: ({ focused }) => (
                <TabBarIcon icon="person" label="Profile" active={focused} />
              ),
            }}
          />
          {/* Reachable via the Events screen, but hidden from the tab bar */}
          <Tabs.Screen
            name="events/create-event"
            options={{
              href: null,
              headerShown: false,
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
    backgroundColor: "rgba(91,63,214,0.75)",
  },
  tabBarBgAndroid: {
    backgroundColor: "rgba(91,63,214,0.97)",
  },
  tabRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  tabIndicator: {
    position: "absolute",
    left: 0,
    top: 8,
    bottom: 8,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.55)",
    borderTopColor: "rgba(255,255,255,0.7)",
    borderBottomColor: "rgba(255,255,255,0.25)",
    shadowColor: "#c4b5fd",
    shadowOpacity: 0.7,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tabButtonContent: {
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 13,
  },
});