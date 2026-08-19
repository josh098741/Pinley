import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  Share,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import {
  Avatar,
  ClayCard,
  ClayChip,
  ClayButton,
  clay,
  displayName,
} from "../../../components/clay";

import { useEvents } from "../../../context/EventsContext";

const CARD_BORDER = {
  borderWidth: 2,
  borderColor: clay.primaryBorder,
};

const TONE_BY_STATUS = {
  going: "success",
  attending: "success",
  pending: "pending",
  maybe: "pending",
  invited: "muted",
  cancelled: "danger",
  none: "muted",
};

const STATUS_LABEL = {
  going: "Going",
  attending: "Going",
  pending: "Pending",
  maybe: "Maybe",
  invited: "Invited",
  cancelled: "Cancelled",
  none: "Not going",
};

/* ─── small helpers ──────────────────────────────────────────── */

function PressableRow({ onPress, children }) {
  return (
    <Pressable onPress={onPress} hitSlop={8}>
      {children}
    </Pressable>
  );
}

/* ─── Header ─────────────────────────────────────────────────── */

function Header({ onBack, onShare, onMore }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 6,
      }}
    >
      <PressableRow onPress={onBack}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "#fff",
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: clay.primaryBorder,
          }}
        >
          <Ionicons name="chevron-back" size={20} color={clay.ink} />
        </View>
      </PressableRow>

      <Text style={{ fontSize: 20, fontWeight: "700", color: "#0F0C29" }}>
        Event
      </Text>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <PressableRow onPress={onShare}>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: "#fff",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: clay.primaryBorder,
            }}
          >
            <Ionicons name="share-social-outline" size={18} color={clay.ink} />
          </View>
        </PressableRow>
        <PressableRow onPress={onMore}>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: "#fff",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: clay.primaryBorder,
            }}
          >
            <Ionicons name="ellipsis-horizontal" size={18} color={clay.ink} />
          </View>
        </PressableRow>
      </View>
    </View>
  );
}

/* ─── Hero card ──────────────────────────────────────────────── */

function HeroCard({ event, statusLabel, tone }) {
  const host = event?.host;

  return (
    <ClayCard style={[CARD_BORDER, { overflow: "hidden", padding: 0, minHeight: 210, position: "relative", borderRadius: 28 }]}>
      {/* Background layers (clipped to rounded corners) */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: 28,
          overflow: "hidden",
        }}
      >
        {/* Background Image / Gradient */}
        {event?.coverImageUrl ? (
          <Image
            source={{ uri: event.coverImageUrl }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
        ) : (
          <LinearGradient
            colors={[clay.primarySoft, "#DDD6FE"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
          />
        )}

        {/* White readability overlay */}
        <LinearGradient
          colors={[
            "rgba(255,255,255,1)",
            "rgba(255,255,255,0.98)",
            "rgba(255,255,255,0.92)",
            "rgba(255,255,255,0.70)",
            "rgba(255,255,255,0.35)",
            "rgba(255,255,255,0.08)",
            "transparent",
          ]}
          locations={[0, 0.2, 0.38, 0.52, 0.66, 0.78, 1]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        />

        {/* Soft white hue / glow */}
        <LinearGradient
          colors={[
            "rgba(255,255,255,0)",
            "rgba(255,255,255,0.35)",
            "rgba(255,255,255,0.65)",
            "rgba(255,255,255,0.25)",
            "transparent",
          ]}
          locations={[0, 0.25, 0.5, 0.75, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: "28%",
            width: "45%",
          }}
        />
      </View>

      {/* Content */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 20,
          flex: 1,
          justifyContent: "space-between",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          {/* Status Chip */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: clay.primarySoft,
              borderRadius: 999,
              paddingHorizontal: 12,
              paddingVertical: 6,
              gap: 6,
            }}
          >
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: clay.primaryDeep }} />
            <Text style={{ fontSize: 13, fontWeight: "700", color: clay.primaryDeep }}>
              {statusLabel}
            </Text>
          </View>

          {/* Host Badge */}
          {event?.isHost ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                borderRadius: 999,
                backgroundColor: "#fff",
                paddingHorizontal: 12,
                paddingVertical: 6,
                gap: 5,
                shadowColor: clay.primaryDeep,
                shadowOpacity: 0.1,
                shadowRadius: 4,
                shadowOffset: { width: 0, height: 2 },
                elevation: 2,
              }}
            >
              <Ionicons name="star" size={14} color={clay.warning} />
              <Text style={{ fontSize: 13, fontWeight: "800", color: clay.warning }}>Host</Text>
            </View>
          ) : null}
        </View>

        <View style={{ marginTop: 28 }}>
          <Text
            style={{
              fontSize: 28,
              fontWeight: "900",
              color: "#0F0C29",
              letterSpacing: -0.5,
              lineHeight: 34,
              maxWidth: "90%",
              textShadowColor: "rgba(255,255,255,0.9)",
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 8,
            }}
          >
            {event?.title}
          </Text>

          <View style={{ marginTop: 16 }}>
            <Text
              style={{
                fontSize: 12,
                fontWeight: "700",
                color: clay.primary,
                textTransform: "uppercase",
                letterSpacing: 0.6,
                marginBottom: 6,
              }}
            >
              Hosted by
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <Avatar name={displayName(host)} uri={host?.imageUrl} size={36} />
              <Text style={{ fontSize: 14.5, fontWeight: "800", color: "#0F0C29" }}>
                {displayName(host)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ClayCard>
  );
}

