import { Redirect, Tabs } from "expo-router";
import { SignedIn, SignedOut } from "@clerk/clerk-expo";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const ACTIVE = "#ffffff";
const INACTIVE = "#d8cffb";

function TabBarIcon({ icon, label, active }) {
  const content = (
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

  if (active) {
    return (
      <LinearGradient
        colors={["rgba(196,181,253,0.9)", "rgba(124,58,237,0.55)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.tabItem, styles.tabItemActive]}
      >
        {content}
      </LinearGradient>
    );
  }

  return <View style={styles.tabItem}>{content}</View>;
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
          <Tabs.Screen
            name="Profile/profile"
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
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tabItem: {
    height: 52,
    paddingHorizontal: 16,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "transparent",
  },
  tabItemActive: {
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
  tabLabel: {
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 13,
  },
}); 