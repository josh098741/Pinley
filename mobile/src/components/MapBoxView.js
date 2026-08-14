import React from "react";
import { StyleSheet, View, Text } from "react-native";
import Mapbox, { MAPBOX_ACCESS_TOKEN } from "../config/mapbox.js";

export default function MapBoxView({
  centerCoordinate = [0, 0],
  zoomLevel = 12,
  style,
  styleURL = Mapbox.StyleURL.Street,
  children,
}) {
  if (!MAPBOX_ACCESS_TOKEN) {
    return (
      <View style={[styles.fallbackContainer, style]}>
        <Text style={styles.fallbackText}>
          Mapbox token missing. Please configure EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <Mapbox.MapView style={styles.map} styleURL={styleURL}>
        <Mapbox.Camera
          zoomLevel={zoomLevel}
          centerCoordinate={centerCoordinate}
          animationMode="flyTo"
          animationDuration={1000}
        />
        {children}
      </Mapbox.MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
  },
  map: {
    flex: 1,
  },
  fallbackContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
    padding: 16,
  },
  fallbackText: {
    color: "#64748B",
    textAlign: "center",
    fontSize: 14,
  },
});
