import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Redirect, useRouter } from "expo-router";
import {
  useAuth,
  useSignIn,
  useSignUp,
  useSSO,
} from "@clerk/clerk-expo";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { Ionicons } from "@expo/vector-icons";
import {
  useFonts as useManropeFonts,
  Manrope_500Medium,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from "@expo-google-fonts/manrope";
import {
  useFonts as useInterFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { API_URL_CANDIDATES } from "../../config";

const LOGO = require("../../../assets/images/pinley_image.png");

const REQUEST_TIMEOUT_MS = 8000;

export const syncUserToDatabase = async (token) => {
  let lastError;

  for (const baseUrl of API_URL_CANDIDATES) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(`${baseUrl}/api/auth/sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Sync failed with status ${response.status}`);
      }

      return response.json();
    } catch (err) {
      lastError = err;
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError;
};

const C = {
  bg: "#FFFFFF",
  heroTop: "#F2F7F5",
  accent: "#7C3AED",
  accentDeep: "#5B21B6",
  accentTint: "#EDE9FE",
  ink: "#12211D",
  muted: "#6C7873",
  faint: "#A9B2AE",
  line: "#ECEFEC",
  line2: "#E1E6E2",
  white: "#FFFFFF",
  error: "#D14343",
  errorBg: "#FCEEEE",
  placeholder: "#B8C0BC",
};

const F = {
  displayMed: "Manrope_500Medium",
  displayBold: "Manrope_700Bold",
  displayXBold: "Manrope_800ExtraBold",
  bodyReg: "Inter_400Regular",
  bodyMed: "Inter_500Medium",
  bodySemi: "Inter_600SemiBold",
  bodyBold: "Inter_700Bold",
};

const VALID_MODES = ["choice", "signin", "signup"];

export default function AuthScreen({ initialMode = "choice" }) {
  const router = useRouter();
  const { isLoaded: authLoaded, isSignedIn, getToken } = useAuth();
  const { startSSOFlow } = useSSO();
  const { signIn, setActive: setSignInActive, isLoaded: signInLoaded } = useSignIn();
  const { signUp, setActive: setSignUpActive, isLoaded: signUpLoaded } = useSignUp();

  const [manropeLoaded] = useManropeFonts({
    Manrope_500Medium,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });
  const [interLoaded] = useInterFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const fontsLoaded = manropeLoaded && interLoaded;

  useEffect(() => {
    if (Platform.OS !== "android") return;
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);

  const [mode, setMode] = useState(
    VALID_MODES.includes(initialMode) ? initialMode : "choice"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState("tos");

  const isSignUp = mode === "signup";

  const clerkErrorMessage = (err, fallback) =>
    err?.errors?.[0]?.longMessage ||
    err?.errors?.[0]?.message ||
    err?.message ||
    fallback;

  const syncNow = useCallback(async () => {
    try {
      const token = await getToken();
      if (token) {
        await syncUserToDatabase(token);
      }
    } catch (err) {
      console.error("Account sync after auth failed:", err);
    }
  }, [getToken]);

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setName("");
    setErrorMsg("");
    setShowPassword(false);
  };

  const handleGoogleSignIn = useCallback(async () => {
    if (!authLoaded || loading) return;
    setLoading(true);
    setErrorMsg("");
    try {
      const redirectUrl = Linking.createURL("/");
      const { createdSessionId, setActive: setSSOActive } = await startSSOFlow({
        strategy: "oauth_google",
        redirectUrl,
      });
      if (createdSessionId && setSSOActive) {
        await setSSOActive({ session: createdSessionId });
        await syncNow();
        router.replace("/(tabs)/Home");
      } else {
        setErrorMsg("Google sign-in needs one more step. Please try again.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Google SSO error", err);
      setErrorMsg(
        clerkErrorMessage(err, "Unable to complete Google sign-in. Please try again.")
      );
      setLoading(false);
    }
  }, [authLoaded, loading, startSSOFlow, syncNow, router]);

  if (isSignedIn) {
    return <Redirect href="/(tabs)/Home" />;
  }

  const handleEmailSignIn = async () => {
    if (!signInLoaded) return;
    if (!email.trim() || !password) {
      setErrorMsg("Please enter your email and password.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    try {
      const result = await signIn.create({ identifier: email.trim(), password });
      if (result.status === "complete") {
        await setSignInActive({ session: result.createdSessionId });
        await syncNow();
        router.replace("/(tabs)/Home");
      } else {
        setErrorMsg("Sign-in incomplete. Please try again.");
        setLoading(false);
      }
    } catch (err) {
      setErrorMsg(
        clerkErrorMessage(err, "Invalid email or password.")
      );
      setLoading(false);
    }
  };

  const handleEmailSignUp = async () => {
    if (!signUpLoaded) return;
    if (!email.trim() || !password) {
      setErrorMsg("Please enter your email and password.");
      return;
    }
    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    try {
      const parts = name.trim().split(" ");
      const result = await signUp.create({
        emailAddress: email.trim(),
        password,
        firstName: parts[0] || "",
        lastName: parts.slice(1).join(" ") || "",
      });

      if (result.status === "complete") {
        await setSignUpActive({ session: result.createdSessionId });
        await syncNow();
        router.replace("/(tabs)/Home");
        return;
      }

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
      setLoading(false);
    } catch (err) {
      setErrorMsg(
        clerkErrorMessage(err, "Sign-up failed. Please try again.")
      );
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!signUpLoaded) return;
    if (!verificationCode.trim()) {
      setErrorMsg("Please enter the verification code.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode.trim(),
      });
      if (result.status === "complete") {
        await setSignUpActive({ session: result.createdSessionId });
        await syncNow();
        router.replace("/(tabs)/Home");
      } else {
        setErrorMsg("Verification incomplete. Please try again.");
        setLoading(false);
      }
    } catch (err) {
      setErrorMsg(
        clerkErrorMessage(err, "Invalid code. Please try again.")
      );
      setLoading(false);
    }
  };

  const GoogleButton = ({ style }) => (
    <TouchableOpacity
      style={[s.btnSecondary, style]}
      onPress={handleGoogleSignIn}
      disabled={loading}
      activeOpacity={0.75}
    >
      {loading ? (
        <ActivityIndicator color={C.muted} size="small" />
      ) : (
        <>
          <View style={s.gIcon}>
            <Text style={s.gIconText}>G</Text>
          </View>
          <Text style={s.btnSecondaryText}>Continue with Google</Text>
        </>
      )}
    </TouchableOpacity>
  );

  const Divider = () => (
    <View style={s.dividerRow}>
      <View style={s.dividerLine} />
      <Text style={s.dividerText}>or</Text>
      <View style={s.dividerLine} />
    </View>
  );

  const ErrorBox = ({ msg }) =>
    msg ? (
      <View style={s.errorBox}>
        <Ionicons name="alert-circle" size={14} color={C.error} />
        <Text style={s.errorText}>{msg}</Text>
      </View>
    ) : null;

  const LoadingOverlay = () =>
    loading ? (
      <View style={s.loadingOverlay} pointerEvents="auto">
        <View style={s.loadingCard}>
          <ActivityIndicator color={C.accent} size="large" />
          <Text style={s.loadingTitle}>Signing you in...</Text>
          <Text style={s.loadingSub}>Keeping your session in sync</Text>
        </View>
      </View>
    ) : null;

  if (!authLoaded || !signInLoaded || !signUpLoaded || !fontsLoaded) {
    return (
      <SafeAreaView style={s.root}>
        <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
        <View style={s.bootLoading}>
          <ActivityIndicator color={C.accent} size="large" />
          <Text style={s.loadingSub}>Preparing secure sign-in...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (mode === "choice") {
    return (
      <SafeAreaView style={s.root}>
        <StatusBar barStyle="dark-content" backgroundColor={C.heroTop} />

        <View style={s.hero}>
          <Image source={LOGO} style={s.heroImage} />
        </View>

        <View style={s.sheet}>
          <ScrollView
            contentContainerStyle={s.sheetScroll}
            showsVerticalScrollIndicator={false}
          >
            <Text style={s.wordmark}>Welcome</Text>
            <Text style={s.tagline}>
              The simplest way to manage your money, bills, and savings â€” in one app.
            </Text>

            <View style={s.choiceButtons}>
              <GoogleButton />

              <Divider />

              <TouchableOpacity
                style={s.btnPrimary}
                onPress={() => {
                  resetForm();
                  setMode("signin");
                }}
                activeOpacity={0.85}
              >
                <Text style={s.btnPrimaryText}>Sign in with email</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={s.btnGhost}
                onPress={() => {
                  resetForm();
                  setMode("signup");
                }}
                activeOpacity={0.85}
              >
                <Text style={s.btnGhostText}>Create an account</Text>
              </TouchableOpacity>
            </View>

            <View style={s.legalTextWrap}>
              <Text style={s.legalTextBase}>By continuing you agree to our</Text>
              <View style={s.legalLinksRow}>
                <TouchableOpacity
                  onPress={() => {
                    setModalContent("tos");
                    setModalVisible(true);
                  }}
                >
                  <Text style={s.legalLink}>Terms of Service</Text>
                </TouchableOpacity>
                <Text style={s.legalTextBase}> & </Text>
                <TouchableOpacity
                  onPress={() => {
                    setModalContent("privacy");
                    setModalVisible(true);
                  }}
                >
                  <Text style={s.legalLink}>Privacy Policy</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>

        <Modal
          animationType="slide"
          transparent
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={s.modalOverlay}>
            <View style={s.modalContainer}>
              <View style={s.modalHeader}>
                <Text style={s.modalTitle}>
                  {modalContent === "tos" ? "Terms of Service" : "Privacy Policy"}
                </Text>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={s.modalCloseBtn}
                >
                  <Ionicons name="close" size={24} color={C.ink} />
                </TouchableOpacity>
              </View>
              <ScrollView style={s.modalScroll}>
                <Text style={s.modalBodyText}>
                  {modalContent === "tos"
                    ? 'Please read these Terms of Service ("Terms") carefully before using the Pinley mobile application.\n\n1. Acceptance of Terms\nBy accessing or using the Service you agree to be bound by these Terms.\n\n2. User Accounts\nWhen you create an account with us, you must provide us information that is accurate, complete, and current at all times.\n\n3. Intellectual Property\nThe Service and its original content are the exclusive property of Pinley.\n\n4. Termination\nWe may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever.\n\n5. Limitation of Liability\nIn no event shall Pinley be liable for any indirect, incidental, special, consequential or punitive damages.\n\n6. Contact Us\nIf you have any questions about these Terms, please contact us at terms@pinley.app.'
                    : "Welcome to Pinley. This Privacy Policy explains how we collect, use, disclose, and safeguard your information.\n\n1. Information We Collect\nWe may collect Personal Data (such as your name and email), Derivative Data, Financial Data, and Mobile Device Data.\n\n2. Use of Your Information\nWe may use information to create and manage your account, process transactions, and improve the Application.\n\n3. Disclosure of Your Information\nWe may share information by Law or to Protect Rights, or with Third-Party Service Providers.\n\n4. Security\nWe use administrative, technical, and physical security measures to help protect your personal information.\n\n5. Contact Us\nIf you have questions, contact privacy@pinley.app."}
                </Text>
              </ScrollView>
            </View>
          </View>
        </Modal>
        <LoadingOverlay />
      </SafeAreaView>
    );
  }

  if (pendingVerification) {
    return (
      <SafeAreaView style={s.root}>
        <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={s.formScroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <TouchableOpacity
              style={s.backBtn}
              onPress={() => setPendingVerification(false)}
            >
              <Ionicons name="arrow-back" size={20} color={C.muted} />
            </TouchableOpacity>

            <View style={s.verifyIconWrap}>
              <View style={s.verifyIconCircle}>
                <Ionicons name="mail-open-outline" size={28} color={C.accentDeep} />
              </View>
            </View>

            <Text style={s.formTitle}>Check your email</Text>
            <Text style={s.formSub}>
              We sent a 6-digit code to{"\n"}
              <Text style={{ color: C.ink, fontFamily: F.bodySemi }}>{email}</Text>
            </Text>

            <Text style={s.fieldLabel}>Verification code</Text>
            <TextInput
              style={[s.input, s.codeInput]}
              value={verificationCode}
              onChangeText={setVerificationCode}
              placeholder="000000"
              placeholderTextColor={C.placeholder}
              keyboardType="number-pad"
              maxLength={6}
              selectionColor={C.accent}
            />

            <ErrorBox msg={errorMsg} />

            <TouchableOpacity
              style={s.btnPrimary}
              onPress={handleVerifyCode}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={C.white} />
              ) : (
                <Text style={s.btnPrimaryText}>Verify & sign in</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
        <LoadingOverlay />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={s.formScroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={s.backBtn}
            onPress={() => {
              setMode("choice");
              resetForm();
            }}
          >
            <Ionicons name="arrow-back" size={20} color={C.muted} />
          </TouchableOpacity>

          <Text style={s.formTitle}>
            {isSignUp ? "Create account" : "Welcome back"}
          </Text>
          <Text style={s.formSub}>
            {isSignUp
              ? "Start tracking your finances"
              : "Sign in to your Pinley account"}
          </Text>

          {isSignUp && (
            <>
              <Text style={s.fieldLabel}>Full name</Text>
              <TextInput
                style={s.input}
                value={name}
                onChangeText={setName}
                placeholder="Your full name"
                placeholderTextColor={C.placeholder}
                autoCapitalize="words"
                selectionColor={C.accent}
              />
            </>
          )}

          <Text style={s.fieldLabel}>Email address</Text>
          <TextInput
            style={s.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={C.placeholder}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            selectionColor={C.accent}
          />

          <Text style={s.fieldLabel}>Password</Text>
          <View style={s.passwordRow}>
            <TextInput
              style={s.passwordInput}
              value={password}
              onChangeText={setPassword}
              placeholder={isSignUp ? "Min. 8 characters" : "Your password"}
              placeholderTextColor={C.placeholder}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              selectionColor={C.accent}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={s.eyeBtn}
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color={C.faint}
              />
            </TouchableOpacity>
          </View>

          <ErrorBox msg={errorMsg} />

          <TouchableOpacity
            style={s.btnPrimary}
            onPress={isSignUp ? handleEmailSignUp : handleEmailSignIn}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={C.white} />
            ) : (
              <Text style={s.btnPrimaryText}>
                {isSignUp ? "Create account" : "Sign in"}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={s.switchRow}
            onPress={() => {
              setMode(isSignUp ? "signin" : "signup");
              resetForm();
            }}
          >
            <Text style={s.switchText}>
              {isSignUp ? "Already have an account?  " : "Don't have an account?  "}
              <Text style={s.switchLink}>
                {isSignUp ? "Sign in" : "Sign up"}
              </Text>
            </Text>
          </TouchableOpacity>

          <Divider />
          <GoogleButton style={{ marginBottom: 0 }} />
        </ScrollView>
      </KeyboardAvoidingView>
      <LoadingOverlay />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },
  bootLoading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.82)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    zIndex: 999,
  },
  loadingCard: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.line2,
    borderRadius: 18,
    padding: 24,
    alignItems: "center",
    shadowColor: "#0F3C32",
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  loadingTitle: {
    color: C.ink,
    fontFamily: F.bodyBold,
    fontSize: 16,
    marginTop: 14,
  },
  loadingSub: {
    color: C.muted,
    fontFamily: F.bodyReg,
    fontSize: 12,
    marginTop: 6,
  },

  hero: {
    height: 320,
    backgroundColor: C.heroTop,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  heroImage: {
    width: 190,
    height: 190,
    resizeMode: "contain",
  },

  sheet: {
    flex: 1,
    marginTop: -40,
    backgroundColor: C.white,
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    borderWidth: 1,
    borderColor: C.line2,
    borderBottomWidth: 0,
    shadowColor: "#0F3C32",
    shadowOpacity: 0.1,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: -12 },
    elevation: 8,
  },
  sheetScroll: {
    paddingHorizontal: 26,
    paddingTop: 34,
    paddingBottom: 24,
  },
  wordmark: {
    fontFamily: F.displayXBold,
    fontSize: 26,
    letterSpacing: -0.3,
    color: C.ink,
    marginBottom: 6,
  },
  tagline: {
    fontFamily: F.bodyReg,
    fontSize: 14,
    color: C.muted,
    lineHeight: 20,
    marginBottom: 26,
    maxWidth: 280,
  },
  choiceButtons: {
    width: "100%",
  },
  legalTextWrap: {
    marginTop: 20,
    alignItems: "center",
  },
  legalTextBase: {
    fontFamily: F.bodyReg,
    fontSize: 11.5,
    color: C.faint,
    lineHeight: 18,
  },
  legalLinksRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  legalLink: {
    fontFamily: F.bodyBold,
    fontSize: 11.5,
    color: C.muted,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(18,33,29,0.4)",
  },
  modalContainer: {
    backgroundColor: C.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: "80%",
    paddingTop: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
  },
  modalTitle: {
    fontFamily: F.displayBold,
    fontSize: 18,
    color: C.ink,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalScroll: {
    padding: 24,
  },
  modalBodyText: {
    fontFamily: F.bodyReg,
    fontSize: 14,
    color: C.muted,
    lineHeight: 22,
  },

  btnPrimary: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: C.accent,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    shadowColor: C.accent,
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  btnPrimaryText: {
    color: C.white,
    fontFamily: F.bodyBold,
    fontSize: 16,
    letterSpacing: 0.1,
  },
  btnSecondary: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: C.white,
    borderWidth: 1.5,
    borderColor: C.line2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  btnSecondaryText: {
    color: C.ink,
    fontFamily: F.bodySemi,
    fontSize: 15,
  },
  btnGhost: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "transparent",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  btnGhostText: {
    color: C.muted,
    fontFamily: F.bodySemi,
    fontSize: 15,
  },
  gIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.line2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  gIconText: {
    fontSize: 11,
    fontFamily: F.bodyBold,
    color: "#ea4335",
  },

  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: C.line,
  },
  dividerText: {
    marginHorizontal: 14,
    fontSize: 12,
    fontFamily: F.bodyBold,
    color: C.faint,
  },

  formScroll: {
    flexGrow: 1,
    padding: 24,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    backgroundColor: C.bg,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.line2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  formTitle: {
    fontSize: 26,
    fontFamily: F.displayXBold,
    color: C.ink,
    letterSpacing: -0.2,
    marginBottom: 6,
  },
  formSub: {
    fontSize: 14,
    fontFamily: F.bodyReg,
    color: C.muted,
    marginBottom: 30,
    lineHeight: 20,
  },
  fieldLabel: {
    fontSize: 11,
    fontFamily: F.bodyBold,
    color: C.faint,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  input: {
    width: "100%",
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.line2,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontFamily: F.bodyMed,
    color: C.ink,
    marginBottom: 18,
  },
  codeInput: {
    textAlign: "center",
    fontSize: 26,
    letterSpacing: 12,
    fontFamily: F.bodyBold,
  },
  passwordRow: {
    width: "100%",
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.line2,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontFamily: F.bodyMed,
    color: C.ink,
  },
  eyeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 14,
  },

  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.errorBg,
    borderWidth: 1,
    borderColor: "rgba(209,67,67,0.18)",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: C.error,
    fontFamily: F.bodyMed,
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },

  switchRow: {
    alignItems: "center",
    paddingVertical: 16,
  },
  switchText: {
    fontSize: 14,
    fontFamily: F.bodyReg,
    color: C.muted,
  },
  switchLink: {
    color: C.accentDeep,
    fontFamily: F.bodyBold,
  },

  verifyIconWrap: {
    alignItems: "center",
    marginBottom: 24,
  },
  verifyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: C.accentTint,
    borderWidth: 1,
    borderColor: "rgba(124,58,237,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
});
