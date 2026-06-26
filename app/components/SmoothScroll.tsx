"use client";

/**
 * GSAP ScrollSmoother. Wraps page flow in the required
 * #smooth-wrapper > #smooth-content structure and eases wheel/trackpad
 * scrolling. Fixed overlays (GridField, Splash, Nav loaders) live OUTSIDE this
 * wrapper in the layout — ScrollSmoother transforms #smooth-content, which
 * breaks position:fixed for anything inside it.
 *
 * Internal anchor links (e.g. href="#entries") are intercepted and smooth-
 * scrolled automatically by ScrollSmoother. Honors prefers-reduced-motion by
 * skipping creation entirely (native flow, no transform).
 */

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, useGSAP);

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const wrapper = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const smoother = ScrollSmoother.create({
        wrapper: wrapper.current!,
        content: content.current!,
        smooth: 1.2,
        smoothTouch: 0.1,
        normalizeScroll: true,
      });

      return () => smoother.kill();
    },
    { scope: wrapper },
  );

  return (
    <div id="smooth-wrapper" ref={wrapper}>
      <div id="smooth-content" ref={content}>
        {children}
      </div>
    </div>
  );
}
