import { ActivityIndicator, Image, ScrollView, StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useRequests } from "../../../context/RequestsContext";
import {
  Avatar,
  ClayButton,
  ClayCard,
  clay,
  displayName,
} from "../../../components/clay";
import { formatPinCode } from "../../../utils/pincode";

// 👉 Add your illustration to: assets/images/pinley_image_circles.png
const CIRCLES_EMPTY_IMAGE = require("../../../../assets/images/pinley_image_circles.png");
// 👉 Add your illustration to: assets/images/pinley_image_black.png
const BANNER_IMAGE = require("../../../../assets/images/pinley_image_black.png");

function PersonCard({ person }) {
  return (
    <ClayCard style={{ marginBottom: 12 }}>
      <View className="flex-row items-center gap-4">
        <Avatar name={displayName(person)} uri={person.imageUrl} size={52} />
        <View className="flex-1">
          <Text numberOfLines={1} className="text-[15.5px] font-bold text-slate-900">
            {displayName(person)}
          </Text>
          <Text numberOfLines={1} className="mt-0.5 text-[12.5px] font-medium text-slate-500">
            {person.email || person.username}
          </Text>
          {person.pinCode ? (
            <Text className="mt-1 text-[12px] font-bold tracking-wider text-violet-700">
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
  return (
    <View
      className="mb-5 flex-row items-center rounded-[22px] bg-violet-50"
      style={{ paddingLeft: 18, paddingRight: 4, paddingVertical: 16 }}
    >
      <View
        className="mr-3 items-center justify-center rounded-full bg-violet-600"
        style={{ width: 42, height: 42 }}
      >
        <Ionicons name="people" size={19} color="#fff" />
      </View>

      <View className="flex-1 pr-1">
        <Text className="text-[16px] font-extrabold text-violet-700">
          Your circle, your way
        </Text>
        <Text className="mt-1 text-[12px] font-medium leading-[17px] text-slate-500">
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
  return (
    <View className="items-center px-2 pb-4 pt-2">
      <Image
        source={CIRCLES_EMPTY_IMAGE}
        resizeMode="contain"
        style={{ width: "100%", height: 260, marginBottom: 8 }}
      />

      <Text className="text-center text-[19px] font-bold text-slate-900">
        Your circle is empty
      </Text>
      <Text className="mt-2 text-center text-[13.5px] font-medium leading-5 text-slate-500">
        Create a circle and add the people who matter.{"\n"}Share moments, stay updated and know where your people are.
      </Text>
    </View>
  );
}

export default function Circles() {
  const router = useRouter();
  const { connections, connectionsLoading } = useRequests();

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: clay.bg }}>
      <StatusBar barStyle="dark-content" backgroundColor={clay.bg} />
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View className="mb-5 mt-2 flex-row items-center justify-between">
          <View>
            <Text className="text-[28px] font-bold text-slate-900 tracking-tight">
              Circles
            </Text>
            <Text className="mt-1 text-[13.5px] font-medium text-slate-500">
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
            <Text className="mb-2 text-[16px] font-bold text-slate-800">Connected</Text>
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