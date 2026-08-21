import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NavHeader, SectionLabel, Divider, ToggleRow, RED } from "./common";
import { useProfilePrefs } from "../../hooks/useProfilePrefs";
import { useTheme } from "../../theme/ThemeProvider";

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
  const insets = useSafeAreaInsets();
  const { prefs, save, saving } = useProfilePrefs(user);
  const { colors, accent } = useTheme();
  const notifications = prefs.notifications;

  const togglePref = (key) => (value) => {
    save({ notifications: { [key]: value } });
  };

  const togglePush = (value) => {
    save({ notifications: { pushEnabled: value } });
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
      <NavHeader title="Notifications" onBack={onBack} />
      <ScrollView
        className="flex-1 px-6 pt-2"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 + insets.bottom }}
      >
        <View style={{ ...cardStyle, backgroundColor: colors.soft }}>
          <ToggleRow
            label="Push Notifications"
            description="Master switch for all Pinley notifications"
            value={notifications.pushEnabled}
            onValueChange={togglePush}
            icon="notifications"
            iconColor={accent.primary}
          />
        </View>

        {NOTIFICATION_GROUPS.map((group) => (
          <View key={group.label}>
            <SectionLabel>{group.label}</SectionLabel>
            <View style={cardStyle}>
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
            <ActivityIndicator size="small" color={accent.primary} />
            <Text style={{ fontSize: 12, color: colors.textFaint }}>Saving…</Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
