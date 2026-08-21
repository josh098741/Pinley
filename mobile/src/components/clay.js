import { Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useClay } from "../theme/ThemeProvider";

export { useClay };

export function Avatar({ name, uri, size = 52, style }) {
  const clay = useClay();
  const initials = (name || "?")
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: clay.primarySoft,
          borderColor: clay.primaryBorder,
        },
        style,
      ]}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
        />
      ) : (
        <Text style={[styles.avatarInitials, { fontSize: size * 0.36, color: clay.primaryDeep }]}>
          {initials || "?"}
        </Text>
      )}
    </View>
  );
}

export function ClayCard({ children, style, onPress }) {
  const clay = useClay();
  const Comp = onPress ? Pressable : View;
  return (
    <Comp
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: clay.card,
          borderColor: clay.primaryBorder,
          shadowColor: clay.primaryDeep,
        },
        pressed && styles.cardPressed,
        style,
      ]}
    >
      {children}
    </Comp>
  );
}

export function ClayButton({
  label,
  onPress,
  variant = "primary",
  disabled,
  loading,
  icon,
  style,
  compact,
}) {
  const clay = useClay();
  const content = (
    <View style={styles.buttonContent}>
      {icon ? (
        <Ionicons
          name={icon}
          size={compact ? 15 : 17}
          color={variant === "primary" ? "#FFFFFF" : clay.primaryDeep}
        />
      ) : null}
      <Text
        style={[
          styles.buttonText,
          compact && styles.buttonTextCompact,
          variant === "primary" && styles.buttonTextPrimary,
          variant === "danger" && styles.buttonTextDanger,
        ]}
      >
        {loading ? "Please wait…" : label}
      </Text>
      </View>
  );

  const innerBase = [
    styles.button,
    compact && styles.buttonCompact,
    variant === "soft" && styles.buttonSoft,
    variant === "ghost" && styles.buttonGhost,
    variant === "danger" && styles.buttonDanger,
    variant === "primary" && styles.buttonShadowPrimary,
    disabled && styles.buttonDisabled,
  ];

  return (
    <Pressable onPress={onPress} disabled={disabled || loading} style={style}>
      {({ pressed }) => {
        const squish = pressed && styles.buttonPressed;
        if (variant === "primary") {
          return (
            <LinearGradient
              colors={[clay.primary, clay.primaryDeep]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[...innerBase, squish]}
            >
              {content}
            </LinearGradient>
          );
        }
        return <View style={[...innerBase, squish]}>{content}</View>;
      }}
    </Pressable>
  );
}

export function ClayInput({ style, ...props }) {
  const clay = useClay();
  return (
    <TextInput
      placeholderTextColor={clay.faint}
      style={[
        styles.input,
        {
          backgroundColor: clay.isDark ? clay.soft : "#F4F1FE",
          borderColor: clay.primaryBorder,
          color: clay.ink,
          shadowColor: clay.primaryDeep,
        },
        style,
      ]}
      {...props}
    />
  );
}

export function ClayChip({ label, tone = "muted" }) {
  const clay = useClay();
  const tones = {
    muted: { bg: clay.primarySoft, color: clay.muted },
    pending: { bg: "#FFF7ED", color: "#B45309" },
    success: { bg: clay.successSoft, color: clay.success },
    danger: { bg: clay.dangerSoft, color: clay.danger },
  };
  const t = tones[tone] || tones.muted;
  return (
    <View style={[styles.chip, { backgroundColor: t.bg }]}>
      <Text style={[styles.chipText, { color: t.color }]}>{label}</Text>
    </View>
  );
}

export function SectionTitle({ title, count }) {
  const clay = useClay();
  return (
    <View style={styles.sectionTitleRow}>
      <Text style={[styles.sectionTitle, { color: clay.ink }]}>{title}</Text>
      {count ? (
        <View style={[styles.sectionCount, { backgroundColor: clay.primary }]}>
          <Text style={styles.sectionCountText}>{count}</Text>
        </View>
      ) : null}
    </View>
  );
}

export function EmptyState({ icon, title, subtitle }) {
  const clay = useClay();
  return (
    <ClayCard style={styles.emptyCard}>
      <View style={[styles.emptyIconWrap, { backgroundColor: clay.primarySoft, borderColor: clay.primaryBorder }]}>
        <Ionicons name={icon} size={26} color={clay.primary} />
      </View>
      <Text style={[styles.emptyTitle, { color: clay.ink }]}>{title}</Text>
      {subtitle ? <Text style={[styles.emptySubtitle, { color: clay.muted }]}>{subtitle}</Text> : null}
    </ClayCard>
  );
}

export function displayName(user) {
  if (!user) return "Unknown";
  return (
    [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
    user.email ||
    "Unknown"
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  cardPressed: {
    transform: [{ scale: 0.99 }],
    shadowOpacity: 0.06,
  },
  avatar: {
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    fontWeight: "800",
  },
  button: {
    alignSelf: "stretch",
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EDE9FE",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  buttonCompact: {
    paddingVertical: 9,
    paddingHorizontal: 16,
  },
  buttonShadowPrimary: {
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  buttonSoft: {
    backgroundColor: "#EDE9FE",
  },
  buttonGhost: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    shadowOpacity: 0.05,
  },
  buttonDanger: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "rgba(225,29,72,0.22)",
    shadowOpacity: 0.05,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonPressed: {
    transform: [{ scale: 0.97 }],
    shadowOpacity: 0.05,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "700",
  },
  buttonTextCompact: {
    fontSize: 13.5,
  },
  buttonTextPrimary: {
    color: "#FFFFFF",
  },
  buttonTextDanger: {
    color: "#E11D48",
  },
  input: {
    borderRadius: 22,
    borderWidth: 1.5,
    paddingHorizontal: 18,
    paddingVertical: 15,
    fontSize: 16,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "700",
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  sectionCount: {
    borderRadius: 999,
    minWidth: 22,
    height: 22,
    paddingHorizontal: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionCountText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  emptyCard: {
    alignItems: "center",
    paddingVertical: 30,
  },
  emptyIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
    paddingHorizontal: 12,
  },
});
