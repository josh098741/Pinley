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
import { apiRequest } from "../utils/api";

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

  const value = useMemo(
    () => ({ events, loading, error, refresh, createEvent }),
    [events, loading, error, refresh, createEvent]
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
