/**
 * Drafting-grid marginalia. A faint hairline grid fills the viewport but is
 * masked to show only in the side gutters, dissolving to clean paper under the
 * content column. Renders only at xl+ where real gutters exist. Monochrome,
 * sharp, no color: an engineering-paper nod for the margins of the monograph.
 */
export default function GridField() {
  const line = "color-mix(in oklch, var(--ink) 5%, transparent)";
  const cell = "30px";

  // opaque grid at the page edges, transparent across the centered column,
  // with a short fade at each boundary. ~32rem = half of max-w-5xl.
  const fade =
    "linear-gradient(to right," +
    " #000 0," +
    " #000 calc(50% - 37rem)," +
    " transparent calc(50% - 31rem)," +
    " transparent calc(50% + 31rem)," +
    " #000 calc(50% + 37rem)," +
    " #000 100%)";

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 hidden xl:block"
      style={{
        zIndex: -1,
        backgroundImage: `repeating-linear-gradient(to right, ${line} 0 1px, transparent 1px ${cell}), repeating-linear-gradient(to bottom, ${line} 0 1px, transparent 1px ${cell})`,
        WebkitMaskImage: fade,
        maskImage: fade,
      }}
    />
  );
}
