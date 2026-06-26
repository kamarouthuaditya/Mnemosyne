import Link from "next/link";
import { ScrollText, ArrowUpRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Project } from "@/lib/types";
import { ArrowLink, Empty, NotConfigured, SignificanceBadge, SourceBadges, fmtDate, excerpt, stripMd } from "@/components/ui";

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

  let featured: any[] = [];
  if (supabase) {
    const { data } = await supabase
      .from("work_entries")
      .select(
        "id, occurred_on, title, outcome, business_impact, significance, source, projects(name, slug), features(name)",
      )
      .in("significance", ["landmark", "notable"])
      .order("occurred_on", { ascending: false });
    // landmark first, then notable; newest within each tier
    const rank: Record<string, number> = { landmark: 0, notable: 1 };
    featured = (data ?? [])
      .sort((a: any, b: any) => (rank[a.significance] ?? 9) - (rank[b.significance] ?? 9))
      .slice(0, 4);
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

      {/* Latest addition — the most recently active project, with what it's about */}
      {projects[0] && (
        <section className="mt-12">
          <h2 className="label mb-6">Latest addition</h2>
          <Link
            href={`/projects/${projects[0].slug}`}
            className="group relative block border border-rule bg-paper p-6 transition-colors duration-300 ease-out hover:border-ink sm:p-7"
          >
            <span
              aria-hidden
              className="absolute left-0 top-0 h-full w-[3px] origin-top scale-y-0 bg-ink transition-transform duration-300 ease-out group-hover:scale-y-100"
            />
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <span className="label shrink-0">{projects[0].status}</span>
              {projects[0].last && (
                <>
                  <span aria-hidden className="text-rule-strong">·</span>
                  <span className="text-[13px] uppercase tracking-[0.06em] text-ink-faint">
                    updated {fmtDate(projects[0].last)}
                  </span>
                </>
              )}
            </div>
            <h3 className="mt-3 inline-flex items-center gap-1.5 font-display text-2xl font-semibold tracking-tight text-ink transition-transform duration-300 ease-out group-hover:-translate-y-0.5 sm:text-[28px]">
              {projects[0].name}
              <ArrowUpRight
                className="lucide h-5 w-5 -translate-x-1 text-ink-soft opacity-0 transition-all duration-300 ease-out group-hover:translate-x-0 group-hover:opacity-100"
                strokeWidth={1.5}
              />
            </h3>
            {projects[0].description && (
              <p className="mt-2 text-[16px] leading-relaxed text-ink-soft">
                {excerpt(projects[0].description)}
              </p>
            )}
            {recent[0] && recent[0].projects?.slug === projects[0].slug && (
              <div className="mt-5 flex flex-wrap items-baseline gap-x-2 gap-y-1 border-l-[3px] border-ink bg-paper-sunk px-4 py-2.5 text-[14px]">
                <span className="label shrink-0 !text-ink">Latest entry</span>
                <span aria-hidden className="text-rule-strong">·</span>
                <span className="font-medium text-ink">{recent[0].title}</span>
              </div>
            )}
          </Link>
        </section>
      )}

      {/* Featured — the strongest reads, surfaced across projects */}
      {featured.length > 0 && (
        <section className="mt-14">
          <div className="mb-6 flex items-baseline justify-between">
            <h2 className="label">The strongest reads</h2>
            <ArrowLink href="/timeline" className="text-[14px]">
              All entries
            </ArrowLink>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {featured.map((e) => {
              const landmark = e.significance === "landmark";
              return (
                <Link
                  key={e.id}
                  href={`/entries/${e.id}`}
                  className={`group relative block bg-paper p-6 transition-[border-color,transform] duration-300 ease-out hover:-translate-y-0.5 ${
                    landmark
                      ? "border-2 border-ink sm:col-span-2"
                      : "border border-rule-strong hover:border-ink"
                  }`}
                >
                  {landmark && (
                    <span
                      aria-hidden
                      className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-ink transition-transform duration-300 ease-out group-hover:scale-x-100"
                    />
                  )}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                    <SignificanceBadge tier={e.significance} />
                    <span className="text-[13px] uppercase tracking-[0.06em] text-ink-faint">
                      {fmtDate(e.occurred_on)}
                    </span>
                    <span className="label !text-ink-faint">
                      {e.projects?.name}
                      {e.features?.name ? ` / ${e.features.name}` : ""}
                    </span>
                  </div>
                  <h3
                    className={`mt-3 font-display font-semibold leading-snug text-ink transition-transform duration-300 ease-out group-hover:-translate-y-0.5 ${
                      landmark ? "text-2xl sm:text-[28px]" : "text-xl"
                    }`}
                  >
                    <span className="group-hover:underline">{e.title}</span>
                    <ArrowUpRight
                      className="lucide ml-1 inline h-5 w-5 -translate-x-1 align-[-3px] text-ink-soft opacity-0 transition-all duration-300 ease-out group-hover:translate-x-0 group-hover:opacity-100"
                      strokeWidth={1.5}
                    />
                  </h3>
                  {e.outcome && (
                    <p
                      className={`mt-2 text-[16px] leading-relaxed text-ink-soft ${
                        landmark ? "" : "line-clamp-2"
                      }`}
                    >
                      {stripMd(e.outcome)}
                    </p>
                  )}
                  {landmark && e.business_impact && (
                    <p className="mt-3 border-l-2 border-ink pl-3 text-[15px] font-medium leading-relaxed text-ink">
                      {stripMd(e.business_impact)}
                    </p>
                  )}
                  <div className="mt-3">
                    <SourceBadges source={e.source} />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Project ledger — compact grid; full detail lives on /projects */}
      <section className="mt-14">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="label">Projects</h2>
          <ArrowLink href="/projects" className="text-[14px]">
            All projects
          </ArrowLink>
        </div>

        <NotConfigured />

        {supabase && projects.length === 0 && (
          <Empty>No projects yet. Run /worklog log or /worklog reconstruct, then push.py.</Empty>
        )}

        {projects.length > 0 && (
          <div className="grid border-l border-t border-rule sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <Link
                key={p.id}
                href={`/projects/${p.slug}`}
                className="group relative flex flex-col border-b border-r border-rule bg-paper p-5 transition-colors hover:bg-paper-sunk"
              >
                {/* left accent bar — grows on hover */}
                <span
                  aria-hidden
                  className="absolute left-0 top-0 h-full w-[3px] origin-top scale-y-0 bg-ink transition-transform duration-300 ease-out group-hover:scale-y-100"
                />

                <div className="flex items-start justify-between gap-3">
                  <h3 className="inline-flex items-center gap-1.5 font-display text-xl font-medium leading-tight tracking-tight text-ink transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:underline">
                    {p.name}
                    <ArrowUpRight
                      className="lucide h-4 w-4 -translate-x-1 text-ink-soft opacity-0 transition-all duration-300 ease-out group-hover:translate-x-0 group-hover:opacity-100"
                      strokeWidth={1.5}
                    />
                  </h3>
                  <span className="label shrink-0">{p.status}</span>
                </div>

                <div className="mt-auto pt-4 flex items-baseline gap-2 text-[13px] text-ink-faint">
                  <span className="font-mono tabular-nums text-ink-soft">{p.entries}</span>
                  <span>{p.entries === 1 ? "entry" : "entries"}</span>
                  {p.last && (
                    <>
                      <span aria-hidden className="text-rule-strong">·</span>
                      <span>last {fmtDate(p.last)}</span>
                    </>
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
