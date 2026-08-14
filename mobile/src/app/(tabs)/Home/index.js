import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, StatusBar, StyleSheet, View } from "react-native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@clerk/clerk-expo";
import { syncUserToDatabase } from "../../(auth)/index.js";
import { useMap } from "../../../context/MapContext";
import { SidePanel } from "../../../components/SidePanel";

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

export default function Home() {
  const { getToken, isSignedIn, sessionId } = useAuth();
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;
  const mapRef = useRef(null);
  const { registerRecenter, recenter } = useMap();
  const [following, setFollowing] = useState(true);
  const followingRef = useRef(following);
  followingRef.current = following;

  const animateToUser = useCallback(async () => {
    const current = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.BestForNavigation,
    });
    const { latitude, longitude } = current.coords;
    mapRef.current?.animateToRegion(
      {
        latitude,
        longitude,
        ...FOLLOW_ZOOM,
      },
      1000
    );
  }, []);

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
    let subscription;

    const startTracking = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.warn("Location permission not granted");
        return;
      }

      animateToUser().catch((err) =>
        console.warn("Initial location failed:", err)
      );

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          distanceInterval: 1,
          timeInterval: 5000,
        },
        ({ coords }) => {
          if (!followingRef.current) return;
          mapRef.current?.animateToRegion(
            {
              latitude: coords.latitude,
              longitude: coords.longitude,
              ...FOLLOW_ZOOM,
            },
            1000
          );
        }
      );
    };

    startTracking();

    return () => {
      subscription?.remove();
    };
  }, [animateToUser]);

  const handleRegionChange = useCallback(() => {
    if (followingRef.current) {
      setFollowing(false);
    }
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <StatusBar translucent barStyle="dark-content" backgroundColor="transparent" />
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        initialRegion={PINLEY_REGION}
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
