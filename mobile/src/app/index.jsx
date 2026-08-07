import { SafeAreaView, Text, View } from "react-native";

export default function Index() {
  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <View className="flex-1 items-center justify-center px-6">
        <View className="mb-6 h-20 w-20 items-center justify-center rounded-2xl bg-sky-500 shadow-lg shadow-sky-500/30">
          <Text className="text-3xl font-bold text-white">P</Text>
        </View>
        <Text className="text-3xl font-bold text-white">Pinley</Text>
        <Text className="mt-2 text-base text-slate-400">
          NativeWind is working
        </Text>
        <View className="mt-8 rounded-xl bg-slate-800 px-5 py-3">
          <Text className="text-sm text-slate-300">
            If you can see this styled screen, your setup is correct.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
