import { createContext, useCallback, useContext, useRef, useState } from "react";

const MapContext = createContext(null);

export function MapProvider({ children }) {
  const recenterRef = useRef(null);
  const [hasMap, setHasMap] = useState(false);

  const registerRecenter = useCallback((handler) => {
    recenterRef.current = handler;
    setHasMap(Boolean(handler));
    return () => {
      if (recenterRef.current === handler) {
        recenterRef.current = null;
        setHasMap(false);
      }
    };
  }, []);

  const recenter = useCallback(() => {
    recenterRef.current?.();
  }, []);

  return (
    <MapContext.Provider
      value={{ registerRecenter, recenter, hasMap }}
    >
      {children}
    </MapContext.Provider>
  );
}

export function useMap() {
  const ctx = useContext(MapContext);
  if (!ctx) {
    throw new Error("useMap must be used within a MapProvider");
  }
  return ctx;
}
