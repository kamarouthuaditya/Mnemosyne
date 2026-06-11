import Link from "next/link";
import { supabaseConfigured } from "@/lib/supabase";

export function PageTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-white/50">{subtitle}</p>}
    </div>
  );
}

export function Card({ children, href }: { children: React.ReactNode; href?: string }) {
  const cls =
    "block rounded-xl border border-white/10 bg-white/[0.02] p-5 transition hover:border-white/25 hover:bg-white/[0.04]";
  return href ? (
    <Link href={href} className={cls}>
      {children}
    </Link>
  ) : (
    <div className={cls}>{children}</div>
  );
}

export function SourceBadges({ source }: { source: string[] }) {
  const colors: Record<string, string> = {
    commit: "bg-emerald-500/15 text-emerald-300",
    transcript: "bg-sky-500/15 text-sky-300",
    pr: "bg-violet-500/15 text-violet-300",
    todo: "bg-amber-500/15 text-amber-300",
    manual: "bg-rose-500/15 text-rose-300",
  };
  return (
    <div className="flex flex-wrap gap-1.5">
      {(source ?? []).map((s) => (
        <span
          key={s}
          className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${colors[s] ?? "bg-white/10 text-white/60"}`}
        >
          {s}
        </span>
      ))}
    </div>
  );
}

export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/15 px-2 py-0.5 text-xs text-white/60">
      {children}
    </span>
  );
}

export function NotConfigured() {
  if (supabaseConfigured) return null;
  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-5 text-sm text-amber-200">
      <p className="font-medium">Supabase not configured.</p>
      <p className="mt-1 text-amber-200/80">
        Copy <code className="rounded bg-black/30 px-1">.env.local.example</code> to{" "}
        <code className="rounded bg-black/30 px-1">.env.local</code> and add your{" "}
        <code>NEXT_PUBLIC_SUPABASE_URL</code> + <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.
      </p>
    </div>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-white/40">{children}</p>;
}

export function fmtDate(d: string | null) {
  if (!d) return "";
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
