import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, ScrollText, ArrowDown, ArrowUpRight, Component, Award } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Card, Empty, NotConfigured, PageTitle, SignificanceBadge, SourceBadges, Tag, fmtDate, stripMd } from "@/components/ui";
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
      <nav className="mb-3 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.1em]">
        <Link
          href="/"
          className="text-ink-faint underline-offset-2 transition-colors hover:text-ink hover:underline"
        >
          Projects
        </Link>
        <span className="text-rule-strong">/</span>
        <span className="text-ink-soft">{project.name}</span>
      </nav>

      <PageTitle title={project.name} />
      <div className="-mt-6 mb-8 flex flex-wrap items-center gap-2">
        <Tag>{project.status}</Tag>
        {project.started_at && <Tag>since {fmtDate(project.started_at)}</Tag>}
      </div>

      {/* How to read this — top-of-page guide */}
      <div className="mb-12 flex items-start gap-4 bg-paper-sunk px-5 py-4">
        <BookOpen className="lucide mt-0.5 h-5 w-5 shrink-0 text-ink" strokeWidth={1.5} />
        <div>
          <p className="label !text-ink-faint">How to read this</p>
          <p className="mt-1.5 text-[14px] leading-relaxed text-ink-soft">
            This page is the project overview. Scroll to the{" "}
            <a
              href="#entries"
              className="inline-flex items-center gap-1 font-medium text-ink underline underline-offset-2"
            >
              Entries
              <ArrowDown className="lucide h-3.5 w-3.5" strokeWidth={2} />
            </a>{" "}
            section at the bottom: each entry is a decision log of what was built, why it mattered,
            and how it works.
          </p>
        </div>
      </div>

      {project.description && (
        <div className="mb-12">
          <Markdown>{project.description}</Markdown>
        </div>
      )}

      {features && features.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-4 flex items-center gap-2.5 text-[15px] font-semibold uppercase tracking-[0.1em] text-ink">
            <Component className="lucide h-5 w-5 text-ink-soft" strokeWidth={1.5} />
            Features
          </h2>
          <div className="grid gap-px border border-rule bg-rule sm:grid-cols-2">
            {features.map((f) => (
              <Link
                key={f.id}
                href={`/projects/${slug}/${f.slug}`}
                className="group relative bg-paper p-5 transition-colors hover:bg-paper-sunk"
              >
                {/* left accent — grows on hover */}
                <span
                  aria-hidden
                  className="absolute left-0 top-0 h-full w-[3px] origin-top scale-y-0 bg-ink transition-transform duration-300 ease-out group-hover:scale-y-100"
                />
                <div className="flex items-center gap-1.5 font-display text-lg font-medium text-ink transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:underline">
                  {f.name}
                  <ArrowUpRight
                    className="lucide h-4 w-4 -translate-x-1 text-ink-soft opacity-0 transition-all duration-300 ease-out group-hover:translate-x-0 group-hover:opacity-100"
                    strokeWidth={1.5}
                  />
                </div>
                {f.description && (
                  <p className="mt-1 line-clamp-2 text-[16px] text-ink-soft">
                    {stripMd(f.description)}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {achievements && achievements.length > 0 && (
        <section className="mb-12 bg-ink-muted px-5 py-6 sm:px-7 sm:py-7">
          <h2 className="mb-4 flex items-center gap-2.5 text-[15px] font-semibold uppercase tracking-[0.1em] text-paper">
            <Award className="lucide h-5 w-5 text-paper/70" strokeWidth={1.5} />
            Achievements
          </h2>
          <ul className="border-t border-paper/20">
            {achievements.map((a) => (
              <li key={a.id} className="border-b border-paper/15 py-4 last:border-b-0">
                <div className="font-medium text-paper">{a.title}</div>
                {a.impact && (
                  <p className="mt-1 text-[16px] leading-relaxed text-paper/70">
                    {stripMd(a.impact)}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section id="entries" className="scroll-mt-8">
        <h2 className="mb-5 flex items-center gap-2.5 text-[15px] font-semibold uppercase tracking-[0.1em] text-ink">
          <ScrollText className="lucide h-5 w-5 text-ink-soft" strokeWidth={1.5} />
          Entries
        </h2>
        {(!entries || entries.length === 0) && <Empty>No entries yet.</Empty>}
        <div className="space-y-5">
          {entries?.map((e) => {
            const tier = (e.significance ?? "standard") as "landmark" | "notable" | "standard";

            // landmark / notable break out of the row list into a featured card
            if (tier !== "standard") {
              const landmark = tier === "landmark";
              return (
                <Link
                  key={e.id}
                  href={`/entries/${e.id}`}
                  className={`group relative block bg-paper p-6 transition-[border-color,transform] duration-300 ease-out hover:-translate-y-0.5 sm:p-7 ${
                    landmark
                      ? "border-2 border-ink"
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
                    <SignificanceBadge tier={tier} />
                    <span className="text-[13px] uppercase tracking-[0.06em] text-ink-faint">
                      {fmtDate(e.occurred_on)}
                    </span>
                    {e.features?.name && (
                      <span className="label !text-ink-faint">{e.features.name}</span>
                    )}
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
            }

            // standard — the default compact ledger row
            return (
              <article
                key={e.id}
                className="grid grid-cols-[6.5rem_1fr] gap-x-5 border-b border-rule pb-5"
              >
                <div className="pt-0.5 text-[13px] uppercase tracking-[0.06em] text-ink-faint">
                  {fmtDate(e.occurred_on)}
                </div>
                <div className="min-w-0">
                  {e.features?.name && (
                    <div className="label !text-ink-faint">{e.features.name}</div>
                  )}
                  <Link
                    href={`/entries/${e.id}`}
                    className="group mt-0.5 block font-display text-lg font-medium leading-snug text-ink transition-transform duration-300 ease-out hover:-translate-y-0.5"
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
            );
          })}
        </div>
      </section>
    </div>
  );
}
