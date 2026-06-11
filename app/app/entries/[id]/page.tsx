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
    <article className="max-w-3xl">
      <div className="flex flex-wrap items-center gap-x-2 text-[12px] uppercase tracking-[0.08em] text-ink-faint">
        <span>{fmtDate(e.occurred_on)}</span>
        <span aria-hidden>/</span>
        <Link href={`/projects/${e.projects?.slug}`} className="text-ink-soft hover:text-ink">
          {e.projects?.name}
        </Link>
        {e.features?.name && (
          <>
            <span aria-hidden>/</span>
            <span>{e.features.name}</span>
          </>
        )}
      </div>

      <h1 className="mt-3 font-display text-4xl font-semibold leading-[1.1] tracking-tight text-ink">
        {e.title}
      </h1>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-rule pb-6">
        <SourceBadges source={e.source} />
        {e.source_ref && e.source_ref !== "manual" && (
          <span className="font-mono text-[12px] text-ink-faint">{e.source_ref}</span>
        )}
        {e.files_changed != null && (
          <span className="label !text-ink-faint">{e.files_changed} files</span>
        )}
      </div>

      {e.summary && (
        <div className="mt-7 text-[15px]">
          <Markdown>{e.summary}</Markdown>
        </div>
      )}

      {/* Decision log, the reasoning trail */}
      <section className="mt-10 border-t border-rule">
        {FIELDS.filter((f) => e[f.key]).map((f) => (
          <div
            key={f.key}
            className="grid gap-x-8 gap-y-2 border-b border-rule py-7 sm:grid-cols-[180px_1fr]"
          >
            <div className="label pt-1">{f.label}</div>
            <div className="text-[15px]">
              <Markdown>{e[f.key]}</Markdown>
            </div>
          </div>
        ))}
      </section>
    </article>
  );
}
