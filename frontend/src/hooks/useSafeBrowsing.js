import { useEffect, useState, useCallback } from "react";

/**
 * "Safe browsing" preference: when on, adult-category card thumbnails are blurred
 * until the user clicks to reveal. Default: ON for everyone (first impression).
 * Persisted to localStorage under `viva_safe_browsing` ("1" = on, "0" = off).
 */
const KEY = "viva_safe_browsing";

function readPref() {
  if (typeof window === "undefined") return true;
  const v = window.localStorage.getItem(KEY);
  return v === null ? true : v === "1";
}

export default function useSafeBrowsing() {
  const [safe, setSafe] = useState(readPref);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === KEY) setSafe(e.newValue === "1" || e.newValue === null);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const toggle = useCallback(() => {
    setSafe((prev) => {
      const next = !prev;
      window.localStorage.setItem(KEY, next ? "1" : "0");
      // Notify other components in the same tab.
      window.dispatchEvent(new StorageEvent("storage", { key: KEY, newValue: next ? "1" : "0" }));
      return next;
    });
  }, []);

  return [safe, toggle];
}
