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

const RequestsContext = createContext(null);

export function RequestsProvider({ children }) {
  const { getToken, isSignedIn } = useAuth();
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connections, setConnections] = useState([]);
  const [connectionsLoading, setConnectionsLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

  const refresh = useCallback(async () => {
    const token = await getTokenRef.current();
    if (!token) return;
    try {
      const data = await apiRequest("/api/requests", { token });
      setIncoming(data.incoming || []);
      setOutgoing(data.outgoing || []);
      setRecent(data.recent || []);
    } catch (err) {
      console.error("Failed to load requests:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshConnections = useCallback(async () => {
    const token = await getTokenRef.current();
    if (!token) return;
    try {
      const data = await apiRequest("/api/connections", { token });
      setConnections(data.connections || []);
    } catch (err) {
      console.error("Failed to load connections:", err);
    } finally {
      setConnectionsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isSignedIn) return;
    let cancelled = false;
    setLoading(true);
    setConnectionsLoading(true);
    (async () => {
      if (cancelled) return;
      await Promise.all([refresh(), refreshConnections()]);
    })();
    return () => {
      cancelled = true;
    };
  }, [isSignedIn, refresh, refreshConnections]);

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
          socketRef.current = candidate;
          break;
        }
        candidate.close();
      }

      if (!socket || cancelled) return;

      const handleEvent = () => {
        refresh();
        refreshConnections();
      };
      socket.on("request:new", handleEvent);
      socket.on("request:accepted", handleEvent);
      socket.on("request:declined", handleEvent);
      socket.on("request:cancelled", handleEvent);
      socket.on("connect", () => setConnected(true));
      socket.on("disconnect", () => setConnected(false));
    };

    connect();

    return () => {
      cancelled = true;
      if (socket) socket.disconnect();
      socketRef.current = null;
    };
  }, [isSignedIn, refresh, refreshConnections]);

  const sendRequest = useCallback(
    async ({ recipientId, pinCode }) => {
      const token = await getTokenRef.current();
      if (!token) return null;
      const data = await apiRequest("/api/requests", {
        token,
        method: "POST",
        body: { recipientId, pinCode },
      });
      await refresh();
      return data.request || null;
    },
    [refresh]
  );

  const respond = useCallback(
    async (requestId, action) => {
      const token = await getTokenRef.current();
      if (!token) return;
      await apiRequest(`/api/requests/${requestId}`, {
        token,
        method: "PATCH",
        body: { action },
      });
      await refresh();
      if (action === "accept") await refreshConnections();
    },
    [refresh, refreshConnections]
  );

  const cancelRequest = useCallback(
    async (requestId) => {
      const token = await getTokenRef.current();
      if (!token) return;
      await apiRequest(`/api/requests/${requestId}`, {
        token,
        method: "DELETE",
      });
      await refresh();
    },
    [refresh]
  );

  const value = useMemo(
    () => ({
      incoming,
      outgoing,
      recent,
      loading,
      connections,
      connectionsLoading,
      connected,
      refresh,
      refreshConnections,
      sendRequest,
      respond,
      cancelRequest,
    }),
    [
      incoming,
      outgoing,
      recent,
      loading,
      connections,
      connectionsLoading,
      connected,
      refresh,
      refreshConnections,
      sendRequest,
      respond,
      cancelRequest,
    ]
  );

  return <RequestsContext.Provider value={value}>{children}</RequestsContext.Provider>;
}

export function useRequests() {
  const ctx = useContext(RequestsContext);
  if (!ctx) {
    throw new Error("useRequests must be used within a RequestsProvider");
  }
  return ctx;
}
