import Link from "next/link";
import { notFound } from "next/navigation";
import { TrendingUp } from "lucide-react";
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
      <div className="flex flex-wrap items-center gap-x-2 text-[13px] uppercase tracking-[0.08em] text-ink-faint">
        <span>{fmtDate(e.occurred_on)}</span>
        <span aria-hidden>/</span>
        <Link
          href={`/projects/${e.projects?.slug}`}
          className="text-ink-soft underline-offset-2 transition-colors hover:text-ink hover:underline"
        >
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
          <span className="font-mono text-[13px] text-ink-faint">{e.source_ref}</span>
        )}
        {e.files_changed != null && (
          <span className="label !text-ink-faint">{e.files_changed} files</span>
        )}
      </div>

      {e.business_impact && (
        <section className="mt-7 bg-ink-muted px-6 py-5">
          <h2 className="mb-2 flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.12em] text-paper/70">
            <TrendingUp className="lucide h-4 w-4" strokeWidth={1.5} />
            Business impact
          </h2>
          <p className="whitespace-pre-line text-[16px] leading-relaxed text-paper/90">
            {e.business_impact}
          </p>
        </section>
      )}

      {e.summary && (
        <div className="mt-7 text-[17px]">
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
            <div className="text-[17px]">
              <Markdown>{e[f.key]}</Markdown>
            </div>
          </div>
        ))}
      </section>
    </article>
  );
}
