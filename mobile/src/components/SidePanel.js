import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMap } from "../context/MapContext";
import { useTheme } from "../theme/ThemeProvider";

function PanelButton({ icon, label, onPress, active }) {
  const { accent } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}
    >
      <View style={[styles.actionIconWrap, { backgroundColor: accent.light }]}>
        <Ionicons name={icon} size={20} color="#FFFFFF" />
      </View>
      <View style={styles.actionLabelWrap}>
        <Text style={[styles.actionLabel, active && styles.actionLabelActive]}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

export function SidePanel() {
  const [open, setOpen] = useState(false);
  const { recenter } = useMap();
  const router = useRouter();
  const { accent } = useTheme();

  const handleToggle = () => {
    setOpen((prev) => !prev);
  };

  return (
    <View style={styles.anchor} pointerEvents="box-none">
      <View style={styles.panel}>
        <View style={[styles.strip, { backgroundColor: accent.deep }]} />
        <Pressable
          onPress={handleToggle}
          hitSlop={16}
          style={({ pressed }) => [
            styles.handle,
            {
              backgroundColor: accent.primary,
              borderLeftColor: accent.deep,
              shadowColor: accent.deep,
            },
            open && styles.handleOpen,
            pressed && styles.handlePressed,
            pressed && { backgroundColor: accent.deep },
          ]}
          accessibilityRole="button"
          accessibilityLabel={open ? "Close panel" : "Open panel"}
        >
          <Ionicons
            name={open ? "chevron-forward" : "chevron-back"}
            size={22}
            color={accent.primary}
          />
        </Pressable>

        {open ? (
          <View style={[styles.actions, { backgroundColor: accent.deep, shadowColor: accent.deep }]}>
            <PanelButton icon="locate" label="Locate" onPress={() => recenter()} />
            <PanelButton icon="people" label="Friends" onPress={() => console.log("Friends")} />
            <PanelButton icon="calendar" label="Events" onPress={() => router.push("/events")} />
            <PanelButton icon="warning" label="SOS" onPress={() => router.push("/sos/sos")} />
            <PanelButton icon="settings" label="Settings" onPress={() => console.log("Settings")} />
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  anchor: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    zIndex: 50,
  },
  panel: {
    flexDirection: "row",
    alignItems: "center",
  },
  strip: {
    width: 6,
    height: 72,
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
  },
  handle: {
    width: 46,
    height: 72,
    alignItems: "center",
    justifyContent: "center",
    borderTopLeftRadius: 22,
    borderBottomLeftRadius: 22,
    borderWidth: 2,
    borderRightWidth: 0,
    borderLeftWidth: 8,
    borderColor: "#FFFFFF",
    shadowOpacity: 0.55,
    shadowRadius: 14,
    shadowOffset: { width: -3, height: 6 },
    elevation: 10,
  },
  handleOpen: {
    height: undefined,
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
  },
  handlePressed: {
    transform: [{ scale: 0.94 }],
  },
  actions: {
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
    borderWidth: 2,
    borderRightWidth: 0,
    borderColor: "#FFFFFF",
    shadowOpacity: 0.4,
    shadowRadius: 18,
    shadowOffset: { width: -4, height: 10 },
    elevation: 12,
  },
  action: {
    alignItems: "center",
    justifyContent: "center",
    width: 56,
  },
  actionPressed: {
    opacity: 0.75,
  },
  actionIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.6)",
  },
  actionLabelWrap: {
    marginTop: 4,
  },
  actionLabel: {
    fontSize: 10.5,
    fontWeight: "800",
    color: "#EDE9FE",
    textAlign: "center",
  },
  actionLabelActive: {
    color: "#FFFFFF",
  },
});
