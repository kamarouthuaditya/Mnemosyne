import { supabase } from "@/lib/supabase";
import { Empty, NotConfigured, PageTitle, Tag, fmtDate } from "@/components/ui";
import Markdown from "@/components/Markdown";

export const dynamic = "force-dynamic";

export default async function AchievementsPage() {
  let rows: any[] = [];
  if (supabase) {
    const { data } = await supabase
      .from("achievements")
      .select("*, projects(name), features(name)")
      .order("occurred_on", { ascending: false });
    rows = data ?? [];
  }

  // group by project name
  const groups: Record<string, any[]> = {};
  for (const a of rows) {
    const k = a.projects?.name ?? "—";
    (groups[k] ??= []).push(a);
  }

  return (
    <div>
      <PageTitle title="Achievements" subtitle="The notable wins, grouped by project." />
      <NotConfigured />
      {supabase && rows.length === 0 && <Empty>No achievements yet.</Empty>}
      <div className="space-y-8">
        {Object.entries(groups).map(([project, items]) => (
          <section key={project}>
            <h2 className="mb-3 text-sm font-medium text-white/60">{project}</h2>
            <ul className="space-y-2">
              {items.map((a) => (
                <li key={a.id} className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="font-medium">{a.title}</div>
                    {a.occurred_on && (
                      <span className="shrink-0 text-xs text-white/40">{fmtDate(a.occurred_on)}</span>
                    )}
                  </div>
                  {a.impact && <p className="mt-1 text-sm text-white/60">{a.impact}</p>}
                  {a.description && (
                    <div className="mt-1">
                      <Markdown>{a.description}</Markdown>
                    </div>
                  )}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {a.features?.name && <Tag>{a.features.name}</Tag>}
                    {(a.tags ?? []).map((t: string) => (
                      <Tag key={t}>{t}</Tag>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
