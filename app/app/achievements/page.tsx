import { Award, Folder } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Empty, NotConfigured, PageTitle, Tag, fmtDate, stripMd } from "@/components/ui";
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
      <PageTitle
        title="Achievements"
        subtitle="The notable wins, grouped by project."
        icon={<Award className="lucide h-8 w-8 text-ink-soft" strokeWidth={1.5} />}
      />
      <NotConfigured />
      {supabase && rows.length === 0 && <Empty>No achievements yet.</Empty>}
      <div className="space-y-10">
        {Object.entries(groups).map(([project, items]) => (
          <section key={project}>
            <h2 className="mb-4 flex items-center gap-2.5 text-[15px] font-semibold uppercase tracking-[0.1em] text-ink">
              <Folder className="lucide h-5 w-5 text-ink-soft" strokeWidth={1.5} />
              {project}
            </h2>
            <ul className="border-t border-rule">
              {items.map((a) => (
                <li key={a.id} className="border-b border-rule py-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="font-display text-lg font-medium text-ink">{a.title}</div>
                    {a.occurred_on && (
                      <span className="shrink-0 text-[13px] uppercase tracking-[0.06em] text-ink-faint">
                        {fmtDate(a.occurred_on)}
                      </span>
                    )}
                  </div>
                  {a.impact && <p className="mt-1 text-[16px] text-ink-soft">{stripMd(a.impact)}</p>}
                  {a.description && (
                    <div className="mt-1">
                      <Markdown>{a.description}</Markdown>
                    </div>
                  )}
                  <div className="mt-3 flex flex-wrap gap-1.5">
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
