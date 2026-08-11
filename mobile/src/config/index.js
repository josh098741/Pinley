import Constants from "expo-constants";
import { Platform } from "react-native";

const getHostCandidates = () => {
  const hosts = new Set();
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.manifest2?.extra?.expoGo?.debuggerHost ||
    Constants.expoGoConfig?.debuggerHost;
  if (hostUri) {
    hosts.add(hostUri.split(":")[0]);
  }
  if (Platform.OS === "android") {
    hosts.add("10.0.2.2");
  }
  hosts.add("localhost");
  return [...hosts].map((host) => `http://${host}:5000`);
};

const envUrl = process.env.EXPO_PUBLIC_API_URL;

export const API_URL_CANDIDATES = [
  envUrl,
  ...getHostCandidates(),
  "https://pinley.vercel.app",
].filter(Boolean);

export const API_URL = API_URL_CANDIDATES[0];

export const SOCKET_URL_CANDIDATES = API_URL_CANDIDATES.map((url) =>
  url.replace(/^http/, "ws")
);
