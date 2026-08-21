import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Share,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { NavHeader, SectionLabel } from "./common";
import { apiRequest } from "../../utils/api";
import { formatPinCode } from "../../utils/pincode";
import { useTheme } from "../../theme/ThemeProvider";

export default function InviteFriendsView({ onBack, pinCode, getToken }) {
  const [loading, setLoading] = useState(true);
  const [inviteCount, setInviteCount] = useState(0);
  const [copying, setCopying] = useState(false);
  const [sharing, setSharing] = useState(false);
  const { colors, accent } = useTheme();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const data = await apiRequest("/api/auth/me", { token });
        if (!cancelled) setInviteCount(data?.user?.referralCount || 0);
      } catch (err) {
        console.error("Failed to load referral stats:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [getToken]);

  const inviteMessage = pinCode
    ? `Join me on Pinley! Add me with my PinCode: ${formatPinCode(pinCode)}. Download the app: https://pinley.app/download`
    : `Join me on Pinley! Download the app: https://pinley.app/download`;

  const handleShare = async () => {
    setSharing(true);
    try {
      await Share.share({ message: inviteMessage });
    } catch (err) {
      console.error("Failed to open share sheet:", err);
    } finally {
      setSharing(false);
    }
  };

  const handleCopy = async () => {
    setCopying(true);
    try {
      await Clipboard.setStringAsync(inviteMessage);
      Alert.alert("Copied", "Invite message copied to your clipboard.");
    } finally {
      setCopying(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <NavHeader title="Invite Friends" onBack={onBack} />
      <ScrollView
        className="flex-1 px-6 pt-2"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        <View style={{ backgroundColor: accent.primary }} className="items-center rounded-3xl px-6 py-8">
          <View className="mb-4 h-14 w-14 items-center justify-center rounded-full bg-white/20">
            <Ionicons name="people" size={26} color="#fff" />
          </View>
          <Text className="text-center text-[18px] font-bold text-white">
            Invite friends, build your circle
          </Text>
          <Text className="mt-2 text-center text-[13px] leading-5 text-white/75">
            Share your PinCode so friends can find you instantly on Pinley.
          </Text>

          {pinCode ? (
            <View className="mt-5 flex-row items-center gap-3 rounded-2xl bg-white/15 px-5 py-3">
              <Text
                className="text-[18px] font-extrabold tracking-[0.15em] text-white"
                style={{ fontVariant: ["tabular-nums"] }}
              >
                {formatPinCode(pinCode)}
              </Text>
              <Pressable onPress={handleCopy} disabled={copying}>
                {copying ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="copy-outline" size={16} color="#fff" />
                )}
              </Pressable>
            </View>
          ) : null}

          <Pressable
            onPress={handleShare}
            disabled={sharing}
            className="mt-5 w-full flex-row items-center justify-center gap-2 rounded-full bg-white py-3.5"
          >
            {sharing ? (
              <ActivityIndicator size="small" color={accent.primary} />
            ) : (
              <Ionicons name="share-social" size={16} color={accent.primary} />
            )}
            <Text style={{ color: accent.primary }} className="text-[14px] font-bold">
              Share Invite
            </Text>
          </Pressable>
        </View>

        <SectionLabel>Your Impact</SectionLabel>
        <View
          style={{
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.border,
            paddingHorizontal: 16,
            paddingVertical: 16,
            backgroundColor: colors.card,
          }}
        >
          {loading ? (
            <ActivityIndicator color={accent.primary} />
          ) : (
            <>
              <Text style={{ fontSize: 28, fontWeight: "800", color: colors.text }}>{inviteCount}</Text>
              <Text style={{ marginTop: 2, fontSize: 13, color: colors.textMuted }}>
                {inviteCount === 1 ? "friend joined" : "friends joined"} using your invite
              </Text>
            </>
          )}
        </View>

        <Text style={{ marginTop: 24, fontSize: 13, lineHeight: 20, color: colors.textFaint }}>
          When someone joins Pinley using your PinCode or invite link, they’re automatically added
          to your requests so you can start sharing your circle right away.
        </Text>
      </ScrollView>
    </View>
  );
}
