import Link from "next/link";
import { ScrollText, ArrowUpRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Project } from "@/lib/types";
import { ArrowLink, Empty, NotConfigured, SourceBadges, fmtDate, excerpt } from "@/components/ui";

export const dynamic = "force-dynamic";

type Row = Project & { entries: number; last: string | null };

export default async function OverviewPage() {
  let projects: Row[] = [];

  if (supabase) {
    const { data } = await supabase
      .from("projects")
      .select("*, work_entries(occurred_on)");

    projects = (data ?? [])
      .map((p: any) => ({
        ...p,
        entries: p.work_entries?.length ?? 0,
        last: p.work_entries?.map((e: any) => e.occurred_on).sort().at(-1) ?? null,
      }))
      // latest activity first; projects with no entries sink to the bottom
      .sort((a, b) => (b.last ?? "").localeCompare(a.last ?? ""));
  }

  let recent: any[] = [];
  if (supabase) {
    const { data } = await supabase
      .from("work_entries")
      .select("id, occurred_on, title, source, projects(name, slug), features(name)")
      .order("occurred_on", { ascending: false })
      .limit(6);
    recent = data ?? [];
  }

  const totalEntries = projects.reduce((n, p) => n + p.entries, 0);
  const earliest = projects
    .map((p) => p.started_at)
    .filter(Boolean)
    .sort()[0] as string | undefined;

  return (
    <div>
      {/* Editorial hero */}
      <section className="border-b border-rule pb-8">
        <p className="label">An Archive of Decisions, Not Just Outcomes</p>
        <h1 className="mt-5 max-w-[16ch] font-display text-5xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-7xl">
          Mnemosyne
        </h1>
        <p className="mt-7 text-left text-lg leading-relaxed text-ink-soft [hyphens:auto] sm:text-justify">
          A record of engineering judgment over time. Not just{" "}
          <strong className="font-semibold text-ink">what</strong> was built, but{" "}
          <strong className="font-semibold text-ink">how it was reasoned about</strong>: the context,
          the options weighed, the decision, its rationale, the foresight at the time, and what
          actually happened.
        </p>
        <p className="mt-4 text-left text-[17px] leading-relaxed text-ink-faint [hyphens:auto] sm:text-justify">
          Each entry self-assembles from real signals, git history, pull requests, working
          transcripts, and interview-captured reasoning, then becomes part of a durable, searchable
          memory.
        </p>

        <p className="mt-8 text-[14px] text-ink-faint">
          Designed and built by{" "}
          <a
            href="https://www.linkedin.com/in/adityakamarouthu/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block font-medium text-ink underline-offset-4 transition-transform duration-300 ease-out hover:-translate-y-0.5 hover:underline"
          >
            Aditya Kamarouthu
          </a>
          .
        </p>

        {projects.length > 0 && (
          <dl className="mt-10 grid grid-cols-1 divide-y divide-rule border-t border-rule pt-6 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <Stat n={projects.length} label="Projects" />
            <Stat n={totalEntries} label="Decision logs" />
            {earliest && <Stat n={fmtDate(earliest)} label="Since" />}
          </dl>
        )}
      </section>

      {/* Project ledger */}
      <section className="mt-12">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="label">Projects</h2>
          <ArrowLink href="/timeline" className="text-[14px]">
            View timeline
          </ArrowLink>
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
                  {p.last && (
                    <p className="mt-2 text-[13px] text-ink-faint">last {fmtDate(p.last)}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Recent activity — timeline overview */}
      {recent.length > 0 && (
        <section className="mt-16">
          <div className="mb-6 flex items-baseline justify-between">
            <h2 className="flex items-center gap-2.5 text-[15px] font-semibold uppercase tracking-[0.1em] text-ink">
              <ScrollText className="lucide h-5 w-5 text-ink-soft" strokeWidth={1.5} />
              Recent activity
            </h2>
            <ArrowLink href="/timeline" className="text-[13px]">
              Full timeline
            </ArrowLink>
          </div>

          <div className="border-t border-rule pt-5">
            {recent.map((e, i) => {
              const last = i === recent.length - 1;
              return (
                <Link
                  key={e.id}
                  href={`/entries/${e.id}`}
                  className="group grid grid-cols-[6rem_1.25rem_minmax(0,1fr)] items-start gap-x-4 py-3.5 sm:grid-cols-[7rem_1.25rem_minmax(0,1fr)_auto]"
                >
                  <time className="whitespace-nowrap pt-px text-[13px] uppercase tracking-[0.06em] text-ink-faint transition-colors duration-300 group-hover:text-ink">
                    {fmtDate(e.occurred_on)}
                  </time>

                  {/* connector rail — node is the hover accent */}
                  <div className="relative flex justify-center self-stretch" aria-hidden>
                    {!last && (
                      <span className="absolute left-1/2 top-2 bottom-[-1.75rem] w-px -translate-x-1/2 bg-rule-strong transition-colors duration-300 group-hover:bg-ink" />
                    )}
                    <span className="relative z-10 mt-[5px] h-2.5 w-2.5 origin-center bg-ink ring-4 ring-paper transition-transform duration-300 ease-out group-hover:scale-[1.7]" />
                  </div>

                  <div className="min-w-0">
                    <span className="label !text-ink-faint transition-colors group-hover:!text-ink-soft">
                      {e.projects?.name}
                      {e.features?.name ? ` / ${e.features.name}` : ""}
                    </span>
                    <p className="mt-1 break-words font-display text-lg font-medium leading-snug text-ink transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:underline">
                      {e.title}
                      <ArrowUpRight
                        className="lucide ml-1 inline h-4 w-4 -translate-x-1 align-[-2px] text-ink-soft opacity-0 transition-all duration-300 ease-out group-hover:translate-x-0 group-hover:opacity-100"
                        strokeWidth={1.5}
                      />
                    </p>
                  </div>

                  <div className="hidden sm:block">
                    <SourceBadges source={e.source} />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

function Stat({ n, label }: { n: number | string; label: string }) {
  return (
    <div className="group flex cursor-default flex-col justify-center py-4 first:pt-0 sm:px-8 sm:py-1.5 sm:first:pl-0 sm:first:pt-1.5">
      <dd className="inline-block w-fit font-display text-3xl font-medium leading-none tabular-nums text-ink transition-transform duration-300 ease-out group-hover:-translate-y-0.5">
        {n}
        <span
          aria-hidden
          className="mt-1.5 block h-px origin-left scale-x-0 bg-ink transition-transform duration-300 ease-out group-hover:scale-x-100"
        />
      </dd>
      <dt className="label mt-2 transition-colors duration-300 group-hover:text-ink">{label}</dt>
    </div>
  );
}
