import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { NotConfigured, SourceBadges, fmtDate } from "@/components/ui";
import Markdown from "@/components/Markdown";

export const dynamic = "force-dynamic";

const FIELDS: { key: string; label: string }[] = [
  { key: "context", label: "Context" },
  { key: "options_considered", label: "Options considered" },
  { key: "decision", label: "Decision" },
  { key: "rationale", label: "Rationale" },
  { key: "foresight", label: "Foresight" },
  { key: "outcome", label: "Outcome" },
];

export default async function EntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!supabase) return <NotConfigured />;

  const { data: e } = await supabase
    .from("work_entries")
    .select("*, projects(name, slug), features(name)")
    .eq("id", id)
    .single();

  if (!e) notFound();

  return (
    <article>
      <div className="flex items-center gap-3 text-xs text-white/40">
        <span>{fmtDate(e.occurred_on)}</span>
        <span>·</span>
        <Link href={`/projects/${e.projects?.slug}`} className="hover:text-white">
          {e.projects?.name}
        </Link>
        {e.features?.name && <span className="text-white/30">/ {e.features.name}</span>}
      </div>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">{e.title}</h1>
      <div className="mt-3 flex items-center gap-3">
        <SourceBadges source={e.source} />
        {e.source_ref && e.source_ref !== "manual" && (
          <span className="font-mono text-xs text-white/40">{e.source_ref}</span>
        )}
        {e.files_changed != null && (
          <span className="text-xs text-white/40">{e.files_changed} files</span>
        )}
      </div>

      {e.summary && (
        <div className="mt-6">
          <Markdown>{e.summary}</Markdown>
        </div>
      )}

      {/* Decision log — the PM-showcase layer */}
      <section className="mt-8 space-y-px overflow-hidden rounded-xl border border-white/10">
        {FIELDS.filter((f) => e[f.key]).map((f) => (
          <div key={f.key} className="grid grid-cols-[160px_1fr] gap-4 bg-white/[0.02] p-4">
            <div className="pt-0.5 text-xs font-medium uppercase tracking-wide text-white/40">
              {f.label}
            </div>
            <Markdown>{e[f.key]}</Markdown>
          </div>
        ))}
      </section>
    </article>
  );
}
