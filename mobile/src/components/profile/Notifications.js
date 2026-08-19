import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { NavHeader, SectionLabel, Divider, ToggleRow, PURPLE, RED } from "./common";
import { useProfilePrefs } from "../../hooks/useProfilePrefs";

const NOTIFICATION_GROUPS = [
  {
    label: "Social",
    items: [
      { key: "friendRequests", label: "Friend Requests", description: "When someone sends you a request", icon: "person-add" },
      { key: "circleInvites", label: "Circle Invites", description: "When you're invited to a new circle", icon: "people-circle" },
      { key: "chatMessages", label: "Messages", description: "New messages from friends", icon: "chatbubble-ellipses" },
      { key: "nearbyFriends", label: "Nearby Friends", description: "When a friend is close by", icon: "navigate" },
    ],
  },
  {
    label: "Safety",
    items: [
      { key: "sosAlerts", label: "SOS Alerts", description: "Emergency alerts from your circles", icon: "warning", iconColor: RED },
      { key: "locationAlerts", label: "Location Alerts", description: "Arrival & departure notifications", icon: "location" },
    ],
  },
  {
    label: "Events",
    items: [
      { key: "eventInvites", label: "Event Invites", description: "When you're invited to an event", icon: "calendar" },
      { key: "eventReminders", label: "Event Reminders", description: "Reminders before events start", icon: "alarm" },
    ],
  },
  {
    label: "Other",
    items: [
      { key: "appUpdates", label: "App Updates", description: "New features and improvements", icon: "sparkles" },
      { key: "productTips", label: "Tips & Suggestions", description: "Occasional tips to get more from Pinley", icon: "bulb" },
    ],
  },
];

export default function NotificationsView({ onBack, user }) {
  const { prefs, save, saving } = useProfilePrefs(user);
  const notifications = prefs.notifications;

  const togglePref = (key) => (value) => {
    save({ notifications: { [key]: value } });
  };

  const togglePush = (value) => {
    save({ notifications: { pushEnabled: value } });
  };

  return (
    <View className="flex-1 bg-white">
      <NavHeader title="Notifications" onBack={onBack} />
      <ScrollView
        className="flex-1 px-6 pt-2"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        <View className="rounded-2xl bg-slate-50 px-4">
          <ToggleRow
            label="Push Notifications"
            description="Master switch for all Pinley notifications"
            value={notifications.pushEnabled}
            onValueChange={togglePush}
            icon="notifications"
            iconColor={PURPLE}
          />
        </View>

        {NOTIFICATION_GROUPS.map((group) => (
          <View key={group.label}>
            <SectionLabel>{group.label}</SectionLabel>
            <View className="rounded-2xl border border-slate-200 px-4">
              {group.items.map((item, idx) => (
                <View key={item.key}>
                  <ToggleRow
                    label={item.label}
                    description={item.description}
                    value={notifications.pushEnabled ? notifications[item.key] : false}
                    onValueChange={togglePref(item.key)}
                    disabled={!notifications.pushEnabled}
                    icon={item.icon}
                    iconColor={item.iconColor}
                  />
                  {idx < group.items.length - 1 && <Divider />}
                </View>
              ))}
            </View>
          </View>
        ))}

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