import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Project } from "@/lib/types";
import { Empty, NotConfigured, PageTitle, fmtDate, excerpt } from "@/components/ui";

export const dynamic = "force-dynamic";

type Row = Project & { entries: number; last: string | null };

export default async function ProjectsPage() {
  let projects: Row[] = [];

  if (supabase) {
    const { data } = await supabase.from("projects").select("*, work_entries(occurred_on)");

    projects = (data ?? [])
      .map((p: any) => ({
        ...p,
        entries: p.work_entries?.length ?? 0,
        last: p.work_entries?.map((e: any) => e.occurred_on).sort().at(-1) ?? null,
      }))
      // latest activity first; projects with no entries sink to the bottom
      .sort((a, b) => (b.last ?? "").localeCompare(a.last ?? ""));
  }

  return (
    <div>
      <PageTitle
        title="Projects"
        subtitle="Every project, most recent activity first. Each opens to its decision log."
      />

      <NotConfigured />

      {supabase && projects.length === 0 && (
        <Empty>No projects yet. Run /worklog log or /worklog reconstruct, then push.py.</Empty>
      )}

      {projects.length > 0 && (
        <div className="border-t border-rule">
          {projects.map((p, i) => (
            <Link
              key={p.id}
              href={`/projects/${p.slug}`}
              className="group relative grid grid-cols-[auto_1fr_auto] items-baseline gap-x-6 border-b border-rule py-6 pl-0 transition-[padding] duration-300 ease-out hover:pl-5"
            >
              {/* left accent bar — grows on hover */}
              <span
                aria-hidden
                className="absolute left-0 top-0 h-full w-[3px] origin-top scale-y-0 bg-ink transition-transform duration-300 ease-out group-hover:scale-y-100"
              />

              <span className="font-mono text-[14px] tabular-nums text-ink-faint transition-colors group-hover:text-ink">
                {String(i + 1).padStart(2, "0")}
              </span>

              <div className="min-w-0">
                <div className="flex items-baseline gap-3">
                  <h3 className="inline-flex items-center gap-1.5 font-display text-2xl font-medium tracking-tight text-ink transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:underline">
                    {p.name}
                    <ArrowUpRight
                      className="lucide h-5 w-5 -translate-x-1 text-ink-soft opacity-0 transition-all duration-300 ease-out group-hover:translate-x-0 group-hover:opacity-100"
                      strokeWidth={1.5}
                    />
                  </h3>
                  <span className="label shrink-0">{p.status}</span>
                </div>
                {p.description && (
                  <p className="mt-2 text-[16px] leading-relaxed text-ink-soft">
                    {excerpt(p.description)}
                  </p>
                )}
              </div>

              <div className="hidden text-right sm:block">
                <p className="font-mono text-[17px] tabular-nums text-ink">{p.entries}</p>
                <p className="label mt-0.5">{p.entries === 1 ? "entry" : "entries"}</p>
                {p.last && <p className="mt-2 text-[13px] text-ink-faint">last {fmtDate(p.last)}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
