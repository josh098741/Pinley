import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const PURPLE = "#7C3AED";
const PURPLE_DEEP = "#5B21B6";
const PURPLE_BRIGHT = "#8B5CF6";

function PanelButton({ icon, label, onPress, active }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}
    >
      <View style={[styles.actionIconWrap, active && styles.actionIconWrapActive]}>
        <Ionicons
          name={icon}
          size={20}
          color={active ? "#FFFFFF" : "#FFFFFF"}
        />
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

  const handleToggle = () => {
    setOpen((prev) => !prev);
  };

  return (
    <View style={styles.anchor} pointerEvents="box-none">
      <View style={styles.panel}>
        <View style={styles.grip} />
        <Pressable
          onPress={handleToggle}
          style={({ pressed }) => [styles.handle, pressed && styles.handlePressed]}
          accessibilityRole="button"
          accessibilityLabel={open ? "Close panel" : "Open panel"}
        >
          <Ionicons
            name={open ? "chevron-forward" : "menu"}
            size={22}
            color="#FFFFFF"
          />
        </Pressable>

        {open ? (
          <View style={styles.actions}>
            <PanelButton
              icon="home"
              label="Home"
              onPress={() => console.log("Home")}
            />
            <PanelButton
              icon="bookmark"
              label="Saved"
              onPress={() => console.log("Saved")}
            />
            <PanelButton
              icon="settings"
              label="Settings"
              onPress={() => console.log("Settings")}
            />
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
  grip: {
    width: 8,
    height: 72,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    backgroundColor: PURPLE_DEEP,
  },
  handle: {
    width: 46,
    height: 72,
    alignItems: "center",
    justifyContent: "center",
    borderTopLeftRadius: 22,
    borderBottomLeftRadius: 22,
    backgroundColor: PURPLE,
    borderWidth: 2,
    borderRightWidth: 0,
    borderColor: "#FFFFFF",
    shadowColor: PURPLE_DEEP,
    shadowOpacity: 0.55,
    shadowRadius: 14,
    shadowOffset: { width: -3, height: 6 },
    elevation: 10,
  },
  handlePressed: {
    transform: [{ scale: 0.94 }],
    backgroundColor: PURPLE_DEEP,
  },
  actions: {
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
    backgroundColor: PURPLE_DEEP,
    borderWidth: 2,
    borderRightWidth: 0,
    borderColor: "#FFFFFF",
    shadowColor: PURPLE_DEEP,
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
    backgroundColor: PURPLE_BRIGHT,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.6)",
  },
  actionIconWrapActive: {
    backgroundColor: "#FFFFFF",
    borderColor: "#FFFFFF",
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
