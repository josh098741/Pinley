import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useClerk } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { NavHeader, SectionLabel, Divider, SaveBar, GREEN, AMBER, RED } from "./common";
import { useProfilePrefs } from "../../hooks/useProfilePrefs";
import { apiRequest } from "../../utils/api";
import { useTheme } from "../../theme/ThemeProvider";

const PHONE_INPUT_FILTER = /[^\d+\-()\s.]/g;
const PHONE_E164 = /^\+?[1-9]\d{6,14}$/;

const sanitizePhone = (raw) => (raw ? raw.replace(PHONE_INPUT_FILTER, "") : "");
const isValidPhone = (raw) => {
  const norm = (raw || "").replace(/[^\d+]/g, "");
  return norm === "" || PHONE_E164.test(norm);
};

export default function AccountSettingsView({ onBack, user, getToken }) {
  const { signOut } = useClerk();
  const { prefs, save } = useProfilePrefs(user);
  const { colors } = useTheme();

  const initialName = user?.fullName || "";
  const initialPhone = prefs.account.phone || "";

  const [fullName, setFullName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const dirty = fullName !== initialName || phone !== initialPhone;
  const phoneError = phone.trim() !== "" && !isValidPhone(phone);
  const email = user?.emailAddresses?.[0]?.emailAddress || "";
  const emailVerified = user?.emailAddresses?.[0]?.verification?.status === "verified";

  const handleSave = async () => {
    if (phoneError) return;
    setSaving(true);
    try {
      const [firstName, ...rest] = fullName.trim().split(" ");
      await user?.update?.({ firstName, lastName: rest.join(" ") });
      await save({ account: { phone: phone.trim() } });

      const token = await getToken?.();
      if (token) {
        await apiRequest("/api/users/me", {
          token,
          method: "PATCH",
          body: { phoneNumber: phone.trim() },
        });
      }

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

  const cardStyle = {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    backgroundColor: colors.card,
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <NavHeader title="Account Settings" onBack={onBack} />
      <ScrollView
        className="flex-1 px-6 pt-2"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 220 }}
      >
        <SectionLabel>Personal Info</SectionLabel>
        <View style={cardStyle}>
          <View style={{ paddingVertical: 14 }}>
            <Text style={{ marginBottom: 6, fontSize: 12, fontWeight: "700", color: colors.textFaint }}>Full Name</Text>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="Your name"
              placeholderTextColor={colors.textFaint}
              style={{ fontSize: 15, fontWeight: "600", color: colors.text }}
            />
          </View>
          <Divider />
          <View style={{ paddingVertical: 14 }}>
            <Text style={{ marginBottom: 6, fontSize: 12, fontWeight: "700", color: colors.textFaint }}>Phone Number</Text>
            <TextInput
              value={phone}
              onChangeText={(text) => setPhone(sanitizePhone(text))}
              placeholder="+254 7XX XXX XXX"
              keyboardType="phone-pad"
              placeholderTextColor={colors.textFaint}
              style={{ fontSize: 15, fontWeight: "600", color: colors.text }}
            />
            {phoneError ? (
              <Text style={{ marginTop: 6, fontSize: 12, fontWeight: "500", color: RED }}>
                Enter a valid phone number (7-15 digits, optionally starting with +).
              </Text>
            ) : null}
          </View>
        </View>

        <SectionLabel>Login</SectionLabel>
        <View style={cardStyle}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 14 }}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={{ marginBottom: 4, fontSize: 12, fontWeight: "700", color: colors.textFaint }}>Email</Text>
              <Text style={{ fontSize: 15, fontWeight: "600", color: colors.text }}>{email}</Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                borderRadius: 999,
                paddingHorizontal: 10,
                paddingVertical: 4,
                backgroundColor: emailVerified ? "rgba(5,150,105,0.12)" : "rgba(217,119,6,0.12)",
              }}
            >
              <Ionicons
                name={emailVerified ? "checkmark-circle" : "alert-circle"}
                size={12}
                color={emailVerified ? GREEN : AMBER}
              />
              <Text
                style={{ color: emailVerified ? GREEN : AMBER, fontSize: 11, fontWeight: "700" }}
              >
                {emailVerified ? "Verified" : "Unverified"}
              </Text>
            </View>
          </View>
        </View>

        <SectionLabel>Danger Zone</SectionLabel>
        <View
          style={{
            borderRadius: 16,
            borderWidth: 1,
            borderColor: "rgba(225,29,72,0.25)",
            backgroundColor: "rgba(225,29,72,0.06)",
            paddingHorizontal: 16,
          }}
        >
          <Pressable
            onPress={handleDeleteAccount}
            disabled={deleting}
            style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 16 }}
          >
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={{ fontSize: 15, fontWeight: "700", color: RED }}>Delete Account</Text>
              <Text style={{ marginTop: 2, fontSize: 13, color: "rgba(225,29,72,0.8)" }}>
                Permanently remove your account and data
              </Text>
            </View>
            {deleting ? (
              <ActivityIndicator size="small" color={RED} />
            ) : (
              <Ionicons name="trash" size={18} color={RED} />
            )}
          </Pressable>
        </View>
      </ScrollView>
      <SaveBar visible={dirty} saving={saving} onSave={handleSave} onDiscard={handleDiscard} disabled={phoneError} />
    </View>
  );
}
