import { StatusBar, Text, View, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { clay } from "../components/clay";

const STEPS = [
  {
    icon: "paper-plane",
    label: "Alert Sent",
    desc: "Your trusted contacts will receive the alert.",
    color: "#ef4444",
    bg: "rgba(239,68,68,0.12)",
  },
  {
    icon: "location",
    label: "Location Shared",
    desc: "Your current location is shared in real-time.",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.12)",
  },
  {
    icon: "notifications",
    label: "Help On The Way",
    desc: "Your contacts can respond and assist you.",
    color: "#22c55e",
    bg: "rgba(34,197,94,0.12)",
  },
];

export default function SOS() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: clay.bg }}>
      <StatusBar barStyle="dark-content" backgroundColor={clay.bg} />

      <View className="flex-1 px-5">
        {/* Back button + Header */}
        <View className="mt-2 flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              className="items-center justify-center rounded-2xl"
              style={{
                width: 40,
                height: 40,
                backgroundColor: "#fff",
                shadowColor: "#000",
                shadowOpacity: 0.06,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 2 },
              }}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={20} color={clay.purple} />
            </TouchableOpacity>

            <View style={{ maxWidth: 210 }}>
              <Text className="text-[20px] font-bold text-slate-900 tracking-tight">
                Emergency SOS
              </Text>
              <Text className="mt-0.5 text-[12.5px] font-medium leading-4 text-slate-500">
                Your safety is our priority. Reach out for help when you need
                it.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            className="flex-row items-center gap-1 rounded-full bg-white px-3 py-2"
            style={{
              shadowColor: "#000",
              shadowOpacity: 0.06,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 2 },
            }}
            onPress={() => {
              // 👉 navigate to "how it works" explainer
            }}
          >
            <Ionicons
              name="information-circle"
              size={16}
              color={clay.purple}
            />
            <Text
              className="text-[12.5px] font-bold"
              style={{ color: clay.purple }}
            >
              How it works
            </Text>
          </TouchableOpacity>
        </View>

        {/* Main SOS card */}
        <View
          className="mt-5 items-center rounded-[28px] px-6 pb-7 pt-9"
          style={{ backgroundColor: clay.primarySoft }}
        >
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              // 👉 wire up the actual SOS alert/notification here
            }}
          >
            <View
              className="items-center justify-center rounded-full"
              style={{
                width: 190,
                height: 190,
                backgroundColor: "rgba(124,58,237,0.1)",
              }}
            >
              <LinearGradient
                colors={[clay.primary, clay.primaryDeep]}
                style={{
                  width: 150,
                  height: 150,
                  borderRadius: 999,
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: clay.primary,
                  shadowOpacity: 0.35,
                  shadowRadius: 16,
                  shadowOffset: { width: 0, height: 8 },
                }}
              >
                <Ionicons name="warning" size={38} color="#fff" />
                <Text className="mt-1 text-[15px] font-extrabold tracking-wide text-white">
                  SEND SOS
                </Text>
              </LinearGradient>
            </View>
          </TouchableOpacity>

          <View
            className="mt-5 flex-row items-center gap-1 rounded-full px-3 py-1.5"
            style={{ backgroundColor: clay.primary }}
          >
            <Ionicons name="location" size={13} color="#fff" />
            <Text
              className="text-[12px] font-bold"
              style={{ color: "#fff" }}
            >
              Location will be shared
            </Text>
          </View>

          <Text className="mt-5 text-center text-[17px] font-bold text-slate-900">
            Need immediate help?
          </Text>
          <Text className="mt-1.5 text-center text-[13px] font-medium leading-5 text-slate-500">
            Press the button above to send an SOS alert to your trusted
            contacts and share your current location.
          </Text>
        </View>

        {/* What happens next */}
        <View
          className="mt-5 rounded-[24px] bg-white px-5 py-2.5"
          style={{
            shadowColor: "#000",
            shadowOpacity: 0.05,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
          }}
        >
          <Text className="text-[14px] font-bold text-slate-900">
            What happens next?
          </Text>

          <View className="mt-2.5 flex-row items-start">
            {STEPS.map((step, i) => (
              <View key={step.label} className="flex-1 flex-row items-start">
                <View className="flex-1 items-center px-1">
                  <View style={{ width: 56, height: 56 }}>
                    <View
                      className="items-center justify-center rounded-full"
                      style={{
                        width: 56,
                        height: 56,
                        backgroundColor: step.bg,
                      }}
                    >
                      <Ionicons name={step.icon} size={22} color={step.color} />
                    </View>
                    <View
                      className="absolute items-center justify-center rounded-full"
                      style={{
                        top: -2,
                        left: -2,
                        width: 18,
                        height: 18,
                        backgroundColor: step.color,
                        borderWidth: 2,
                        borderColor: "#fff",
                      }}
                    >
                      <Text
                        className="font-extrabold"
                        style={{ color: "#fff", fontSize: 10 }}
                      >
                        {i + 1}
                      </Text>
                    </View>
                  </View>

                  <Text
                    className="mt-2 text-center text-[12px] font-bold"
                    style={{ color: step.color }}
                  >
                    {step.label}
                  </Text>
                  <Text className="mt-1 text-center text-[11px] font-medium leading-4 text-slate-500">
                    {step.desc}
                  </Text>
                </View>

                {i < STEPS.length - 1 && (
                  <View
                    className="items-center justify-center"
                    style={{ width: 20, height: 56 }}
                  >
                    <View
                      style={{
                        width: "100%",
                        borderTopWidth: 2,
                        borderStyle: "dashed",
                        borderColor: "#cbd5e1",
                      }}
                    />
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Trusted contacts reminder */}
        <View
          className="mt-4 flex-row items-center justify-between rounded-2xl px-4 py-3.5"
          style={{ backgroundColor: clay.primarySoft }}
        >
          <View className="flex-row items-center gap-3" style={{ flex: 1 }}>
            <Ionicons name="people" size={20} color={clay.purple} />
            <Text className="flex-1 text-[12px] font-medium leading-4 text-slate-600">
              Make sure you have added trusted contacts in Settings for the
              SOS to work.
            </Text>
          </View>
          <TouchableOpacity
            className="flex-row items-center gap-0.5"
            onPress={() => {
              // 👉 navigate to Settings > Trusted Contacts
            }}
          >
            <Text
              className="text-[12px] font-bold"
              style={{ color: clay.purple }}
            >
              Manage Contacts
            </Text>
            <Ionicons name="chevron-forward" size={14} color={clay.purple} />
          </TouchableOpacity>
        </View>

        {/* Bottom fixed CTA */}
        <View className="mt-auto mb-6">
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => {
              // 👉 wire up the actual SOS alert/notification here
            }}
          >
            <LinearGradient
              colors={["#f43f5e", "#be123c"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="flex-row items-center justify-center py-4"
              style={{
                borderRadius: 999,
                shadowColor: clay.danger,
                shadowOpacity: 0.35,
                shadowRadius: 14,
                shadowOffset: { width: 0, height: 6 },
              }}
            >
              <Ionicons name="warning" size={18} color="#fff" />
              <Text className="ml-2 text-[15px] font-extrabold text-white">
                Send SOS Alert
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}