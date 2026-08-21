import { Linking, ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { NavHeader, SectionLabel, NavRow } from "./common";
import { useTheme } from "../../theme/ThemeProvider";

export default function AboutView({ onBack }) {
  const { colors, accent } = useTheme();
  const appVersion = Constants.expoConfig?.version || "1.0.0";
  const buildNumber =
    Constants.expoConfig?.ios?.buildNumber || Constants.expoConfig?.android?.versionCode || "1";

  const openUrl = (url) => Linking.openURL(url);

  const cardStyle = {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    backgroundColor: colors.card,
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <NavHeader title="About" onBack={onBack} />
      <ScrollView
        className="flex-1 px-6 pt-2"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        <View className="items-center py-6">
          <View style={{ backgroundColor: accent.primary }} className="h-16 w-16 items-center justify-center rounded-2xl">
            <Ionicons name="location" size={30} color="#fff" />
          </View>
          <Text style={{ marginTop: 12, fontSize: 18, fontWeight: "700", color: colors.text }}>Pinley</Text>
          <Text style={{ marginTop: 2, fontSize: 13, color: colors.textFaint }}>
            Version {appVersion} ({buildNumber})
          </Text>
        </View>

        <View style={cardStyle}>
          <NavRow icon="document-text" iconBg="bg-slate-700" label="Terms of Service" onPress={() => openUrl("https://pinley.app/terms")} />
          <NavRow icon="lock-closed" iconBg="bg-slate-700" label="Privacy Policy" onPress={() => openUrl("https://pinley.app/privacy")} />
          <NavRow icon="code-slash" iconBg="bg-slate-700" label="Open Source Licenses" onPress={() => openUrl("https://pinley.app/licenses")} last />
        </View>

        <SectionLabel>Connect</SectionLabel>
        <View style={cardStyle}>
          <NavRow icon="globe" iconBg="bg-blue-600" label="Website" onPress={() => openUrl("https://pinley.app")} />
          <NavRow icon="logo-instagram" iconBg="bg-pink-600" label="Instagram" onPress={() => openUrl("https://instagram.com/pinleyapp")} />
          <NavRow icon="logo-twitter" iconBg="bg-sky-500" label="X (Twitter)" onPress={() => openUrl("https://x.com/pinleyapp")} last />
        </View>

        <Text style={{ marginTop: 32, textAlign: "center", fontSize: 12, color: colors.textFaint }}>
          Made with care for Nairobi and beyond.{"\n"}© {new Date().getFullYear()} Pinley. All rights reserved.
        </Text>
      </ScrollView>
    </View>
  );
}
