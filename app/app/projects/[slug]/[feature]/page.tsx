import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Empty, NotConfigured, PageTitle, SignificanceBadge, SourceBadges, fmtDate, stripMd } from "@/components/ui";

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
          className="label !text-ink-faint underline-offset-2 hover:!text-ink hover:underline"
        >
          {project.name} /
        </Link>
      </div>
      <PageTitle title={feat.name} subtitle={feat.description ? stripMd(feat.description) : undefined} />
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
              {e.significance && e.significance !== "standard" && (
                <div className="mb-1.5">
                  <SignificanceBadge tier={e.significance} />
                </div>
              )}
              <Link
                href={`/entries/${e.id}`}
                className="group block font-display text-lg font-medium leading-snug text-ink transition-transform duration-300 ease-out hover:-translate-y-0.5"
              >
                <span className="group-hover:underline">{e.title}</span>
                <ArrowUpRight
                  className="lucide ml-1 inline h-4 w-4 -translate-x-1 align-[-2px] text-ink-soft opacity-0 transition-all duration-300 ease-out group-hover:translate-x-0 group-hover:opacity-100"
                  strokeWidth={1.5}
                />
              </Link>
              {e.outcome && (
                <p className="mt-1 text-left text-[16px] leading-relaxed text-ink-soft [hyphens:auto] sm:text-justify">
                  {stripMd(e.outcome)}
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
