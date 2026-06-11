import Link from "next/link";
import { ScrollText } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Empty, NotConfigured, PageTitle, SourceBadges, fmtDate } from "@/components/ui";

export const dynamic = "force-dynamic";

function monthKey(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function dayNum(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", { day: "2-digit" });
}

export default async function TimelinePage() {
  let entries: any[] = [];
  if (supabase) {
    const { data } = await supabase
      .from("work_entries")
      .select("*, projects(name, slug), features(name)")
      .order("occurred_on", { ascending: false })
      .limit(200);
    entries = data ?? [];
  }

  // Group consecutive entries by month for editorial rhythm.
  const groups: { month: string; items: any[] }[] = [];
  for (const e of entries) {
    const m = monthKey(e.occurred_on);
    const g = groups.at(-1);
    if (g && g.month === m) g.items.push(e);
    else groups.push({ month: m, items: [e] });
  }

  return (
    <div>
      <PageTitle
        title="Timeline"
        subtitle="Every entry, most recent first. The full working record."
        icon={<ScrollText className="lucide h-8 w-8 text-ink-soft" strokeWidth={1.5} />}
      />
      <NotConfigured />
      {supabase && entries.length === 0 && <Empty>No entries yet.</Empty>}

      {groups.map((group) => (
        <section key={group.month} className="mb-10">
          <h2 className="label sticky top-0 z-20 -mx-6 mb-5 bg-paper px-6 py-3">{group.month}</h2>

          <div>
            {group.items.map((e, i) => {
              const last = i === group.items.length - 1;
              return (
                <article
                  key={e.id}
                  className="grid grid-cols-[2.5rem_1.25rem_1fr] items-start gap-x-3 pb-7 last:pb-0"
                >
                  {/* Day */}
                  <time className="pt-px text-right font-mono text-base tabular-nums leading-none text-ink">
                    {dayNum(e.occurred_on)}
                  </time>

                  {/* Rail: connector line + node, both centered on the same axis */}
                  <div className="relative flex justify-center self-stretch" aria-hidden>
                    {!last && (
                      <span className="absolute left-1/2 top-1 bottom-[-2rem] w-px -translate-x-1/2 bg-rule-strong" />
                    )}
                    <span className="relative z-10 mt-[5px] h-2.5 w-2.5 bg-ink ring-4 ring-paper" />
                  </div>

                  {/* Entry body */}
                  <div className={`min-w-0 ${last ? "" : "border-b border-rule pb-7"}`}>
                    {/* Source line: project / feature */}
                    <div className="flex flex-wrap items-center gap-x-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-ink-faint">
                      <Link
                        href={`/projects/${e.projects?.slug}`}
                        className="text-ink-soft hover:text-ink"
                      >
                        {e.projects?.name}
                      </Link>
                      {e.features?.name && (
                        <>
                          <span aria-hidden className="text-rule-strong">/</span>
                          <span>{e.features.name}</span>
                        </>
                      )}
                    </div>

                    <Link
                      href={`/entries/${e.id}`}
                      className="mt-2 block font-display text-2xl font-medium leading-snug tracking-tight text-ink hover:underline"
                    >
                      {e.title}
                    </Link>

                    {(e.outcome || e.summary) && (
                      <p className="mt-2 text-justify text-[16px] leading-relaxed text-ink-soft [hyphens:auto]">
                        {e.outcome || e.summary}
                      </p>
                    )}

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <SourceBadges source={e.source} />
                      {typeof e.files_changed === "number" && e.files_changed > 0 && (
                        <span className="chip chip-faint">{e.files_changed} files</span>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
