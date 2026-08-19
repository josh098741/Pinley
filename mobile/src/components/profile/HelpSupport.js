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
  return (
    <View>
      <Pressable onPress={onToggle} className="flex-row items-center justify-between py-4">
        <Text className="flex-1 pr-3 text-[15px] font-semibold text-slate-900">{item.q}</Text>
        <Ionicons name={expanded ? "remove" : "add"} size={18} color="#475569" />
      </Pressable>
      {expanded ? (
        <Text className="pb-4 text-[13px] leading-5 text-slate-500">{item.a}</Text>
      ) : null}
      <Divider />
    </View>
  );
}

export default function HelpSupportView({ onBack, user, getToken }) {
  const [expandedIdx, setExpandedIdx] = useState(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

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

  return (
    <View className="flex-1 bg-white">
      <NavHeader title="Help & Support" onBack={onBack} />
      <ScrollView
        className="flex-1 px-6 pt-2"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        <SectionLabel>Frequently Asked</SectionLabel>
        <View>
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
        <View className="rounded-2xl border border-slate-200 px-4 py-4">
          <Text className="mb-2 text-[12px] font-bold text-slate-400">Describe your issue</Text>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="What's going on?"
            multiline
            numberOfLines={4}
            className="min-h-[90px] rounded-xl bg-slate-50 p-3 text-[14px] text-slate-900"
            textAlignVertical="top"
          />
          <Pressable
            onPress={handleSubmitTicket}
            disabled={sending}
            className="mt-3 flex-row items-center justify-center gap-2 rounded-full bg-slate-900 py-3"
          >
            {sending ? <ActivityIndicator size="small" color="#fff" /> : null}
            <Text className="text-[13px] font-bold text-white">{sending ? "Sending…" : "Submit"}</Text>
          </Pressable>
        </View>

        <View className="mt-4 rounded-2xl border border-slate-200 px-4">
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