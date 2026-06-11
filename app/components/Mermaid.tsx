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
          theme: "dark",
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
      <pre className="overflow-x-auto rounded-lg border border-rose-500/30 bg-rose-500/5 p-3 text-xs text-rose-300">
        {chart}
      </pre>
    );
  }

  return (
    <div
      ref={ref}
      className="my-4 flex justify-center overflow-x-auto rounded-lg border border-white/10 bg-white/[0.02] p-4 [&_svg]:max-w-full"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
