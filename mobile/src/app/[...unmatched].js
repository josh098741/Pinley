import { useEffect } from "react";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, usePathname } from "expo-router";

export default function Unmatched() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    router.replace("/");
  }, [router, pathname]);

  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-slate-900">
      <Text className="text-sm text-slate-400">Redirecting…</Text>
    </SafeAreaView>
  );
}
