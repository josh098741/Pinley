import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useClerk } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { NavHeader, SectionLabel, Divider, NavRow, SaveBar, GREEN, AMBER, RED } from "./common";
import { useProfilePrefs } from "../../hooks/useProfilePrefs";

export default function AccountSettingsView({ onBack, user }) {
  const { signOut } = useClerk();
  const { prefs, save } = useProfilePrefs(user);

  const initialName = user?.fullName || "";
  const initialPhone = prefs.account.phone || "";

  const [fullName, setFullName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const dirty = fullName !== initialName || phone !== initialPhone;
  const email = user?.emailAddresses?.[0]?.emailAddress || "";
  const emailVerified = user?.emailAddresses?.[0]?.verification?.status === "verified";

  const handleSave = async () => {
    setSaving(true);
    try {
      const [firstName, ...rest] = fullName.trim().split(" ");
      await user?.update?.({ firstName, lastName: rest.join(" ") });
      await save({ account: { phone: phone.trim() } });
      Alert.alert("Saved", "Your account details have been updated.");
    } catch (err) {
      console.error("Failed to update account:", err);
      Alert.alert("Couldn't save", "Something went wrong updating your account. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setFullName(initialName);
    setPhone(initialPhone);
  };

  const handleChangePassword = () => {
    Alert.alert(
      "Change Password",
      "You'll be taken to a secure page to change your password.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Continue",
          onPress: () => Linking.openURL("https://accounts.pinley.app/user/security"),
        },
      ]
    );
  };

  const confirmDeleteAccount = async () => {
    setDeleting(true);
    try {
      await user?.delete?.();
      await signOut();
    } catch (err) {
      console.error("Failed to delete account:", err);
      Alert.alert("Couldn't delete account", "Please try again or contact support.");
      setDeleting(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This permanently deletes your Pinley account, your circles, and your location history. This can't be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Account",
          style: "destructive",
          onPress: confirmDeleteAccount,
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-white">
      <NavHeader title="Account Settings" onBack={onBack} />
      <ScrollView
        className="flex-1 px-6 pt-2"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 220 }}
      >
        <SectionLabel>Personal Info</SectionLabel>
        <View className="rounded-2xl border border-slate-200 px-4">
          <View className="py-3.5">
            <Text className="mb-1.5 text-[12px] font-bold text-slate-400">Full Name</Text>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="Your name"
              className="text-[15px] font-semibold text-slate-900"
            />
          </View>
          <Divider />
          <View className="py-3.5">
            <Text className="mb-1.5 text-[12px] font-bold text-slate-400">Phone Number</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="+254 7XX XXX XXX"
              keyboardType="phone-pad"
              className="text-[15px] font-semibold text-slate-900"
            />
          </View>
        </View>

        <SectionLabel>Login</SectionLabel>
        <View className="rounded-2xl border border-slate-200 px-4">
          <View className="flex-row items-center justify-between py-3.5">
            <View className="flex-1 pr-3">
              <Text className="mb-1 text-[12px] font-bold text-slate-400">Email</Text>
              <Text className="text-[15px] font-semibold text-slate-900">{email}</Text>
            </View>
            <View
              className={`flex-row items-center gap-1 rounded-full px-2.5 py-1 ${
                emailVerified ? "bg-emerald-50" : "bg-amber-50"
              }`}
            >
              <Ionicons
                name={emailVerified ? "checkmark-circle" : "alert-circle"}
                size={12}
                color={emailVerified ? GREEN : AMBER}
              />
              <Text
                style={{ color: emailVerified ? GREEN : AMBER }}
                className="text-[11px] font-bold"
              >
                {emailVerified ? "Verified" : "Unverified"}
              </Text>
            </View>
          </View>
          <Divider />
          <NavRow label="Change Password" icon="key" iconBg="bg-slate-800" onPress={handleChangePassword} last />
        </View>

        <SectionLabel>Danger Zone</SectionLabel>
        <View className="rounded-2xl border border-red-100 bg-red-50/40 px-4">
          <Pressable
            onPress={handleDeleteAccount}
            disabled={deleting}
            className="flex-row items-center justify-between py-4"
          >
            <View className="flex-1 pr-3">
              <Text className="text-[15px] font-bold text-red-500">Delete Account</Text>
              <Text className="mt-0.5 text-[13px] text-red-400">
                Permanently remove your account and data
              </Text>
            </View>
            {deleting ? <ActivityIndicator size="small" color={RED} /> : <Ionicons name="trash" size={18} color={RED} />}
          </Pressable>
        </View>
      </ScrollView>
      <SaveBar visible={dirty} saving={saving} onSave={handleSave} onDiscard={handleDiscard} />
    </View>
  );
}