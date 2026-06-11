import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Empty, NotConfigured, PageTitle, SourceBadges, fmtDate } from "@/components/ui";

export const dynamic = "force-dynamic";

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

  return (
    <div>
      <PageTitle title="Timeline" subtitle="Everything, most recent first." />
      <NotConfigured />
      {supabase && entries.length === 0 && <Empty>No entries yet.</Empty>}
      <ol className="relative border-l border-white/10">
        {entries.map((e) => (
          <li key={e.id} className="mb-8 ml-5">
            <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-white/30 bg-[#0a0a0b]" />
            <div className="flex items-center gap-3 text-xs text-white/40">
              <span>{fmtDate(e.occurred_on)}</span>
              <span>·</span>
              <Link href={`/projects/${e.projects?.slug}`} className="hover:text-white">
                {e.projects?.name}
              </Link>
              {e.features?.name && <span className="text-white/30">/ {e.features.name}</span>}
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
    </div>
  );
}
