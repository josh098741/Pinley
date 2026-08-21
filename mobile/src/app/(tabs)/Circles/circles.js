import { ActivityIndicator, Image, ScrollView, StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useRequests } from "../../../context/RequestsContext";
import {
  Avatar,
  ClayButton,
  ClayCard,
  useClay,
  displayName,
} from "../../../components/clay";
import { useTheme } from "../../../theme/ThemeProvider";
import { formatPinCode } from "../../../utils/pincode";

// 👉 Add your illustration to: assets/images/pinley_image_circles.png
const CIRCLES_EMPTY_IMAGE = require("../../../../assets/images/pinley_image_circles.png");
// 👉 Add your illustration to: assets/images/pinley_image_black.png
const BANNER_IMAGE = require("../../../../assets/images/pinley_image_black.png");

function PersonCard({ person }) {
  const clay = useClay();
  const { colors, accent } = useTheme();
  return (
    <ClayCard style={{ marginBottom: 12 }}>
      <View className="flex-row items-center gap-4">
        <Avatar name={displayName(person)} uri={person.imageUrl} size={52} />
        <View className="flex-1">
          <Text numberOfLines={1} style={{ fontSize: 15.5, fontWeight: "700", color: colors.text }}>
            {displayName(person)}
          </Text>
          <Text numberOfLines={1} style={{ marginTop: 2, fontSize: 12.5, fontWeight: "500", color: colors.textMuted }}>
            {person.email || person.username}
          </Text>
          {person.pinCode ? (
            <Text style={{ marginTop: 4, fontSize: 12, fontWeight: "700", letterSpacing: 1, color: accent.primary }}>
              {formatPinCode(person.pinCode)}
            </Text>
          ) : null}
        </View>
        <Ionicons name="people" size={18} color={clay.success} />
      </View>
    </ClayCard>
  );
}

function InfoBanner() {
  const { colors, accent } = useTheme();
  return (
    <View
      style={{ marginBottom: 20, flexDirection: "row", alignItems: "center", borderRadius: 22, backgroundColor: accent.soft, paddingLeft: 18, paddingRight: 4, paddingVertical: 16 }}
    >
      <View
        style={{ marginRight: 12, alignItems: "center", justifyContent: "center", borderRadius: 999, backgroundColor: accent.primary, width: 42, height: 42 }}
      >
        <Ionicons name="people" size={19} color="#fff" />
      </View>

      <View style={{ flex: 1, paddingRight: 4 }}>
        <Text style={{ fontSize: 16, fontWeight: "800", color: accent.primary }}>
          Your circle, your way
        </Text>
        <Text style={{ marginTop: 4, fontSize: 12.5, fontWeight: "500", lineHeight: 17, color: colors.textMuted }}>
          Share moments, stay updated and know where your people are.
        </Text>
      </View>

      <Image
        source={BANNER_IMAGE}
        resizeMode="contain"
        style={{ width: 128, height: 128, marginRight: -6 }}
      />
    </View>
  );
}

function CirclesEmptyState() {
  const { colors } = useTheme();
  return (
    <View className="items-center px-2 pb-4 pt-2">
      <Image
        source={CIRCLES_EMPTY_IMAGE}
        resizeMode="contain"
        style={{ width: "100%", height: 260, marginBottom: 8 }}
      />

      <Text style={{ textAlign: "center", fontSize: 19, fontWeight: "700", color: colors.text }}>
        Your circle is empty
      </Text>
      <Text style={{ marginTop: 8, textAlign: "center", fontSize: 13.5, fontWeight: "500", lineHeight: 20, color: colors.textMuted }}>
        Create a circle and add the people who matter.{"\n"}Share moments, stay updated and know where your people are.
      </Text>
    </View>
  );
}

export default function Circles() {
  const router = useRouter();
  const { connections, connectionsLoading } = useRequests();
  const clay = useClay();
  const { colors, isDark } = useTheme();

  return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: clay.bg }}>
        <StatusBar
          barStyle={isDark ? "light-content" : "dark-content"}
          backgroundColor={clay.bg}
        />
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View className="mb-5 mt-2 flex-row items-center justify-between">
          <View>
            <Text style={{ fontSize: 28, fontWeight: "700", color: colors.text, letterSpacing: -0.5 }}>
              Circles
            </Text>
            <Text style={{ marginTop: 4, fontSize: 13.5, fontWeight: "500", color: colors.textMuted }}>
              {connections.length > 0
                ? `${connections.length} ${connections.length === 1 ? "person" : "people"} connected`
                : "Stay close to the people who matter"}
            </Text>
          </View>
          <ClayButton
            label="Add"
            icon="add"
            compact
            onPress={() => router.push("/request-search")}
          />
        </View>

        {connectionsLoading ? (
          <View className="items-center justify-center py-20">
            <ActivityIndicator color={clay.primary} size="large" />
            <Text className="mt-3 text-[13px] font-medium text-slate-400">
              Loading your circle…
            </Text>
          </View>
        ) : connections.length > 0 ? (
          <>
            <InfoBanner />
            <Text style={{ marginBottom: 8, fontSize: 16, fontWeight: "700", color: colors.text }}>Connected</Text>
            {connections.map((person) => (
              <PersonCard key={person._id} person={person} />
            ))}
          </>
        ) : (
          <>
            <InfoBanner />
            <CirclesEmptyState />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}