/* ─── Separator ──────────────────────────────────────────────── */

function Separator() {
  return <View style={{ height: 1, backgroundColor: clay.line, marginVertical: 2 }} />;
}

/* ─── Info row ───────────────────────────────────────────────── */

function InfoRow({ icon, label, value }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: 9, gap: 10 }}>
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 12,
          backgroundColor: clay.primarySoft,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name={icon} size={17} color={clay.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 11,
            fontWeight: "600",
            color: clay.primary,
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          {label}
        </Text>
        <Text style={{ marginTop: 2, fontSize: 14, fontWeight: "700", color: "#0F0C29" }}>
          {value}
        </Text>
      </View>
    </View>
  );
}

/* ─── Info + Map Section ────────────────────────────────────────── */

function InfoMapSection({ dateParts, event }) {
  return (
    <View style={{ flexDirection: "row", marginBottom: 14 }}>
      <View style={{ flex: 1, paddingRight: 10 }}>
        {dateParts ? (
          <>
            <InfoRow icon="calendar-outline" label="Date" value={`${dateParts.weekday}, ${dateParts.date}`} />
            <InfoRow icon="time-outline" label="Time" value={dateParts.time} />
          </>
        ) : null}
        {event?.location ? (
          <InfoRow icon="location-outline" label="Location" value={event.location} />
        ) : null}
      </View>

      <View
        style={{
          width: 112,
          justifyContent: "space-between"
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "#F9F8FD",
            borderRadius: 16,
            alignItems: "center",
            justifyContent: "center",
            minHeight: 90,
            overflow: "hidden",
            marginBottom: 8,
          }}
        >
          {[0.25, 0.5, 0.75].map((f) => (
            <View
              key={`h${f}`}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: `${f * 100}%`,
                height: 1,
                backgroundColor: "rgba(124,58,237,0.08)",
              }}
            />
          ))}
          {[0.33, 0.66].map((f) => (
            <View
              key={`v${f}`}
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: `${f * 100}%`,
                width: 1,
                backgroundColor: "rgba(124,58,237,0.08)",
              }}
            />
          ))}
          <Ionicons name="location" size={28} color={clay.primary} />
        </View>

        <TouchableOpacity
          onPress={() => Alert.alert("Open map", "Map view is coming soon.")}
          style={{
            padding: 10,
            backgroundColor: "#F9F8FD",
            borderRadius: 12,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
            gap: 4,
          }}
        >
          <Ionicons name="map-outline" size={13} color={clay.primary} />
          <Text style={{ fontSize: 11.5, fontWeight: "700", color: clay.primaryDeep }}>
            View on map
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ─── About Section ─────────────────────────────────────────────── */

function AboutSection({ description }) {
  return (
    <View style={{ backgroundColor: "#F9F8FD", borderRadius: 16, padding: 14, marginBottom: 14 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            backgroundColor: clay.primarySoft,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="document-text-outline" size={15} color={clay.primary} />
        </View>
        <Text
          style={{
            fontSize: 12,
            fontWeight: "700",
            color: clay.primary,
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          About
        </Text>
      </View>
      <Text style={{ fontSize: 14, fontWeight: "500", color: "#475569", lineHeight: 21 }}>
        {description}
      </Text>
    </View>
  );
}

/* ─── Going Section ─────────────────────────────────────────────── */

function GoingSection({ attendees }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#F9F8FD", borderRadius: 16, padding: 14 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            backgroundColor: clay.primarySoft,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="people-outline" size={17} color={clay.primary} />
        </View>
        <Text style={{ fontSize: 15, fontWeight: "700", color: "#0F0C29" }}>
          Going ({attendees.length})
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={clay.ink} />
    </View>
  );
}

/* ─── Person section ─────────────────────────────────────────── */

function PersonSection({ label, users }) {
  return (
    <View style={{ marginTop: 20 }}>
      <Text
        style={{
          fontSize: 12,
          fontWeight: "700",
          color: clay.primary,
          textTransform: "uppercase",
          letterSpacing: 0.8,
          marginBottom: 10,
          paddingHorizontal: 2,
        }}
      >
        {label}
      </Text>
      {users.map((user) => (
        <UserCard key={user._id || user.id} user={user} />
      ))}
    </View>
  );
}

function UserCard({ user }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 18,
        borderWidth: 1,
        borderColor: clay.primaryBorder,
        padding: 12,
        marginBottom: 8,
        shadowColor: clay.primaryDeep,
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
        elevation: 2,
      }}
    >
      <Avatar name={displayName(user)} uri={user.imageUrl} size={44} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={{ fontSize: 14.5, fontWeight: "700", color: "#0F0C29" }}>
          {displayName(user)}
        </Text>
        <Text style={{ marginTop: 2, fontSize: 12, fontWeight: "500", color: clay.muted }}>
          {user.email || user.username || ""}
        </Text>
      </View>
      <TouchableOpacity
        style={{
          width: 38,
          height: 38,
          borderRadius: 19,
          borderWidth: 2,
          borderColor: clay.primaryBorder,
          backgroundColor: clay.primarySoft,
          alignItems: "center",
          justifyContent: "center",
        }}
        onPress={() => Alert.alert("Message", "Messaging is coming soon.")}
      >
        <Ionicons name="chatbubble-outline" size={17} color={clay.primary} />
      </TouchableOpacity>
    </View>
  );
}

