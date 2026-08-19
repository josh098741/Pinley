import { Linking, ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { NavHeader, SectionLabel, NavRow, PURPLE } from "./common";

export default function AboutView({ onBack }) {
  const appVersion = Constants.expoConfig?.version || "1.0.0";
  const buildNumber =
    Constants.expoConfig?.ios?.buildNumber || Constants.expoConfig?.android?.versionCode || "1";

  const openUrl = (url) => Linking.openURL(url);

  return (
    <View className="flex-1 bg-white">
      <NavHeader title="About" onBack={onBack} />
      <ScrollView
        className="flex-1 px-6 pt-2"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        <View className="items-center py-6">
          <View style={{ backgroundColor: PURPLE }} className="h-16 w-16 items-center justify-center rounded-2xl">
            <Ionicons name="location" size={30} color="#fff" />
          </View>
          <Text className="mt-3 text-[18px] font-bold text-slate-900">Pinley</Text>
          <Text className="mt-0.5 text-[13px] text-slate-400">
            Version {appVersion} ({buildNumber})
          </Text>
        </View>

        <View className="rounded-2xl border border-slate-200 px-4">
          <NavRow icon="document-text" iconBg="bg-slate-700" label="Terms of Service" onPress={() => openUrl("https://pinley.app/terms")} />
          <NavRow icon="lock-closed" iconBg="bg-slate-700" label="Privacy Policy" onPress={() => openUrl("https://pinley.app/privacy")} />
          <NavRow icon="code-slash" iconBg="bg-slate-700" label="Open Source Licenses" onPress={() => openUrl("https://pinley.app/licenses")} last />
        </View>

        <SectionLabel>Connect</SectionLabel>
        <View className="rounded-2xl border border-slate-200 px-4">
          <NavRow icon="globe" iconBg="bg-blue-600" label="Website" onPress={() => openUrl("https://pinley.app")} />
          <NavRow icon="logo-instagram" iconBg="bg-pink-600" label="Instagram" onPress={() => openUrl("https://instagram.com/pinleyapp")} />
          <NavRow icon="logo-twitter" iconBg="bg-sky-500" label="X (Twitter)" onPress={() => openUrl("https://x.com/pinleyapp")} last />
        </View>

        <Text className="mt-8 text-center text-[12px] text-slate-400">
          Made with care for Nairobi and beyond.{"\n"}© {new Date().getFullYear()} Pinley. All rights reserved.
        </Text>
      </ScrollView>
    </View>
  );
}