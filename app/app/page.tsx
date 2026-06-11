import { supabase } from "@/lib/supabase";
import { Project } from "@/lib/types";
import { Card, Empty, NotConfigured, PageTitle, Tag, fmtDate } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  let projects: (Project & { entries: number; last: string | null })[] = [];

  if (supabase) {
    const { data } = await supabase
      .from("projects")
      .select("*, work_entries(occurred_on)")
      .order("updated_at", { ascending: false });

    projects = (data ?? []).map((p: any) => ({
      ...p,
      entries: p.work_entries?.length ?? 0,
      last:
        p.work_entries?.map((e: any) => e.occurred_on).sort().at(-1) ?? null,
    }));
  }

  return (
    <div>
      <PageTitle
        title="Portfolio"
        subtitle="Every project, with what was built and how it was reasoned about."
      />
      <NotConfigured />
      {supabase && projects.length === 0 && (
        <Empty>No projects yet. Run /worklog log or /worklog reconstruct, then push.py.</Empty>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        {projects.map((p) => (
          <Card key={p.id} href={`/projects/${p.slug}`}>
            <div className="flex items-start justify-between">
              <h2 className="font-medium">{p.name}</h2>
              <Tag>{p.status}</Tag>
            </div>
            {p.description && (
              <p className="mt-2 line-clamp-2 text-sm text-white/50">{p.description}</p>
            )}
            <div className="mt-4 flex gap-4 text-xs text-white/40">
              <span>{p.entries} entries</span>
              {p.last && <span>last {fmtDate(p.last)}</span>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
