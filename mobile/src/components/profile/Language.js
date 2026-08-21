import { useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, View } from "react-native";
import { NavHeader, SelectRow } from "./common";
import { useProfilePrefs } from "../../hooks/useProfilePrefs";
import { useTheme } from "../../theme/ThemeProvider";

const LANGUAGES = [
  { code: "en", label: "English", native: "English" },
  { code: "sw", label: "Swahili", native: "Kiswahili" },
  { code: "fr", label: "French", native: "Français" },
  { code: "am", label: "Amharic", native: "አማርኛ" },
  { code: "ha", label: "Hausa", native: "Hausa" },
  { code: "yo", label: "Yoruba", native: "Yòrúbá" },
  { code: "zu", label: "Zulu", native: "isiZulu" },
  { code: "ar", label: "Arabic", native: "العربية" },
];

export default function LanguageView({ onBack, user }) {
  const { prefs, save } = useProfilePrefs(user);
  const { colors, accent } = useTheme();
  const [saving, setSaving] = useState(false);
  const selected = prefs.language || "en";

  const selectLanguage = async (code) => {
    setSaving(true);
    const ok = await save({ language: code });
    if (!ok) Alert.alert("Couldn't update language", "Please try again.");
    setSaving(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <NavHeader
        title="Language"
        onBack={onBack}
        right={saving ? <ActivityIndicator size="small" color={accent.primary} /> : null}
      />
      <ScrollView
        className="flex-1 px-6 pt-2"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        <Text style={{ marginBottom: 16, fontSize: 13, lineHeight: 20, color: colors.textMuted }}>
          Choose the language used throughout Pinley. Some content may still appear in English while
          translations are being finished.
        </Text>
        <View
          style={{
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.border,
            paddingHorizontal: 16,
            backgroundColor: colors.card,
          }}
        >
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
