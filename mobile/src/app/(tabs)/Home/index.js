import { useEffect, useRef, useState } from "react";
import { Image, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { syncUserToDatabase } from "../../(auth)/index.js";
import MapBoxView from "../../../components/MapBoxView.js";
import Mapbox from "../../../config/mapbox.js";

const LOGO = require("../../../../assets/images/pinley_image.png");

// Default coordinates (New York City center)
const DEFAULT_CENTER = [-73.985664, 40.748514];

export default function Home() {
  const { user } = useUser();
  const { getToken, isSignedIn, sessionId } = useAuth();
  const [syncState, setSyncState] = useState("syncing");
  const [centerCoord, setCenterCoord] = useState(DEFAULT_CENTER);
  const [zoom, setZoom] = useState(13);
  const insets = useSafeAreaInsets();
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  useEffect(() => {
    if (!isSignedIn || !sessionId) return;
    let cancelled = false;
    setSyncState("syncing");

    const performSync = async () => {
      try {
        const token = await getTokenRef.current();
        if (!token || cancelled) return;
        const res = await syncUserToDatabase(token);
        if (res?.user && !cancelled) {
          setSyncState("synced");
        } else if (!cancelled) {
          setSyncState("error");
        }
      } catch (err) {
        console.error("Account sync error:", err);
        if (!cancelled) {
          setSyncState("error");
        }
      }
    };

    performSync();

    return () => {
      cancelled = true;
    };
  }, [isSignedIn, sessionId]);

  const syncColor = syncState === "synced" ? "bg-emerald-500" : "bg-amber-500";
  const syncText =
    syncState === "syncing"
      ? "Syncing"
      : syncState === "synced"
        ? "Connected"
        : "Pending";

  return (
    <View className="flex-1 bg-slate-950">
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Map view rendering as the primary full-screen background */}
      <MapBoxView
        style={{ flex: 1 }}
        centerCoordinate={centerCoord}
        zoomLevel={zoom}
        styleURL={Mapbox.StyleURL.Street}
      >
        <Mapbox.PointAnnotation id="userLocationPin" coordinate={centerCoord}>
          <View className="h-10 w-10 items-center justify-center rounded-full bg-violet-600/90 shadow-lg shadow-violet-900/50 border-2 border-white">
            <Ionicons name="location" size={20} color="#FFFFFF" />
          </View>
        </Mapbox.PointAnnotation>
      </MapBoxView>

      {/* Top Floating Glass Header Overlay */}
      <View
        style={{ paddingTop: insets.top + 8 }}
        className="absolute top-0 left-0 right-0 px-4 pointer-events-box-none"
      >
        <View className="flex-row items-center justify-between rounded-2xl bg-slate-900/85 p-3.5 border border-white/10 backdrop-blur-xl shadow-2xl">
          <View className="flex-row items-center space-x-3">
            <Image source={LOGO} className="h-10 w-10 rounded-xl" resizeMode="contain" />
            <View>
              <Text className="text-lg font-bold text-white tracking-wide">Pinley</Text>
              <Text className="text-xs font-medium text-slate-400" numberOfLines={1}>
                {user?.emailAddresses?.[0]?.emailAddress || "Welcome back"}
              </Text>
            </View>
          </View>

          {/* Sync Status Badge */}
          <View className="flex-row items-center bg-slate-800/90 px-3 py-1.5 rounded-full border border-white/5 space-x-2">
            <View className={`h-2 w-2 rounded-full ${syncColor}`} />
            <Text className="text-xs font-semibold text-slate-300">{syncText}</Text>
          </View>
        </View>
      </View>

      {/* Floating Action Controls on Right side */}
      <View
        style={{ top: insets.top + 90 }}
        className="absolute right-4 space-y-3 pointer-events-box-none"
      >
        <TouchableOpacity
          onPress={() => setZoom((z) => Math.min(z + 1, 18))}
          activeOpacity={0.8}
          className="h-11 w-11 items-center justify-center rounded-xl bg-slate-900/90 border border-white/10 shadow-lg"
        >
          <Ionicons name="add-outline" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setZoom((z) => Math.max(z - 1, 3))}
          activeOpacity={0.8}
          className="h-11 w-11 items-center justify-center rounded-xl bg-slate-900/90 border border-white/10 shadow-lg"
        >
          <Ionicons name="remove-outline" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setCenterCoord(DEFAULT_CENTER)}
          activeOpacity={0.8}
          className="h-11 w-11 items-center justify-center rounded-xl bg-violet-600 border border-white/20 shadow-lg"
        >
          <Ionicons name="navigate-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

