import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Project } from "@/lib/types";
import { Empty, NotConfigured, fmtDate } from "@/components/ui";

export const dynamic = "force-dynamic";

type Row = Project & { entries: number; last: string | null };

export default async function OverviewPage() {
  let projects: Row[] = [];

  if (supabase) {
    const { data } = await supabase
      .from("projects")
      .select("*, work_entries(occurred_on)")
      .order("updated_at", { ascending: false });

    projects = (data ?? []).map((p: any) => ({
      ...p,
      entries: p.work_entries?.length ?? 0,
      last: p.work_entries?.map((e: any) => e.occurred_on).sort().at(-1) ?? null,
    }));
  }

  const totalEntries = projects.reduce((n, p) => n + p.entries, 0);
  const earliest = projects
    .map((p) => p.started_at)
    .filter(Boolean)
    .sort()[0] as string | undefined;

  return (
    <div>
      {/* Editorial hero */}
      <section className="border-b border-rule pb-14">
        <p className="label">Career Memory</p>
        <h1 className="mt-5 max-w-[16ch] font-display text-5xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-7xl">
          Mnemosyne
        </h1>
        <p className="mt-7 max-w-[64ch] text-lg leading-relaxed text-ink-soft">
          A record of engineering judgment over time. Not just <em>what</em> was built, but{" "}
          <em>how it was reasoned about</em>: the context, the options weighed, the decision, its
          rationale, the foresight at the time, and what actually happened.
        </p>
        <p className="mt-4 max-w-[64ch] text-[17px] leading-relaxed text-ink-faint">
          Each entry self-assembles from real signals, git history, pull requests, working
          transcripts, and interview-captured reasoning, then becomes part of a durable, searchable
          memory.
        </p>

        <p className="mt-8 text-[14px] text-ink-faint">
          Designed and built by{" "}
          <span className="font-medium text-ink">Aditya Kamarouthu</span>, sole creator.
        </p>

        {projects.length > 0 && (
          <dl className="mt-10 grid grid-cols-3 divide-x divide-rule border-t border-rule pt-6">
            <Stat n={projects.length} label="Projects" />
            <Stat n={totalEntries} label="Decision logs" />
            {earliest && <Stat n={fmtDate(earliest)} label="Since" />}
          </dl>
        )}
      </section>

      {/* Project ledger */}
      <section className="mt-14">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="label">Projects</h2>
          <Link href="/timeline" className="text-[14px] font-medium text-ink-soft hover:text-ink">
            View timeline →
          </Link>
        </div>

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
                className="group grid grid-cols-[auto_1fr_auto] items-baseline gap-x-6 border-b border-rule py-6 transition-colors hover:bg-paper-sunk"
              >
                <span className="font-mono text-[14px] tabular-nums text-ink-faint">
                  {String(i + 1).padStart(2, "0")}
                </span>

                <div className="min-w-0">
                  <div className="flex items-baseline gap-3">
                    <h3 className="font-display text-2xl font-medium tracking-tight text-ink transition-colors group-hover:underline">
                      {p.name}
                    </h3>
                    <span className="label shrink-0">{p.status}</span>
                  </div>
                  {p.description && (
                    <p className="mt-2 max-w-[70ch] text-[16px] leading-relaxed text-ink-soft line-clamp-2">
                      {p.description}
                    </p>
                  )}
                </div>

                <div className="hidden text-right sm:block">
                  <p className="font-mono text-[17px] tabular-nums text-ink">{p.entries}</p>
                  <p className="label mt-0.5">{p.entries === 1 ? "entry" : "entries"}</p>
                  {p.last && (
                    <p className="mt-2 text-[13px] text-ink-faint">last {fmtDate(p.last)}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ n, label }: { n: number | string; label: string }) {
  return (
    <div className="px-8 first:pl-0">
      <dd className="font-display text-3xl font-medium tabular-nums text-ink">{n}</dd>
      <dt className="label mt-1">{label}</dt>
    </div>
  );
}
