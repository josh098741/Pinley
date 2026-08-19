import { ActivityIndicator, Alert, ScrollView, Text, View } from "react-native";
import { NavHeader, SectionLabel, Divider, ToggleRow, NavRow, RadioCard, AMBER, PURPLE } from "./common";
import { useProfilePrefs } from "../../hooks/useProfilePrefs";

const VISIBILITY_OPTIONS = [
  { key: "everyone", title: "Everyone", description: "Anyone with your PinCode can find and add you" },
  { key: "friends", title: "Friends of Friends", description: "Only people connected through your circles" },
  { key: "private", title: "Private", description: "Only people you've explicitly added" },
];

export default function PrivacySafetyView({ onBack, user }) {
  const { prefs, save, saving } = useProfilePrefs(user);
  const privacy = prefs.privacy;

  const updateVisibility = (key) => {
    save({ privacy: { visibility: key } });
  };

  const toggle = (key) => (value) => {
    save({ privacy: { [key]: value } });
  };

  const handleViewBlocked = () => {
    Alert.alert(
      "Blocked Users",
      "You haven't blocked anyone yet. Blocking is coming to a future update."
    );
  };

  const handleTrustedContacts = () => {
    Alert.alert("SOS Trusted Contacts", "Manage who gets notified when you trigger an SOS alert.");
  };

  return (
    <View className="flex-1 bg-white">
      <NavHeader title="Privacy & Safety" onBack={onBack} />
      <ScrollView
        className="flex-1 px-6 pt-2"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        <SectionLabel>Who Can Find You</SectionLabel>
        {VISIBILITY_OPTIONS.map((opt) => (
          <RadioCard
            key={opt.key}
            title={opt.title}
            description={opt.description}
            selected={privacy.visibility === opt.key}
            onPress={() => updateVisibility(opt.key)}
          />
        ))}

        <SectionLabel>Safety</SectionLabel>
        <View className="rounded-2xl border border-slate-200 px-4">
          <ToggleRow
            label="Share Live Location on SOS"
            description="Trusted contacts see your real-time location during an active alert"
            value={privacy.shareLiveLocationOnSOS}
            onValueChange={toggle("shareLiveLocationOnSOS")}
            icon="warning"
            iconColor={AMBER}
          />
          <Divider />
          <NavRow
            label="SOS Trusted Contacts"
            sublabel="Choose who's notified in an emergency"
            icon="people"
            iconBg="bg-red-500"
            onPress={handleTrustedContacts}
            last
          />
        </View>

        <SectionLabel>General</SectionLabel>
        <View className="rounded-2xl border border-slate-200 px-4">
          <ToggleRow
            label="Ghost Mode"
            description="Hide your location from everyone temporarily"
            value={privacy.ghostMode}
            onValueChange={toggle("ghostMode")}
            icon="eye-off"
          />
          <Divider />
          <ToggleRow
            label="Show Online Status"
            description="Let friends see when you're active in the app"
            value={privacy.showOnlineStatus}
            onValueChange={toggle("showOnlineStatus")}
            icon="radio-button-on"
          />
          <Divider />
          <ToggleRow
            label="Allow Friend Requests"
            description="Others can send you circle invites"
            value={privacy.allowFriendRequests}
            onValueChange={toggle("allowFriendRequests")}
            icon="person-add"
          />
        </View>

        <SectionLabel>Blocked</SectionLabel>
        <View className="rounded-2xl border border-slate-200 px-4">
          <NavRow
            label="Blocked Users"
            sublabel="No one blocked"
            icon="ban"
            iconBg="bg-slate-700"
            onPress={handleViewBlocked}
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