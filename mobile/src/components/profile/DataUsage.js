import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NavHeader, SectionLabel, Divider, ToggleRow, PURPLE } from "./common";
import { useProfilePrefs } from "../../hooks/useProfilePrefs";

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

  return (
    <View className="flex-1 bg-white">
      <NavHeader title="Data Usage" onBack={onBack} />
      <ScrollView
        className="flex-1 px-6 pt-2"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        <View className="rounded-2xl bg-slate-50 px-4 py-4">
          <Text className="text-[12px] font-bold uppercase tracking-widest text-slate-400">
            Cached Data
          </Text>
          <Text className="mt-1 text-[24px] font-extrabold text-slate-900">{formatBytes(cacheBytes)}</Text>
          <Text className="mt-1 text-[13px] text-slate-500">Map tiles, thumbnails, and offline data</Text>
          <Pressable
            onPress={handleClearCache}
            disabled={clearing || cacheBytes === 0}
            className="mt-3 flex-row items-center justify-center gap-2 rounded-full bg-slate-900 py-3"
          >
            {clearing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="trash-outline" size={14} color="#fff" />
            )}
            <Text className="text-[13px] font-bold text-white">
              {cacheBytes === 0 ? "Cache Cleared" : "Clear Cache"}
            </Text>
          </Pressable>
        </View>

        <SectionLabel>Preferences</SectionLabel>
        <View className="rounded-2xl border border-slate-200 px-4">
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
            <ActivityIndicator size="small" color={PURPLE} />
            <Text className="text-[12px] text-slate-400">Saving…</Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}