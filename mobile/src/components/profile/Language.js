import { useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, View } from "react-native";
import { NavHeader, SelectRow, PURPLE } from "./common";
import { useProfilePrefs } from "../../hooks/useProfilePrefs";

const LANGUAGES = [
  { code: "en", label: "English", native: "English" },
  { code: "sw", label: "Swahili", native: "Kiswahili" },
  { code: "fr", label: "French", native: "Français" },
  { code: "am", label: "Amharic", native: "አማርኛ" },
  { code: "ha", label: "Hausa", native: "Hausa" },
  { code: "yo", label: "Yoruba", native: "Yorùbá" },
  { code: "zu", label: "Zulu", native: "isiZulu" },
  { code: "ar", label: "Arabic", native: "العربية" },
];

export default function LanguageView({ onBack, user }) {
  const { prefs, save } = useProfilePrefs(user);
  const [saving, setSaving] = useState(false);
  const selected = prefs.language || "en";

  const selectLanguage = async (code) => {
    setSaving(true);
    const ok = await save({ language: code });
    if (!ok) Alert.alert("Couldn't update language", "Please try again.");
    setSaving(false);
  };

  return (
    <View className="flex-1 bg-white">
      <NavHeader title="Language" onBack={onBack} right={saving ? <ActivityIndicator size="small" color={PURPLE} /> : null} />
      <ScrollView
        className="flex-1 px-6 pt-2"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        <Text className="mb-4 text-[13px] leading-5 text-slate-500">
          Choose the language used throughout Pinley. Some content may still appear in English while
          translations are being finished.
        </Text>
        <View className="rounded-2xl border border-slate-200 px-4">
          {LANGUAGES.map((lang, idx) => (
            <SelectRow
              key={lang.code}
              label={lang.label}
              sublabel={lang.native}
              selected={selected === lang.code}
              onPress={() => selectLanguage(lang.code)}
              last={idx === LANGUAGES.length - 1}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}