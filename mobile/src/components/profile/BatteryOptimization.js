import { ActivityIndicator, Linking, ScrollView, Text, View } from "react-native";
import { NavHeader, SectionLabel, Divider, ToggleRow, NavRow, RadioCard, PURPLE } from "./common";
import { useProfilePrefs } from "../../hooks/useProfilePrefs";

const ACCURACY_OPTIONS = [
  { key: "high", title: "High Accuracy", description: "Most precise location, uses more battery" },
  { key: "balanced", title: "Balanced", description: "Good accuracy with moderate battery use" },
  { key: "low", title: "Battery Saver", description: "Lower accuracy, best for battery life" },
];

export default function BatteryOptimizationView({ onBack, user }) {
  const { prefs, save, saving } = useProfilePrefs(user);
  const battery = prefs.battery;

  const updateAccuracy = (key) => {
    save({ battery: { accuracy: key } });
  };

  const toggle = (key) => (value) => {
    save({ battery: { [key]: value } });
  };

  return (
    <View className="flex-1 bg-white">
      <NavHeader title="Battery Optimization" onBack={onBack} />
      <ScrollView
        className="flex-1 px-6 pt-2"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        <SectionLabel>Location Accuracy</SectionLabel>
        {ACCURACY_OPTIONS.map((opt) => (
          <RadioCard
            key={opt.key}
            title={opt.title}
            description={opt.description}
            selected={battery.accuracy === opt.key}
            onPress={() => updateAccuracy(opt.key)}
          />
        ))}

        <SectionLabel>Behavior</SectionLabel>
        <View className="rounded-2xl border border-slate-200 px-4">
          <ToggleRow
            label="Background Updates"
            description="Keep sharing your location when Pinley isn't open"
            value={battery.backgroundUpdates}
            onValueChange={toggle("backgroundUpdates")}
            icon="sync"
          />
          <Divider />
          <ToggleRow
            label="Pause When Still"
            description="Stop pinging your location if you haven't moved in a while"
            value={battery.pauseWhenStill}
            onValueChange={toggle("pauseWhenStill")}
            icon="pause-circle"
          />
          <Divider />
          <ToggleRow
            label="Low Power Fallback"
            description="Automatically reduce accuracy when your battery is low"
            value={battery.lowPowerFallback}
            onValueChange={toggle("lowPowerFallback")}
            icon="battery-charging"
          />
        </View>

        <SectionLabel>System</SectionLabel>
        <View className="rounded-2xl border border-slate-200 px-4">
          <NavRow
            label="Device Battery Settings"
            sublabel="Exclude Pinley from system battery optimization"
            icon="settings"
            iconBg="bg-slate-700"
            onPress={() => Linking.openSettings()}
            last
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