/**
 * Shared loading visual: a mini title page. Used by both the Suspense
 * fallback (loading.tsx, covers the fetch wait) and the client NavLoader
 * (guarantees a minimum dwell). Identical art so the handoff is invisible.
 * The sweep ping-pongs with ease-in-out, no hard loop wrap.
 */
export default function LoaderArt() {
  return (
    <div className="flex flex-col items-center gap-6">
      <span className="font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
        Mnemosyne
      </span>

      <span className="relative block h-px w-[min(360px,75vw)] overflow-hidden bg-rule">
        <span className="absolute inset-y-0 left-0 w-1/3 bg-ink animate-[track-sweep_1.3s_ease-in-out_infinite_alternate]" />
      </span>

      <span className="label !text-ink-faint">Retrieving the record</span>
    </div>
  );
}
