import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSSO, useSignIn, useSignUp, useAuth } from "@clerk/clerk-expo";
import * as Linking from "expo-linking";
import { syncUserToDatabase } from "../utils/api";

const LOGO = require("../../assets/images/pinley_image.png");

export default function AuthScreen({ initialMode = "signIn" }) {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { isLoaded: signInLoaded, signIn, setActive: setSignInActive } = useSignIn();
  const { isLoaded: signUpLoaded, signUp, setActive: setSignUpActive } = useSignUp();
  const { startSSOFlow } = useSSO();
  const { getToken } = useAuth();

  const syncNow = async () => {
    try {
      const token = await getToken();
      if (token) {
        await syncUserToDatabase(token);
      }
    } catch (err) {
      console.error("Account sync after sign in failed:", err);
    }
  };

  const isSignUp = mode === "signUp";
  const loaded = isSignUp ? signUpLoaded : signInLoaded;
  const setActive = isSignUp ? setSignUpActive : setSignInActive;

  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      const redirectUrl = Linking.createURL("/");
      const { createdSessionId, setActive: setSSOActive } = await startSSOFlow({
        strategy: "oauth_google",
        redirectUrl,
      });
      if (createdSessionId) {
        await setSSOActive?.({ session: createdSessionId });
        await syncNow();
      }
    } catch (err) {
      setError(
        err?.errors?.[0]?.longMessage ||
          err?.errors?.[0]?.message ||
          err?.message ||
          "Google sign in failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePrimary = async () => {
    setError("");
    setLoading(true);
    try {
      if (isSignUp) {
        const result = await signUp.create({ emailAddress: email, password });
        if (result.status === "complete") {
          await setActive({ session: result.createdSessionId });
          await syncNow();
          return;
        }
        await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
        setVerifying(true);
      } else {
        const result = await signIn.create({ identifier: email, password });
        if (result.status === "complete") {
          await setActive({ session: result.createdSessionId });
          await syncNow();
        } else {
          setError("Additional sign-in steps are required. Please try again.");
        }
      }
    } catch (err) {
      setError(
        err?.errors?.[0]?.longMessage ||
          err?.errors?.[0]?.message ||
          err?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await signUp.attemptEmailAddressVerification({ code });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        await syncNow();
      } else {
        setError("Verification was not completed. Please try again.");
      }
    } catch (err) {
      setError(
        err?.errors?.[0]?.longMessage ||
          err?.errors?.[0]?.message ||
          err?.message ||
          "Invalid verification code."
      );
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (next) => {
    setMode(next);
    setError("");
    setCode("");
    setVerifying(false);
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-slate-900"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="items-center">
          <Image source={LOGO} className="mb-6 h-24 w-24" resizeMode="contain" />
          <Text className="text-3xl font-bold text-white">Pinley</Text>
          <Text className="mt-2 text-sm text-slate-400">
            {verifying
              ? "Enter the verification code sent to your email"
              : isSignUp
                ? "Create your account to get started"
                : "Welcome back, sign in to continue"}
          </Text>
        </View>

        <View className="mt-8">
          <Pressable
            onPress={handleGoogle}
            disabled={loading}
            className="mb-6 flex-row items-center justify-center rounded-xl border border-slate-700 bg-slate-800 py-3"
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <View className="mr-3 h-6 w-6 items-center justify-center rounded-full bg-white">
                  <Text className="text-sm font-bold text-sky-500">G</Text>
                </View>
                <Text className="text-base font-semibold text-white">
                  Continue with Google
                </Text>
              </>
            )}
          </Pressable>

          <View className="mb-6 flex-row items-center gap-3">
            <View className="h-px flex-1 bg-slate-700" />
            <Text className="text-xs uppercase text-slate-500">
              {verifying ? "or" : "or use email"}
            </Text>
            <View className="h-px flex-1 bg-slate-700" />
          </View>

          {!verifying ? (
            <>
              <View className="mb-4 flex-row rounded-xl bg-slate-800 p-1">
                {["signIn", "signUp"].map((m) => (
                  <Pressable
                    key={m}
                    onPress={() => switchMode(m)}
                    className={`flex-1 items-center rounded-lg py-2 ${
                      mode === m ? "bg-sky-500" : ""
                    }`}
                  >
                    <Text
                      className={`text-sm font-semibold ${
                        mode === m ? "text-white" : "text-slate-400"
                      }`}
                    >
                      {m === "signIn" ? "Sign In" : "Sign Up"}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <View className="mb-4 rounded-xl bg-slate-800 px-4 py-3">
                <TextInput
                  className="text-base text-white"
                  placeholder="Email"
                  placeholderTextColor="#64748b"
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <View className="mb-4 rounded-xl bg-slate-800 px-4 py-3">
                <TextInput
                  className="text-base text-white"
                  placeholder="Password"
                  placeholderTextColor="#64748b"
                  secureTextEntry
                  autoCapitalize="none"
                  value={password}
                  onChangeText={setPassword}
                />
              </View>
            </>
          ) : (
            <>
              <View className="mb-4 rounded-xl bg-slate-800 px-4 py-3">
                <TextInput
                  className="text-base text-white"
                  placeholder="Verification code"
                  placeholderTextColor="#64748b"
                  keyboardType="number-pad"
                  value={code}
                  onChangeText={setCode}
                />
              </View>
              <Pressable
                onPress={() => {
                  setError("");
                  signUp.prepareEmailAddressVerification({ strategy: "email_code" });
                }}
                className="mb-4 items-center py-2"
              >
                <Text className="text-sm font-semibold text-sky-400">Resend code</Text>
              </Pressable>
            </>
          )}

          {error ? (
            <Text className="mb-4 text-center text-sm text-red-400">{error}</Text>
          ) : null}

          <Pressable
            onPress={verifying ? handleVerify : handlePrimary}
            disabled={!loaded || loading}
            className="items-center rounded-xl bg-sky-500 py-3"
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-base font-semibold text-white">
                {verifying
                  ? "Verify Email"
                  : isSignUp
                    ? "Create Account"
                    : "Sign In"}
              </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
