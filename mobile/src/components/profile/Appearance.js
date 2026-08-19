import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NavHeader, SectionLabel, ToggleRow, RadioCard, PURPLE } from "./common";
import { useProfilePrefs } from "../../hooks/useProfilePrefs";

const THEME_OPTIONS = [
  { key: "system", title: "System", description: "Match your device settings", icon: "phone-portrait" },
  { key: "light", title: "Light", description: "Bright and clean", icon: "sunny" },
  { key: "dark", title: "Dark", description: "Easier on the eyes at night", icon: "moon" },
];

const ACCENT_COLORS = [
  { key: "purple", value: "#5B3FD6" },
  { key: "blue", value: "#2563eb" },
  { key: "emerald", value: "#059669" },
  { key: "rose", value: "#e11d48" },
  { key: "amber", value: "#d97706" },
];

export default function AppearanceView({ onBack, user }) {
  const { prefs, save, saving } = useProfilePrefs(user);
  const appearance = prefs.appearance;

  const updateTheme = (key) => {
    save({ appearance: { theme: key } });
  };

  const updateAccent = (key) => {
    save({ appearance: { accentColor: key } });
  };

  const toggleReduceMotion = (value) => {
    save({ appearance: { reduceMotion: value } });
  };

  return (
    <View className="flex-1 bg-white">
      <NavHeader title="Appearance" onBack={onBack} />
      <ScrollView
        className="flex-1 px-6 pt-2"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        <SectionLabel>Theme</SectionLabel>
        {THEME_OPTIONS.map((opt) => (
          <RadioCard
            key={opt.key}
            title={opt.title}
            description={opt.description}
            selected={appearance.theme === opt.key}
            onPress={() => updateTheme(opt.key)}
          />
        ))}

        <SectionLabel>Accent Color</SectionLabel>
        <View className="flex-row flex-wrap gap-4 py-2">
          {ACCENT_COLORS.map((c) => (
            <Pressable key={c.key} onPress={() => updateAccent(c.key)} className="items-center">
              <View
                style={{ backgroundColor: c.value }}
                className="h-11 w-11 items-center justify-center rounded-full"
              >
                {appearance.accentColor === c.key ? <Ionicons name="checkmark" size={18} color="#fff" /> : null}
              </View>
            </Pressable>
          ))}
        </View>

        <SectionLabel>Motion</SectionLabel>
        <View className="rounded-2xl border border-slate-200 px-4">
          <ToggleRow
            label="Reduce Motion"
            description="Minimize animations across the app"
            value={appearance.reduceMotion}
            onValueChange={toggleReduceMotion}
            icon="contract"
          />
        </View>

        {saving ? (
          <View className="mt-4 flex-row items-center gap-2">
            <ActivityIndicator size="small" color={PURPLE} />
            <Text className="text-[12px] text-slate-400">Saving…</Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}