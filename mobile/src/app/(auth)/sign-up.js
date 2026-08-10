import { Redirect } from "expo-router";
import { SignedIn, SignedOut } from "@clerk/clerk-expo";
import AuthScreen from "../../components/AuthScreen.js";

export default function SignUp() {
  return (
    <>
      <SignedIn>
        <Redirect href="/(tabs)" />
      </SignedIn>
      <SignedOut>
        <AuthScreen initialMode="signUp" />
      </SignedOut>
    </>
  );
}
