import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NavHeader, SectionLabel, Divider, ToggleRow } from "./common";
import { useProfilePrefs } from "../../hooks/useProfilePrefs";
import { useTheme } from "../../theme/ThemeProvider";

function formatBytes(bytes) {
  if (!bytes) return "0 MB";
  const mb = bytes / (1024 * 1024);
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  return `${(mb / 1024).toFixed(2)} GB`;
}

export default function DataUsageView({ onBack, user }) {
  const { prefs, save, saving } = useProfilePrefs(user);
  const [cacheBytes, setCacheBytes] = useState(48 * 1024 * 1024);
  const [clearing, setClearing] = useState(false);
  const { colors, accent } = useTheme();

  const toggle = (key) => (value) => {
    save({ data: { [key]: value } });
  };

  const handleClearCache = () => {
    Alert.alert("Clear Cached Data", `This will free up ${formatBytes(cacheBytes)} of map tiles and images.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: async () => {
          setClearing(true);
          await new Promise((r) => setTimeout(r, 700));
          setCacheBytes(0);
          setClearing(false);
        },
      },
    ]);
  };

  const cardStyle = {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    backgroundColor: colors.card,
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <NavHeader title="Data Usage" onBack={onBack} />
      <ScrollView
        className="flex-1 px-6 pt-2"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        <View style={{ ...cardStyle, backgroundColor: colors.soft, paddingVertical: 16 }}>
          <Text style={{ fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 2, color: colors.textFaint }}>
            Cached Data
          </Text>
          <Text style={{ marginTop: 4, fontSize: 24, fontWeight: "800", color: colors.text }}>{formatBytes(cacheBytes)}</Text>
          <Text style={{ marginTop: 4, fontSize: 13, color: colors.textMuted }}>Map tiles, thumbnails, and offline data</Text>
          <Pressable
            onPress={handleClearCache}
            disabled={clearing || cacheBytes === 0}
            style={{
              marginTop: 12,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              borderRadius: 999,
              backgroundColor: "#0f172a",
              paddingVertical: 12,
            }}
          >
            {clearing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="trash-outline" size={14} color="#fff" />
            )}
            <Text style={{ fontSize: 13, fontWeight: "700", color: "#fff" }}>
              {cacheBytes === 0 ? "Cache Cleared" : "Clear Cache"}
            </Text>
          </Pressable>
        </View>

        <SectionLabel>Preferences</SectionLabel>
        <View style={cardStyle}>
          <ToggleRow
            label="Reduce Data Usage"
            description="Lower-resolution maps and less frequent background sync"
            value={prefs.data.reduceDataMode}
            onValueChange={toggle("reduceDataMode")}
            icon="cellular"
          />
          <Divider />
          <ToggleRow
            label="Wi-Fi Only Map Downloads"
            description="Only download map tiles when connected to Wi-Fi"
            value={prefs.data.wifiOnlyMapTiles}
            onValueChange={toggle("wifiOnlyMapTiles")}
            icon="wifi"
          />
          <Divider />
          <ToggleRow
            label="Auto-Download Media"
            description="Automatically download photos shared in circles"
            value={prefs.data.autoDownloadMedia}
            onValueChange={toggle("autoDownloadMedia")}
            icon="image"
          />
        </View>

        {saving ? (
          <View className="mt-4 flex-row items-center gap-2">
            <ActivityIndicator size="small" color={accent.primary} />
            <Text style={{ fontSize: 12, color: colors.textFaint }}>Saving…</Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
