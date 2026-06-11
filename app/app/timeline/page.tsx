import Link from "next/link";
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
    <div className="max-w-3xl">
      <PageTitle title="Timeline" subtitle="Every entry, most recent first. The full working record." />
      <NotConfigured />
      {supabase && entries.length === 0 && <Empty>No entries yet.</Empty>}

      {groups.map((group) => (
        <section key={group.month} className="mb-12">
          <h2 className="label sticky top-0 z-10 -mx-6 mb-2 bg-paper px-6 py-3">{group.month}</h2>

          <div className="border-t border-rule">
            {group.items.map((e) => (
              <article
                key={e.id}
                className="grid grid-cols-[3rem_1fr] gap-x-5 border-b border-rule py-6"
              >
                {/* Day rail */}
                <div className="pt-1 text-right">
                  <span className="font-mono text-lg tabular-nums leading-none text-ink">
                    {dayNum(e.occurred_on)}
                  </span>
                </div>

                {/* Entry body */}
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-2 text-[12px] text-ink-faint">
                    <Link
                      href={`/projects/${e.projects?.slug}`}
                      className="font-medium uppercase tracking-[0.08em] text-ink-soft hover:text-ink"
                    >
                      {e.projects?.name}
                    </Link>
                    {e.features?.name && (
                      <>
                        <span aria-hidden>/</span>
                        <span className="uppercase tracking-[0.08em]">{e.features.name}</span>
                      </>
                    )}
                  </div>

                  <Link
                    href={`/entries/${e.id}`}
                    className="mt-1.5 block font-display text-xl font-medium leading-snug tracking-tight text-ink hover:underline"
                  >
                    {e.title}
                  </Link>

                  {(e.outcome || e.summary) && (
                    <p className="mt-1.5 max-w-[64ch] text-[14px] leading-relaxed text-ink-soft line-clamp-2">
                      {e.outcome || e.summary}
                    </p>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                    <SourceBadges source={e.source} />
                    {typeof e.files_changed === "number" && e.files_changed > 0 && (
                      <span className="label !text-ink-faint">{e.files_changed} files</span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
