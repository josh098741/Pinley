import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StatusBar, StyleSheet, View } from "react-native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@clerk/clerk-expo";
import { syncUserToDatabase } from "../../(auth)/index.js";
import { useMap } from "../../../context/MapContext";
import { SidePanel } from "../../../components/SidePanel";
import { getCachedLocation, cacheLocation } from "../../../services/locationCache";
import { updateUserLocation } from "../../../services/locationApi";

const PINLEY_REGION = {
  latitude: 37.78825,
  longitude: -122.4324,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

const FOLLOW_ZOOM = {
  latitudeDelta: 0.005,
  longitudeDelta: 0.005,
};

const LOCATION_PUSH_INTERVAL_MS = 15_000;

export default function Home() {
  const { getToken, isSignedIn, sessionId } = useAuth();
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;
  const mapRef = useRef(null);
  const { registerRecenter, recenter } = useMap();
  const [following, setFollowing] = useState(true);
  const followingRef = useRef(following);
  followingRef.current = following;
  const [initialRegion, setInitialRegion] = useState(null);

  const flyTo = useCallback((coords, duration = 1000) => {
    mapRef.current?.animateToRegion(
      {
        latitude: coords.latitude,
        longitude: coords.longitude,
        ...FOLLOW_ZOOM,
      },
      duration
    );
  }, []);

  const animateToUser = useCallback(async () => {
    const current = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.BestForNavigation,
    });
    flyTo(current.coords, 1000);
  }, [flyTo]);

  useEffect(() => {
    const recenter = () => {
      setFollowing(true);
      animateToUser().catch((err) =>
        console.warn("Recenter failed:", err)
      );
    };
    const unregister = registerRecenter(recenter);
    return unregister;
  }, [registerRecenter, animateToUser]);

  useEffect(() => {
    if (!isSignedIn || !sessionId) return;
    let cancelled = false;

    const performSync = async () => {
      try {
        const token = await getTokenRef.current();
        if (!token || cancelled) return;
        await syncUserToDatabase(token);
      } catch (err) {
        if (!cancelled) {
          console.error("Account sync error:", err);
        }
      }
    };

    performSync();

    return () => {
      cancelled = true;
    };
  }, [isSignedIn, sessionId]);

  useEffect(() => {
    let active = true;
    let settled = false;
    (async () => {
      const cached = await getCachedLocation();
      if (!active) return;
      settled = true;
      setInitialRegion(
        cached
          ? { latitude: cached.latitude, longitude: cached.longitude, ...PINLEY_REGION }
          : PINLEY_REGION
      );
    })();
    const fallback = setTimeout(() => {
      if (active && !settled) setInitialRegion(PINLEY_REGION);
    }, 1500);
    return () => {
      active = false;
      clearTimeout(fallback);
    };
  }, []);

  useEffect(() => {
    let subscription;
    let cancelled = false;
    let lastPush = 0;

    const pushLocation = async (coords) => {
      await cacheLocation(coords);
      const now = Date.now();
      if (now - lastPush < LOCATION_PUSH_INTERVAL_MS) return;
      lastPush = now;
      try {
        const token = await getTokenRef.current();
        if (token) {
          await updateUserLocation(token, {
            latitude: coords.latitude,
            longitude: coords.longitude,
            accuracy: coords.accuracy,
          });
        }
      } catch (err) {
        console.warn("Location push failed:", err);
      }
    };

    const startTracking = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.warn("Location permission not granted");
        return;
      }

      // Grab a quick, lower-accuracy fix first so we snap to the user without
      // waiting on a cold BestForNavigation GPS lock.
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
        .then((pos) => {
          if (cancelled) return;
          const coords = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          };
          lastPush = 0;
          pushLocation(coords);
          flyTo(coords, 800);
        })
        .catch((err) => console.warn("Quick location fix failed:", err));

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          distanceInterval: 1,
          timeInterval: 5000,
        },
        ({ coords }) => {
          const c = {
            latitude: coords.latitude,
            longitude: coords.longitude,
            accuracy: coords.accuracy,
          };
          pushLocation(c);
          if (!followingRef.current) return;
          flyTo(c, 1000);
        }
      );
    };

    startTracking();

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, [flyTo]);

  const handleRegionChange = useCallback(() => {
    if (followingRef.current) {
      setFollowing(false);
    }
  }, []);

  if (!initialRegion) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#7C3AED" size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <StatusBar translucent barStyle="dark-content" backgroundColor="transparent" />
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton={false}
        onRegionChange={handleRegionChange}
      />
      {!following ? (
        <Pressable
          onPress={recenter}
          style={styles.recenterButton}
          accessibilityRole="button"
          accessibilityLabel="Recenter on my location"
        >
          <Ionicons name="locate" size={22} color="#FFFFFF" />
        </Pressable>
      ) : null}
      <SidePanel />
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F2F2F7",
  },
  recenterButton: {
    position: "absolute",
    right: 16,
    bottom: 28,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#7C3AED",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    shadowColor: "#5B21B6",
    shadowOpacity: 0.45,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
});
