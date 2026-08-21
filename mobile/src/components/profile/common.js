import { ActivityIndicator, Pressable, Switch, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme/ThemeProvider";

// Legacy constants kept for backwards compatibility (status colors, etc.).
// Prefer `useTheme().accent` / `colors` inside components.
export const PURPLE = "#5B3FD6";
export const PURPLE_LIGHT = "#EDE9FE";
export const RED = "#dc2626";
export const GREEN = "#16a34a";
export const BLUE = "#2563eb";
export const AMBER = "#d97706";
export const SLATE_400 = "#94a3b8";

export function NavHeader({ title, onBack, right = null }) {
  const { colors } = useTheme();
  return (
    <SafeAreaView edges={["top"]} style={{ backgroundColor: colors.bg }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: colors.bg,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Pressable onPress={onBack} style={{ marginLeft: -8, padding: 8 }} hitSlop={8}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </Pressable>
          <Text
            style={{ marginLeft: 4, fontSize: 18, fontWeight: "700", color: colors.text }}
          >
            {title}
          </Text>
        </View>
        {right}
      </View>
    </SafeAreaView>
  );
}

export function SectionLabel({ children }) {
  const { colors } = useTheme();
  return (
    <Text
      style={{
        marginBottom: 4,
        marginTop: 24,
        fontSize: 11,
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: 2,
        color: colors.textFaint,
      }}
    >
      {children}
    </Text>
  );
}

export function Divider() {
  const { colors } = useTheme();
  return <View style={{ height: 1, backgroundColor: colors.divider }} />;
}

export function ToggleRow({
  label,
  description,
  value,
  onValueChange,
  disabled = false,
  icon = null,
  iconColor = "#475569",
}) {
  const { accent, colors } = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 16,
      }}
    >
      <View style={{ flex: 1, flexDirection: "row", alignItems: "flex-start", gap: 12, paddingRight: 16 }}>
        {icon ? (
          <View
            style={{
              marginTop: 2,
              height: 28,
              width: 28,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 999,
              backgroundColor: colors.soft,
            }}
          >
            <Ionicons name={icon} size={14} color={iconColor} />
          </View>
        ) : null}
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: "600", color: colors.text }}>{label}</Text>
          {description ? (
            <Text style={{ marginTop: 2, fontSize: 13, lineHeight: 20, color: colors.textMuted }}>
              {description}
            </Text>
          ) : null}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ true: accent.primary }}
      />
    </View>
  );
}

export function NavRow({
  icon,
  iconBg = "bg-slate-800",
  label,
  sublabel,
  onPress,
  danger = false,
  last = false,
  right = null,
}) {
  const { colors } = useTheme();
  return (
    <>
      <Pressable
        style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 16 }}
        onPress={onPress}
      >
        <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 16, paddingRight: 12 }}>
          {icon ? (
            <View className={`h-8 w-8 items-center justify-center rounded-full ${iconBg}`}>
              <Ionicons name={icon} size={16} color="#fff" />
            </View>
          ) : null}
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 15,
                fontWeight: "600",
                color: danger ? RED : colors.text,
              }}
            >
              {label}
            </Text>
            {sublabel ? (
              <Text style={{ marginTop: 2, fontSize: 13, color: colors.textMuted }}>{sublabel}</Text>
            ) : null}
          </View>
        </View>
        {right !== null ? (
          right
        ) : (
          <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
        )}
      </Pressable>
      {!last && <Divider />}
    </>
  );
}

export function SelectRow({ label, sublabel = null, selected, onPress, last = false }) {
  const { accent, colors } = useTheme();
  return (
    <>
      <Pressable
        style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 16 }}
        onPress={onPress}
      >
        <View style={{ flex: 1, paddingRight: 16 }}>
          <Text style={{ fontSize: 15, fontWeight: "600", color: colors.text }}>{label}</Text>
          {sublabel ? (
            <Text style={{ marginTop: 2, fontSize: 13, color: colors.textMuted }}>{sublabel}</Text>
          ) : null}
        </View>
        {selected ? (
          <Ionicons name="checkmark-circle" size={22} color={accent.primary} />
        ) : (
          <View style={{ height: 22, width: 22, borderRadius: 999, borderWidth: 2, borderColor: colors.border }} />
        )}
      </Pressable>
      {!last && <Divider />}
    </>
  );
}

export function RadioCard({ title, description, selected, onPress }) {
  const { accent, colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        marginBottom: 12,
        borderRadius: 16,
        borderWidth: 1,
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: selected ? accent.soft : colors.card,
        borderColor: selected ? accent.primary : colors.border,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text style={{ fontSize: 15, fontWeight: "700", color: selected ? accent.primary : colors.text }}>
            {title}
          </Text>
          {description ? (
            <Text style={{ marginTop: 2, fontSize: 13, lineHeight: 20, color: colors.textMuted }}>
              {description}
            </Text>
          ) : null}
        </View>
        {selected ? (
          <Ionicons name="checkmark-circle" size={22} color={accent.primary} />
        ) : (
          <View style={{ height: 22, width: 22, borderRadius: 999, borderWidth: 2, borderColor: colors.border }} />
        )}
      </View>
    </Pressable>
  );
}

export function SaveBar({ visible, saving, onSave, onDiscard, disabled = false }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  if (!visible) return null;
  const blocked = saving || disabled;
  return (
    <View
      style={{
        position: "absolute",
        bottom: insets.bottom + 96,
        left: 0,
        right: 0,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderTopWidth: 1,
        borderTopColor: colors.divider,
        backgroundColor: colors.bg,
        paddingHorizontal: 24,
        paddingVertical: 16,
      }}
    >
      <Pressable onPress={onDiscard} disabled={blocked} style={{ paddingHorizontal: 16, paddingVertical: 10 }}>
        <Text style={{ fontSize: 14, fontWeight: "700", color: colors.textMuted }}>Discard</Text>
      </Pressable>
      <Pressable
        onPress={onSave}
        disabled={blocked}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          borderRadius: 999,
          backgroundColor: "#0f172a",
          paddingHorizontal: 24,
          paddingVertical: 12,
        }}
      >
        {saving ? <ActivityIndicator size="small" color="#fff" /> : null}
        <Text style={{ fontSize: 14, fontWeight: "700", color: "#fff" }}>
          {saving ? "Saving…" : "Save Changes"}
        </Text>
      </Pressable>
    </View>
  );
}

export function LoadingScreen({ title, onBack }) {
  const { accent, colors } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <NavHeader title={title} onBack={onBack} />
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={accent.primary} />
      </View>
    </View>
  );
}
