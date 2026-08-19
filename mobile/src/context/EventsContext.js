import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAuth } from "@clerk/clerk-expo";
import { io } from "socket.io-client";
import { apiRequest } from "../utils/api";
import { SOCKET_URL_CANDIDATES } from "../config";

const EventsContext = createContext(null);

export function EventsProvider({ children }) {
  const { getToken, isSignedIn } = useAuth();
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    const token = await getTokenRef.current();
    if (!token) return;
    setLoading(true);
    try {
      const data = await apiRequest("/api/events", { token });
      setEvents(data.events || []);
      setError(null);
    } catch (err) {
      console.error("Failed to load events:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isSignedIn) return;
    refresh();
  }, [isSignedIn, refresh]);

  // Live updates: accepting an event invite (event:joined) or a host's invite
  // being accepted (event:inviteAccepted) should refresh the event list.
  useEffect(() => {
    if (!isSignedIn) return;
    let socket = null;
    let cancelled = false;

    const connect = async () => {
      const token = await getTokenRef.current();
      if (!token || cancelled) return;

      for (const url of SOCKET_URL_CANDIDATES) {
        if (cancelled) return;
        const candidate = io(url, {
          auth: { token },
          transports: ["websocket"],
          forceNew: true,
          reconnectionAttempts: 2,
          timeout: 6000,
        });

        const ok = await new Promise((resolve) => {
          const timer = setTimeout(() => resolve(false), 5000);
          candidate.once("connect", () => {
            clearTimeout(timer);
            resolve(true);
          });
          candidate.once("connect_error", () => {
            clearTimeout(timer);
            resolve(false);
          });
        });

        if (ok) {
          socket = candidate;
          break;
        }
        candidate.close();
      }

      if (!socket || cancelled) return;

      const handleEvent = () => refresh();
      socket.on("event:joined", handleEvent);
      socket.on("event:inviteAccepted", handleEvent);
      socket.on("event:deleted", handleEvent);
    };

    connect();

    return () => {
      cancelled = true;
      if (socket) socket.disconnect();
    };
  }, [isSignedIn, refresh]);

  const deleteEvent = useCallback(
    async (eventId) => {
      const token = await getTokenRef.current();
      if (!token) return null;
      const data = await apiRequest(`/api/events/${eventId}`, {
        token,
        method: "DELETE",
      });
      refresh().catch(() => {});
      return data;
    },
    [refresh]
  );

  const createEvent = useCallback(
    async (payload) => {
      const token = await getTokenRef.current();
      if (!token) return null;
      const data = await apiRequest("/api/events", {
        token,
        method: "POST",
        body: payload,
      });
      refresh().catch(() => {});
      return data.event || null;
    },
    [refresh]
  );

  const inviteToEvent = useCallback(
    async (eventId, inviteeIds) => {
      const token = await getTokenRef.current();
      if (!token) return null;
      const data = await apiRequest(`/api/events/${eventId}/invite`, {
        token,
        method: "POST",
        body: { inviteeIds },
      });
      refresh().catch(() => {});
      return data;
    },
    [refresh]
  );

  const getEvent = useCallback(async (eventId) => {
    const token = await getTokenRef.current();
    if (!token) return null;
    const data = await apiRequest(`/api/events/${eventId}`, { token });
    return data.event || null;
  }, []);

  const value = useMemo(
    () => ({ events, loading, error, refresh, getEvent, createEvent, inviteToEvent, deleteEvent }),
    [events, loading, error, refresh, getEvent, createEvent, inviteToEvent, deleteEvent]
  );

  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>;
}

export function useEvents() {
  const ctx = useContext(EventsContext);
  if (!ctx) {
    throw new Error("useEvents must be used within an EventsProvider");
  }
  return ctx;
}
