import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth, useClerk, useUser } from "@clerk/clerk-expo";
import * as Clipboard from "expo-clipboard";
import { ProfileHeader } from "../../../components/profile/ProfileHeader";
import { NavRow } from "../../../components/profile/common";
import { apiRequest } from "../../../utils/api";
import { formatPinCode } from "../../../utils/pincode";

import LocationServicesView from "../../../components/profile/LocationServices";
import AccountSettingsView from "../../../components/profile/AccountSettings";
import PrivacySafetyView from "../../../components/profile/PrivacySafety";
import NotificationsView from "../../../components/profile/Notifications";
import BatteryOptimizationView from "../../../components/profile/BatteryOptimization";
import DataUsageView from "../../../components/profile/DataUsage";
import AppearanceView from "../../../components/profile/Appearance";
import LanguageView from "../../../components/profile/Language";
import InviteFriendsView from "../../../components/profile/InviteFriends";
import HelpSupportView from "../../../components/profile/HelpSupport";
import AboutView from "../../../components/profile/About";

const VIEWS = {
  PROFILE: "profile",
  LOCATION: "location",
  ACCOUNT: "account",
  PRIVACY: "privacy",
  NOTIFICATIONS: "notifications",
  BATTERY: "battery",
  DATA: "data",
  APPEARANCE: "appearance",
  LANGUAGE: "language",
  INVITE: "invite",
  HELP: "help",
  ABOUT: "about",
};

export default function Profile() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const { signOut } = useClerk();
  const [pinCode, setPinCode] = useState(null);
  const [copying, setCopying] = useState(false);
  const [view, setView] = useState(VIEWS.PROFILE);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const data = await apiRequest("/api/auth/me", { token });
        if (!cancelled && data?.user?.pinCode) {
          setPinCode(data.user.pinCode);
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [getToken]);

  const copyCode = async () => {
    if (!pinCode) return;
    setCopying(true);
    try {
      await Clipboard.setStringAsync(formatPinCode(pinCode));
      Alert.alert("Copied", "Your PinCode is on your clipboard. Share it with the people you trust.");
    } finally {
      setCopying(false);
    }
  };

  const backToProfile = () => setView(VIEWS.PROFILE);

  if (view === VIEWS.LOCATION) {
    return <LocationServicesView onBack={backToProfile} user={user} />;
  }
  if (view === VIEWS.ACCOUNT) {
    return <AccountSettingsView onBack={backToProfile} user={user} />;
  }
  if (view === VIEWS.PRIVACY) {
    return <PrivacySafetyView onBack={backToProfile} user={user} />;
  }
  if (view === VIEWS.NOTIFICATIONS) {
    return <NotificationsView onBack={backToProfile} user={user} />;
  }
  if (view === VIEWS.BATTERY) {
    return <BatteryOptimizationView onBack={backToProfile} user={user} />;
  }
  if (view === VIEWS.DATA) {
    return <DataUsageView onBack={backToProfile} user={user} />;
  }
  if (view === VIEWS.APPEARANCE) {
    return <AppearanceView onBack={backToProfile} user={user} />;
  }
  if (view === VIEWS.LANGUAGE) {
    return <LanguageView onBack={backToProfile} user={user} />;
  }
  if (view === VIEWS.INVITE) {
    return <InviteFriendsView onBack={backToProfile} pinCode={pinCode} getToken={getToken} />;
  }
  if (view === VIEWS.HELP) {
    return <HelpSupportView onBack={backToProfile} user={user} getToken={getToken} />;
  }
  if (view === VIEWS.ABOUT) {
    return <AboutView onBack={backToProfile} />;
  }

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <ProfileHeader
          user={user}
          pinCode={pinCode}
          copying={copying}
          copyCode={copyCode}
          onHelp={() => setView(VIEWS.HELP)}
        />

        <SafeAreaView
          edges={["bottom"]}
          className="flex-1 rounded-t-[28px] bg-white"
          style={{ marginTop: -32 }}
        >
          <View className="px-6 pt-6">
            <View className="mb-10 flex-1">
              <NavRow icon="person" label="Account Settings" onPress={() => setView(VIEWS.ACCOUNT)} />
              <NavRow
                icon="location"
                iconBg="bg-purple-700"
                label="Location Services"
                onPress={() => setView(VIEWS.LOCATION)}
              />
              <NavRow icon="shield-checkmark" label="Privacy & Safety" onPress={() => setView(VIEWS.PRIVACY)} />
              <NavRow icon="notifications" label="Notifications" onPress={() => setView(VIEWS.NOTIFICATIONS)} />
              <NavRow
                icon="battery-half"
                iconBg="bg-emerald-700"
                label="Battery Optimization"
                onPress={() => setView(VIEWS.BATTERY)}
              />
              <NavRow icon="pie-chart" label="Data Usage" onPress={() => setView(VIEWS.DATA)} />
              <NavRow icon="color-palette" label="Appearance" onPress={() => setView(VIEWS.APPEARANCE)} />
              <NavRow icon="globe-outline" label="Language" onPress={() => setView(VIEWS.LANGUAGE)} />
              <NavRow
                icon="people"
                iconBg="bg-blue-600"
                label="Invite Friends"
                onPress={() => setView(VIEWS.INVITE)}
              />
              <NavRow icon="help-circle" label="Help & Support" onPress={() => setView(VIEWS.HELP)} />
              <NavRow icon="information-circle" label="About" onPress={() => setView(VIEWS.ABOUT)} last />

              <Pressable onPress={() => signOut()} className="mt-0 items-center py-4">
                <Text className="text-[15px] font-bold text-red-500">Log Out</Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </ScrollView>
    </View>
  );
}