import { StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Circles() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-3xl font-bold text-slate-900">Circles</Text>
        <Text className="mt-3 text-base text-slate-500">Coming soon</Text>
      </View>
    </SafeAreaView>
  );
}
