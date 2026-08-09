import { Image, Pressable, SafeAreaView, Text, View } from "react-native";
import { SignedIn, SignedOut, useClerk, useUser } from "@clerk/clerk-expo";
import AuthScreen from "../components/AuthScreen";

const LOGO = require("../../assets/images/pinley_image.png");

function SignedInHome() {
  const { user } = useUser();
  const { signOut } = useClerk();

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <View className="flex-1 items-center justify-center px-6">
        <Image source={LOGO} className="mb-6 h-24 w-24" resizeMode="contain" />
        <Text className="text-3xl font-bold text-white">Pinley</Text>
        <Text className="mt-3 text-base text-slate-400">
          {user?.emailAddresses?.[0]?.emailAddress || "You are signed in"}
        </Text>
        <Pressable
          onPress={() => signOut()}
          className="mt-8 items-center rounded-xl bg-red-500 px-8 py-3"
        >
          <Text className="text-base font-semibold text-white">Sign Out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

export default function Index() {
  return (
    <>
      <SignedIn>
        <SignedInHome />
      </SignedIn>
      <SignedOut>
        <AuthScreen />
      </SignedOut>
    </>
  );
}
