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
      <div className="mb-1 text-sm text-white/40">
        <Link href={`/projects/${slug}`} className="hover:text-white">
          {project.name}
        </Link>{" "}
        /
      </div>
      <PageTitle title={feat.name} subtitle={feat.description ?? undefined} />
      {(!entries || entries.length === 0) && <Empty>No entries for this feature yet.</Empty>}
      <ol className="relative border-l border-white/10">
        {entries?.map((e) => (
          <li key={e.id} className="mb-6 ml-5">
            <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-white/30 bg-[#0a0a0b]" />
            <div className="text-xs text-white/40">{fmtDate(e.occurred_on)}</div>
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
    </div>
  );
}
