import { SafeAreaView, Text, View } from "react-native";

export default function Requests() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-3xl font-bold text-slate-900">Requests</Text>
        <Text className="mt-3 text-base text-slate-500">Coming soon</Text>
      </View>
    </SafeAreaView>
  );
}
