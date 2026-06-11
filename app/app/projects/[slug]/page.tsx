import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card, Empty, NotConfigured, PageTitle, SourceBadges, Tag, fmtDate } from "@/components/ui";
import Markdown from "@/components/Markdown";

export const dynamic = "force-dynamic";

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!supabase) return <NotConfigured />;

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .single();
  if (!project) notFound();

  const [{ data: features }, { data: entries }, { data: achievements }] = await Promise.all([
    supabase.from("features").select("*").eq("project_id", project.id),
    supabase
      .from("work_entries")
      .select("*, features(name)")
      .eq("project_id", project.id)
      .order("occurred_on", { ascending: false }),
    supabase.from("achievements").select("*").eq("project_id", project.id),
  ]);

  return (
    <div>
      <PageTitle title={project.name} />
      <div className="mb-6 flex items-center gap-2">
        <Tag>{project.status}</Tag>
        {project.started_at && <Tag>since {fmtDate(project.started_at)}</Tag>}
      </div>
      {project.description && (
        <div className="mb-10">
          <Markdown>{project.description}</Markdown>
        </div>
      )}

      {features && features.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-3 text-sm font-medium text-white/60">Features</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {features.map((f) => (
              <Card key={f.id} href={`/projects/${slug}/${f.slug}`}>
                <div className="font-medium">{f.name}</div>
                {f.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-white/50">{f.description}</p>
                )}
              </Card>
            ))}
          </div>
        </section>
      )}

      {achievements && achievements.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-3 text-sm font-medium text-white/60">Achievements</h2>
          <ul className="space-y-2">
            {achievements.map((a) => (
              <li key={a.id} className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
                <div className="font-medium">{a.title}</div>
                {a.impact && <p className="mt-0.5 text-sm text-white/50">{a.impact}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-sm font-medium text-white/60">Timeline</h2>
        {(!entries || entries.length === 0) && <Empty>No entries yet.</Empty>}
        <ol className="relative border-l border-white/10">
          {entries?.map((e) => (
            <li key={e.id} className="mb-6 ml-5">
              <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-white/30 bg-[#0a0a0b]" />
              <div className="flex items-center gap-3 text-xs text-white/40">
                <span>{fmtDate(e.occurred_on)}</span>
                {e.features?.name && <span>/ {e.features.name}</span>}
              </div>
              <Link href={`/entries/${e.id}`} className="mt-1 block font-medium hover:underline">
                {e.title}
              </Link>
              {e.outcome && <p className="mt-1 text-sm text-white/50">{e.outcome}</p>}
              <div className="mt-2">
                <SourceBadges source={e.source} />
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
