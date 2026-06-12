import LoaderArt from "@/components/LoaderArt";

/**
 * Route-transition fallback. A full-screen paper overlay (covers header and
 * footer so nothing peeks under a short page) shown while the dynamic page
 * renders on the server. The client NavLoader extends the visible time so the
 * loader never just flickers.
 */
export default function Loading() {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-paper">
      <LoaderArt />
    </div>
  );
}
