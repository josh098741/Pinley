import { useEffect, useRef } from "react";
import { StatusBar, View } from "react-native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
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

export default function Home() {
  const { getToken, isSignedIn, sessionId } = useAuth();
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;
  const mapRef = useRef(null);
  const { registerRecenter } = useMap();

  useEffect(() => {
    const recenter = () => {
      const animate = async () => {
        const current = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.BestForNavigation,
        });
        const { latitude, longitude } = current.coords;
        mapRef.current?.animateToRegion(
          {
            latitude,
            longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          },
          1000
        );
      };
      animate().catch((err) =>
        console.warn("Recenter failed:", err)
      );
    };
    const unregister = registerRecenter(recenter);
    return unregister;
  }, [registerRecenter]);

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

      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });
      const { latitude, longitude } = current.coords;
      mapRef.current?.animateToRegion(
        {
          latitude,
          longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        },
        1000
      );

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          distanceInterval: 1,
          timeInterval: 5000,
        },
        ({ coords }) => {
          mapRef.current?.animateToRegion(
            {
              latitude: coords.latitude,
              longitude: coords.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
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
      />
      <SidePanel />
    </View>
  );
}
