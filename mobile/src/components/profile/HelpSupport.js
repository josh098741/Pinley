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
import { Ionicons } from "@expo/vector-icons";
import { NavHeader, SectionLabel, Divider, NavRow } from "./common";
import { apiRequest } from "../../utils/api";
import { useTheme } from "../../theme/ThemeProvider";

const FAQ_ITEMS = [
  {
    q: "How do I add a friend?",
    a: "Share your PinCode with them, or enter their PinCode from the Circles tab to send a request.",
  },
  {
    q: "Who can see my location?",
    a: "Only people in circles you've explicitly shared your location with. You control this per-circle and can turn sharing off anytime in Location Services.",
  },
  {
    q: "What happens when I trigger SOS?",
    a: "Your trusted contacts get an immediate alert with your live location, updated in real time until you mark yourself safe.",
  },
  {
    q: "Does Pinley drain my battery?",
    a: "Background location can use noticeable battery. Use Battery Optimization settings to balance accuracy against battery life.",
  },
  {
    q: "How do I delete my account?",
    a: "Go to Profile → Account Settings → Delete Account. This permanently removes your data and can't be undone.",
  },
];

function FaqRow({ item, expanded, onToggle }) {
  const { colors } = useTheme();
  return (
    <View>
      <Pressable onPress={onToggle} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 16 }}>
        <Text style={{ flex: 1, paddingRight: 12, fontSize: 15, fontWeight: "600", color: colors.text }}>{item.q}</Text>
        <Ionicons name={expanded ? "remove" : "add"} size={18} color={colors.textMuted} />
      </Pressable>
      {expanded ? (
        <Text style={{ paddingBottom: 16, fontSize: 13, lineHeight: 20, color: colors.textMuted }}>{item.a}</Text>
      ) : null}
      <Divider />
    </View>
  );
}

export default function HelpSupportView({ onBack, user, getToken }) {
  const [expandedIdx, setExpandedIdx] = useState(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const { colors } = useTheme();

  const handleSubmitTicket = async () => {
    if (!message.trim()) {
      Alert.alert("Add a message", "Tell us what's going on before submitting.");
      return;
    }
    setSending(true);
    try {
      const token = await getToken();
      await apiRequest("/api/support/tickets", {
        token,
        method: "POST",
        body: { message, email: user?.emailAddresses?.[0]?.emailAddress },
      });
      setMessage("");
      Alert.alert("Sent", "Our team will get back to you within 24 hours.");
    } catch (err) {
      console.error("Failed to submit support ticket:", err);
      const subject = encodeURIComponent("Pinley Support");
      const body = encodeURIComponent(message);
      Linking.openURL(`mailto:support@pinley.app?subject=${subject}&body=${body}`);
      setMessage("");
    } finally {
      setSending(false);
    }
  };

  const handleEmailSupport = () => {
    Linking.openURL("mailto:support@pinley.app?subject=Pinley%20Support");
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
      <NavHeader title="Help & Support" onBack={onBack} />
      <ScrollView
        className="flex-1 px-6 pt-2"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        <SectionLabel>Frequently Asked</SectionLabel>
        <View style={cardStyle}>
          {FAQ_ITEMS.map((item, idx) => (
            <FaqRow
              key={item.q}
              item={item}
              expanded={expandedIdx === idx}
              onToggle={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
            />
          ))}
        </View>

        <SectionLabel>Contact Us</SectionLabel>
        <View style={{ ...cardStyle, paddingVertical: 16 }}>
          <Text style={{ marginBottom: 8, fontSize: 12, fontWeight: "700", color: colors.textFaint }}>Describe your issue</Text>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="What's going on?"
            placeholderTextColor={colors.textFaint}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            style={{
              minHeight: 90,
              borderRadius: 12,
              backgroundColor: colors.soft,
              padding: 12,
              fontSize: 14,
              color: colors.text,
            }}
          />
          <Pressable
            onPress={handleSubmitTicket}
            disabled={sending}
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
            {sending ? <ActivityIndicator size="small" color="#fff" /> : null}
            <Text style={{ fontSize: 13, fontWeight: "700", color: "#fff" }}>{sending ? "Sending…" : "Submit"}</Text>
          </Pressable>
        </View>

        <View style={{ marginTop: 16, ...cardStyle }}>
          <NavRow
            icon="mail"
            iconBg="bg-blue-600"
            label="Email Support"
            sublabel="support@pinley.app"
            onPress={handleEmailSupport}
            last
          />
        </View>
      </ScrollView>
    </View>
  );
}
