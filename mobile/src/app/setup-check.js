import { useEffect, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useFonts } from "expo-font";
import Animated, {
  useSharedValue,
  withSpring,
  useAnimatedStyle,
} from "react-native-reanimated";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

function CheckRow({ label, status, detail }) {
  const color =
    status === "ok" ? "#22c55e" : status === "fail" ? "#ef4444" : "#eab308";
  const icon = status === "ok" ? "✓" : status === "fail" ? "✗" : "•";
  return (
    <View className="mb-2 flex-row items-start rounded-lg bg-slate-800 px-4 py-3">
      <Text style={{ color }} className="mr-3 text-lg font-bold">
        {icon}
      </Text>
      <View className="flex-1">
        <Text className="text-sm font-semibold text-white">{label}</Text>
        {detail ? (
          <Text className="mt-0.5 text-xs text-slate-400">{detail}</Text>
        ) : null}
      </View>
    </View>
  );
}

export default function SetupCheckScreen() {
  const [fontsLoaded] = useFonts({
    Inter: require("@expo-google-fonts/inter/400Regular/Inter_400Regular.ttf"),
  });

  const [secureStore, setSecureStore] = useState("loading");
  const [asyncStore, setAsyncStore] = useState("loading");
  const [reanimated, setReanimated] = useState("loading");

  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  useEffect(() => {
    scale.value = withSpring(1.4, {}, () => {
      scale.value = withSpring(1);
    });
    setReanimated("ok");

    (async () => {
      try {
        await SecureStore.setItemAsync("pinley_setup_test", "ok");
        const v = await SecureStore.getItemAsync("pinley_setup_test");
        setSecureStore(v === "ok" ? "ok" : "fail");
        await SecureStore.deleteItemAsync("pinley_setup_test");
      } catch {
        setSecureStore("fail");
      }
    })();

    (async () => {
      try {
        await AsyncStorage.setItem("pinley_setup_test", "ok");
        const v = await AsyncStorage.getItem("pinley_setup_test");
        setAsyncStore(v === "ok" ? "ok" : "fail");
        await AsyncStorage.removeItem("pinley_setup_test");
      } catch {
        setAsyncStore("fail");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allReady =
    fontsLoaded &&
    secureStore === "ok" &&
    asyncStore === "ok" &&
    reanimated === "ok";

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1 px-6 py-8"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="items-center">
          <Animated.View
            style={animStyle}
            className="mb-4 h-16 w-16 items-center justify-center rounded-2xl bg-sky-500 shadow-lg shadow-sky-500/30"
          >
            <Text className="text-2xl font-bold text-white">P</Text>
          </Animated.View>
          <Text className="text-2xl font-bold text-slate-900">Setup Check</Text>
          <Text className="mt-1 text-sm text-slate-500">
            Verify every integration is wired correctly
          </Text>
        </View>

        <View className="mt-6">
          <CheckRow
            label="NativeWind / Tailwind"
            status="ok"
            detail="This screen is styled with className utilities."
          />
          <CheckRow
            label="Custom Fonts (expo-font)"
            status={fontsLoaded ? "ok" : "loading"}
            detail={fontsLoaded ? "Inter loaded" : "Loading…"}
          />
          <CheckRow
            label="Reanimated"
            status={reanimated}
            detail="Spring animation ran on mount."
          />
          <CheckRow
            label="Secure Store"
            status={secureStore}
            detail="expo-secure-store read/write test."
          />
          <CheckRow
            label="Async Storage"
            status={asyncStore}
            detail="@react-native-async-storage read/write test."
          />
        </View>

        <View
          className={`mt-6 items-center rounded-xl px-5 py-4 ${
            allReady ? "bg-green-600/20" : "bg-amber-500/20"
          }`}
        >
          {allReady ? (
            <Text className="text-center text-sm font-semibold text-green-400">
              All checks passed — your setup is correct.
            </Text>
          ) : (
            <Text className="text-center text-sm font-semibold text-amber-400">
              Some checks still loading or failed — see above.
            </Text>
          )}
        </View>

        <Pressable
          className="mt-6 items-center rounded-xl bg-sky-500 py-3"
          onPress={() => {
            scale.value = withSpring(1.4, {}, () => {
              scale.value = withSpring(1);
            });
          }}
        >
          <Text className="font-semibold text-white">Re-run animation</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
