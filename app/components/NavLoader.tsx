"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import LoaderArt from "./LoaderArt";

// ease-in-out, smooth on both ends
const EASE = "cubic-bezier(0.65, 0, 0.35, 1)";
const DWELL = 1000; // minimum time the loader stays after a navigation commits
const FADE = 500;

/**
 * Guarantees the route loader is seen. On every in-app navigation it holds a
 * full-screen overlay for a minimum dwell, then fades out with ease-in-out.
 * Shares LoaderArt with the Suspense fallback so a slow fetch (loading.tsx)
 * hands off to this dwell with no visible seam. Skips the very first mount,
 * where the Splash already covers the screen.
 */
export default function NavLoader() {
  const pathname = usePathname();
  const first = useRef(true);
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setVisible(true);
    setLeaving(false);
    document.body.style.overflow = "hidden";

    const tLeave = setTimeout(() => setLeaving(true), DWELL);
    const tHide = setTimeout(() => {
      setVisible(false);
      document.body.style.overflow = "";
    }, DWELL + FADE);

    return () => {
      clearTimeout(tLeave);
      clearTimeout(tHide);
      document.body.style.overflow = "";
    };
  }, [pathname]);

  if (!visible) return null;

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-[90] flex items-center justify-center bg-paper"
      style={{
        opacity: leaving ? 0 : 1,
        pointerEvents: leaving ? "none" : "auto",
        transition: `opacity ${FADE}ms ${EASE}`,
      }}
    >
      <LoaderArt />
    </div>
  );
}
