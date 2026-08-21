import { ActivityIndicator, Pressable, Switch, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

// Matches the tab bar purple (rgba(91,63,214, ...)) from Circles/circles tab layout
export const PURPLE = "#5B3FD6";
export const PURPLE_LIGHT = "#EDE9FE";
export const RED = "#dc2626";
export const GREEN = "#16a34a";
export const BLUE = "#2563eb";
export const AMBER = "#d97706";
export const SLATE_400 = "#94a3b8";

export function NavHeader({ title, onBack, right = null }) {
  return (
    <SafeAreaView edges={["top"]} className="bg-white">
      <View className="flex-row items-center justify-between px-4 py-3">
        <View className="flex-row items-center">
          <Pressable onPress={onBack} className="-ml-2 p-2" hitSlop={8}>
            <Ionicons name="chevron-back" size={24} color="#0f172a" />
          </Pressable>
          <Text className="ml-1 text-[18px] font-bold text-slate-900">{title}</Text>
        </View>
        {right}
      </View>
    </SafeAreaView>
  );
}

export function SectionLabel({ children }) {
  return (
    <Text className="mb-1 mt-6 text-[11px] font-bold uppercase tracking-widest text-slate-400">
      {children}
    </Text>
  );
}

export function Divider() {
  return <View className="h-px bg-slate-200" />;
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
  return (
    <View className="flex-row items-center justify-between py-4">
      <View className="flex-1 flex-row items-start gap-3 pr-4">
        {icon ? (
          <View className="mt-0.5 h-7 w-7 items-center justify-center rounded-full bg-slate-100">
            <Ionicons name={icon} size={14} color={iconColor} />
          </View>
        ) : null}
        <View className="flex-1">
          <Text className="text-[15px] font-semibold text-slate-900">{label}</Text>
          {description ? (
            <Text className="mt-0.5 text-[13px] leading-5 text-slate-500">{description}</Text>
          ) : null}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ true: PURPLE }}
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
  return (
    <>
      <Pressable className="flex-row items-center justify-between py-4" onPress={onPress}>
        <View className="flex-1 flex-row items-center gap-4 pr-3">
          {icon ? (
            <View className={`h-8 w-8 items-center justify-center rounded-full ${iconBg}`}>
              <Ionicons name={icon} size={16} color="#fff" />
            </View>
          ) : null}
          <View className="flex-1">
            <Text className={`text-[15px] font-semibold ${danger ? "text-red-500" : "text-slate-900"}`}>
              {label}
            </Text>
            {sublabel ? (
              <Text className="mt-0.5 text-[13px] text-slate-500">{sublabel}</Text>
            ) : null}
          </View>
        </View>
        {right !== null ? right : <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />}
      </Pressable>
      {!last && <Divider />}
    </>
  );
}

export function SelectRow({ label, sublabel = null, selected, onPress, last = false }) {
  return (
    <>
      <Pressable className="flex-row items-center justify-between py-4" onPress={onPress}>
        <View className="flex-1 pr-4">
          <Text className="text-[15px] font-semibold text-slate-900">{label}</Text>
          {sublabel ? <Text className="mt-0.5 text-[13px] text-slate-500">{sublabel}</Text> : null}
        </View>
        {selected ? (
          <Ionicons name="checkmark-circle" size={22} color={PURPLE} />
        ) : (
          <View className="h-[22px] w-[22px] rounded-full border-2 border-slate-200" />
        )}
      </Pressable>
      {!last && <Divider />}
    </>
  );
}

export function RadioCard({ title, description, selected, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      className={`mb-3 rounded-2xl border px-4 py-3.5 ${
        selected ? "border-[#5B3FD6] bg-[#EDE9FE]" : "border-slate-200 bg-white"
      }`}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-3">
          <Text className={`text-[15px] font-bold ${selected ? "text-[#5B3FD6]" : "text-slate-900"}`}>
            {title}
          </Text>
          {description ? (
            <Text className="mt-0.5 text-[13px] leading-5 text-slate-500">{description}</Text>
          ) : null}
        </View>
        {selected ? (
          <Ionicons name="checkmark-circle" size={22} color={PURPLE} />
        ) : (
          <View className="h-[22px] w-[22px] rounded-full border-2 border-slate-300" />
        )}
      </View>
    </Pressable>
  );
}

export function SaveBar({ visible, saving, onSave, onDiscard, disabled = false }) {
  const insets = useSafeAreaInsets();
  if (!visible) return null;
  const blocked = saving || disabled;
  return (
    <View
      style={{ bottom: insets.bottom + 96 }}
      className="absolute left-0 right-0 flex-row items-center justify-between border-t border-slate-200 bg-white px-6 py-4"
    >
      <Pressable onPress={onDiscard} disabled={blocked} className="px-4 py-2.5">
        <Text className="text-[14px] font-bold text-slate-500">Discard</Text>
      </Pressable>
      <Pressable
        onPress={onSave}
        disabled={blocked}
        className="flex-row items-center gap-2 rounded-full bg-slate-900 px-6 py-3"
      >
        {saving ? <ActivityIndicator size="small" color="#fff" /> : null}
        <Text className="text-[14px] font-bold text-white">{saving ? "Saving…" : "Save Changes"}</Text>
      </Pressable>
    </View>
  );
}

export function LoadingScreen({ title, onBack }) {
  return (
    <View className="flex-1 bg-white">
      <NavHeader title={title} onBack={onBack} />
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color={PURPLE} />
      </View>
    </View>
  );
}