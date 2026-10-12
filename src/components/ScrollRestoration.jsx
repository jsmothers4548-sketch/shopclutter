import { useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";
import { restoreScroll } from "@/lib/scroll";

const getHashId = (hash) => {
  const rawId = hash.slice(1);

  try {
    return decodeURIComponent(rawId);
  } catch {
    return rawId;
  }
};

// Remembers where each screen was scrolled to, so returning to it (browser or
// device Back, or an in-app Back control) lands where the person left off
// instead of at the top. Moving forward to a new screen still starts at the top.
export default function ScrollRestoration() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const positions = useRef(new Map());

  // Read through a ref so a stray scroll event during the transition is always
  // filed under the screen that is on its way in, never over the one leaving.
  const currentKey = useRef(location.key);
  currentKey.current = location.key;

  useEffect(() => {
    const remember = () =>
      positions.current.set(currentKey.current, window.scrollY);
    window.addEventListener("scroll", remember, { passive: true });
    return () => window.removeEventListener("scroll", remember);
  }, []);

  // The browser's own restoration would fight ours on Back.
  useEffect(() => {
    if (!("scrollRestoration" in window.history)) return;
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    return () => {
      window.history.scrollRestoration = previous;
    };
  }, []);

  useEffect(() => {
    if (navigationType === "POP") {
      const saved = positions.current.get(location.key);
      if (saved) return restoreScroll(saved);
      return;
    }

    if (location.hash) {
      const id = getHashId(location.hash);
      const timer = window.setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }, 50);
      return () => window.clearTimeout(timer);
    }

    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location.key, location.pathname, location.hash, navigationType]);

  return null;
}