"use client";

import { useEffect, useId, useRef, useState } from "react";

let initialized = false;

export default function Mermaid({ chart }: { chart: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [err, setErr] = useState<string>("");
  const id = useId().replace(/:/g, "");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const mermaid = (await import("mermaid")).default;
      if (!initialized) {
        mermaid.initialize({
          startOnLoad: false,
          theme: "neutral",
          securityLevel: "strict",
          fontFamily: "inherit",
        });
        initialized = true;
      }
      try {
        const { svg } = await mermaid.render(`m-${id}`, chart.trim());
        if (!cancelled) setSvg(svg);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message ?? "diagram error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [chart, id]);

  if (err) {
    return (
      <pre className="overflow-x-auto border border-ink/30 bg-paper-sunk p-3 text-xs text-ink-soft">
        {chart}
      </pre>
    );
  }

  return (
    <div
      ref={ref}
      className="my-4 flex justify-center overflow-x-auto border border-rule bg-paper-sunk p-4 [&_svg]:max-w-full"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
