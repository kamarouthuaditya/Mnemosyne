import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Empty, NotConfigured, PageTitle, SourceBadges, fmtDate } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function FeaturePage({
  params,
}: {
  params: Promise<{ slug: string; feature: string }>;
}) {
  const { slug, feature } = await params;
  if (!supabase) return <NotConfigured />;

  const { data: project } = await supabase
    .from("projects")
    .select("id, name")
    .eq("slug", slug)
    .single();
  if (!project) notFound();

  const { data: feat } = await supabase
    .from("features")
    .select("*")
    .eq("project_id", project.id)
    .eq("slug", feature)
    .single();
  if (!feat) notFound();

  const { data: entries } = await supabase
    .from("work_entries")
    .select("*")
    .eq("feature_id", feat.id)
    .order("occurred_on", { ascending: false });

  return (
    <div>
      <div className="mb-2">
        <Link
          href={`/projects/${slug}`}
          className="label !text-ink-faint hover:!text-ink"
        >
          {project.name} /
        </Link>
      </div>
      <PageTitle title={feat.name} subtitle={feat.description ?? undefined} />
      {(!entries || entries.length === 0) && <Empty>No entries for this feature yet.</Empty>}
      <div className="border-t border-rule">
        {entries?.map((e) => (
          <article
            key={e.id}
            className="grid grid-cols-[6.5rem_1fr] gap-x-5 border-b border-rule py-5"
          >
            <div className="pt-0.5 text-[13px] uppercase tracking-[0.06em] text-ink-faint">
              {fmtDate(e.occurred_on)}
            </div>
            <div className="min-w-0">
              <Link
                href={`/entries/${e.id}`}
                className="block font-display text-lg font-medium leading-snug text-ink hover:underline"
              >
                {e.title}
              </Link>
              {e.outcome && (
                <p className="mt-1 text-justify text-[16px] leading-relaxed text-ink-soft [hyphens:auto]">
                  {e.outcome}
                </p>
              )}
              <div className="mt-2">
                <SourceBadges source={e.source} />
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
