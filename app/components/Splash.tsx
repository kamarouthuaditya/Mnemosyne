"use client";

import { useEffect, useState } from "react";

// ease-out-expo: fast settle, no bounce
const EXPO = "cubic-bezier(0.16, 1, 0.3, 1)";

/**
 * First-paint title page. Renders opaque over the app on every full load,
 * sweeps a hairline rule under the wordmark, then dissolves to home.
 * Persists across client-side navigations (lives in layout) so it only
 * replays on a real page load.
 */
export default function Splash() {
  const [started, setStarted] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.body.style.overflow = "hidden";

    const t0 = setTimeout(() => setStarted(true), 60);
    const tLeave = setTimeout(() => setLeaving(true), reduce ? 650 : 1200);
    const tDone = setTimeout(() => {
      setDone(true);
      document.body.style.overflow = "";
    }, reduce ? 1050 : 1650);

    return () => {
      clearTimeout(t0);
      clearTimeout(tLeave);
      clearTimeout(tDone);
      document.body.style.overflow = "";
    };
  }, []);

  if (done) return null;

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-[100] flex items-center justify-center bg-paper"
      style={{
        opacity: leaving ? 0 : 1,
        pointerEvents: leaving ? "none" : "auto",
        transition: `opacity 450ms ${EXPO}`,
      }}
    >
      <div className="flex flex-col items-center px-6">
        <span
          className="font-display text-5xl font-semibold tracking-tight text-ink sm:text-6xl"
          style={{
            opacity: started ? 1 : 0,
            transform: started ? "translateY(0)" : "translateY(6px)",
            transition: `opacity 600ms ${EXPO}, transform 600ms ${EXPO}`,
          }}
        >
          Mnemosyne
        </span>

        {/* hairline rule sweeps left to right */}
        <span
          className="mt-5 block h-px w-[min(280px,70vw)] origin-left bg-ink-soft"
          style={{
            transform: started ? "scaleX(1)" : "scaleX(0)",
            transition: `transform 900ms ${EXPO}`,
          }}
        />

        <span
          className="label mt-5 max-w-[min(280px,70vw)] text-center leading-relaxed"
          style={{
            opacity: started ? 1 : 0,
            transition: `opacity 700ms ${EXPO} 150ms`,
          }}
        >
          An Archive of Decisions, Not Just Outcomes
        </span>
      </div>
    </div>
  );
}