/* ─── Bottom bar ─────────────────────────────────────────────── */

function BottomBar({ isHost, onChangeResponse }) {
  if (isHost) return null;

  return (
    <View
      style={{
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderTopWidth: 1,
        borderTopColor: clay.line,
        backgroundColor: clay.bg,
      }}
    >
      <TouchableOpacity onPress={onChangeResponse}>
        <LinearGradient
          colors={[clay.primary, clay.primaryDeep]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 999,
            paddingVertical: 15,
            gap: 8,
          }}
        >
          <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#fff" }}>
            Change response
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

/* ─── Main screen ────────────────────────────────────────────── */

export default function EventDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { getEvent } = useEvents();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getEvent(id);
        if (!active) return;
        if (!data) setError("Event not found.");
        else setEvent(data);
      } catch (err) {
        if (!active) return;
        setError(err?.message || "Could not load this event.");
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => { active = false; };
  }, [id, getEvent]);

  const dateParts = useMemo(() => {
    if (!event?.date) return null;
    const d = new Date(event.date);
    if (isNaN(d.getTime())) return null;
    return {
      weekday: d.toLocaleDateString(undefined, { weekday: "long" }),
      date: d.toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
      time: d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }),
    };
  }, [event]);

  const tone = event ? TONE_BY_STATUS[event.status] || "muted" : "muted";
  const statusLabel = event ? STATUS_LABEL[event.status] || "View" : "View";
  const attendees = event?.attendees || [];
  const pending = event?.pendingInvites || [];

  const handleShare = async () => {
    try {
      await Share.share({ message: `Check out this event: ${event?.title || ""}` });
    } catch (_) {}
  };

  const handleChangeResponse = () => {
    Alert.alert(
      "Change response",
      "How would you like to respond?",
      [
        { text: "Going", onPress: () => {} },
        { text: "Not going", onPress: () => {} },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: clay.bg }}>
      <StatusBar barStyle="dark-content" backgroundColor={clay.bg} />

      <Header
        onBack={() => router.back()}
        onShare={handleShare}
        onMore={() => router.push(`/events/${id}/edit`)}
      />

      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={clay.primary} size="large" />
          <Text style={{ marginTop: 12, fontSize: 13, fontWeight: "500", color: clay.muted }}>
            Loading event…
          </Text>
        </View>
      ) : error ? (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 32,
          }}
        >
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 20,
              backgroundColor: clay.dangerSoft,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="alert-circle" size={26} color={clay.danger} />
          </View>
          <Text
            style={{
              marginTop: 12,
              textAlign: "center",
              fontSize: 14.5,
              fontWeight: "700",
              color: "#0F0C29",
            }}
          >
            {error}
          </Text>
          <View style={{ marginTop: 16 }}>
            <ClayButton label="Go back" variant="soft" onPress={() => router.back()} />
          </View>
        </View>
      ) : (
        <>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingTop: 4,
              paddingBottom: 32,
            }}
            showsVerticalScrollIndicator={false}
          >
            {/* Hero card */}
            <HeroCard event={event} statusLabel={statusLabel} tone={tone} />

            {/* Details Container Card */}
            <ClayCard style={[CARD_BORDER, { marginTop: 14, padding: 14 }]}>
              {/* Date / Time / Location + Map */}
              <InfoMapSection dateParts={dateParts} event={event} />

              {/* About */}
              {event?.description ? <AboutSection description={event.description} /> : null}

              {/* Going */}
              <GoingSection attendees={attendees} />
            </ClayCard>

            {/* Divider */}
            <View
              style={{
                height: 1,
                backgroundColor: clay.line,
                marginTop: 22,
                marginHorizontal: 4,
              }}
            />

            {/* Host section */}
            {event?.host ? (
              <PersonSection label="Host" users={[event.host]} />
            ) : null}

            {/* Invited / pending section */}
            {pending.length > 0 ? (
              <PersonSection
                label={`Invited (${pending.length})`}
                users={pending}
              />
            ) : null}
          </ScrollView>

          {/* Bottom action bar */}
          <BottomBar
            isHost={event?.isHost}
            onChangeResponse={handleChangeResponse}
          />
        </>
      )}
    </SafeAreaView>
  );
}
