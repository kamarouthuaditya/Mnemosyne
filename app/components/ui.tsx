import Link from "next/link";
import { supabaseConfigured } from "@/lib/supabase";

export function PageTitle({
  title,
  subtitle,
  icon,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="mb-10 border-b border-rule pb-6">
      <h1 className="flex items-center gap-3.5 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
        {icon}
        {title}
      </h1>
      {subtitle && (
        <p className="mt-3 text-[17px] leading-relaxed text-ink-soft">{subtitle}</p>
      )}
    </div>
  );
}

export function Card({ children, href }: { children: React.ReactNode; href?: string }) {
  const cls =
    "block border border-rule bg-paper p-6 transition-colors hover:border-rule-strong hover:bg-paper-sunk";
  return href ? (
    <Link href={href} className={cls}>
      {children}
    </Link>
  ) : (
    <div className={cls}>{children}</div>
  );
}

/** Sources render as monochrome boxed chips, differentiated by weight not hue. */
export function SourceBadges({ source }: { source: string[] }) {
  if (!source?.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {source.map((s) => (
        <span key={s} className="chip">
          {s}
        </span>
      ))}
    </div>
  );
}

export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="border border-rule-strong px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.1em] text-ink-soft">
      {children}
    </span>
  );
}

export function NotConfigured() {
  if (supabaseConfigured) return null;
  return (
    <div className="mb-10 border border-ink/20 bg-paper-sunk p-6">
      <p className="label !text-ink">Supabase not configured</p>
      <p className="mt-2 text-[16px] leading-relaxed text-ink-soft">
        Set <code className="bg-ink/10 px-1 font-mono text-[14px]">NEXT_PUBLIC_SUPABASE_URL</code>{" "}
        and <code className="bg-ink/10 px-1 font-mono text-[14px]">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>{" "}
        in <code className="bg-ink/10 px-1 font-mono text-[14px]">app/.env.local</code> (local) or
        the Vercel project environment, then rebuild.
      </p>
    </div>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="border border-dashed border-rule px-6 py-10 text-center text-[16px] text-ink-faint">
      {children}
    </p>
  );
}

/** Flatten markdown to plain text for previews (ledger rows, line-clamped summaries). */
export function stripMd(md: string | null): string {
  if (!md) return "";
  return md
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "") // images
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // links -> text
    .replace(/`([^`]+)`/g, "$1") // inline code
    .replace(/(\*\*|__)(.*?)\1/g, "$2") // bold
    .replace(/(\*|_)(.*?)\1/g, "$2") // italic
    .replace(/^#{1,6}\s+/gm, "") // headings
    .replace(/^>\s?/gm, "") // blockquotes
    .replace(/\r?\n+/g, " ") // newlines
    .replace(/\s+/g, " ")
    .trim();
}

/** Lead paragraph of a markdown doc, flattened to plain text. For ledger/preview rows. */
export function excerpt(md: string | null): string {
  if (!md) return "";
  const firstBlock = md.trim().split(/\n\s*\n/)[0] ?? "";
  return stripMd(firstBlock);
}

export function fmtDate(d: string | null) {
  if (!d) return "";
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
