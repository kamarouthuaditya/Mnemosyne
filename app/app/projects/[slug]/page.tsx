import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, ScrollText, ArrowDown, Component, Award } from "lucide-react";
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
      <nav className="mb-3 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.1em]">
        <Link href="/" className="text-ink-faint transition-colors hover:text-ink">
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
                className="bg-paper p-5 transition-colors hover:bg-paper-sunk"
              >
                <div className="font-display text-lg font-medium text-ink">{f.name}</div>
                {f.description && (
                  <p className="mt-1 line-clamp-2 text-[16px] text-ink-soft">{f.description}</p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {achievements && achievements.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-4 flex items-center gap-2.5 text-[15px] font-semibold uppercase tracking-[0.1em] text-ink">
            <Award className="lucide h-5 w-5 text-ink-soft" strokeWidth={1.5} />
            Achievements
          </h2>
          <ul className="border-t border-rule">
            {achievements.map((a) => (
              <li key={a.id} className="border-b border-rule py-4">
                <div className="font-medium text-ink">{a.title}</div>
                {a.impact && <p className="mt-0.5 text-[16px] text-ink-soft">{a.impact}</p>}
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
                {e.features?.name && (
                  <div className="label !text-ink-faint">{e.features.name}</div>
                )}
                <Link
                  href={`/entries/${e.id}`}
                  className="mt-0.5 block font-display text-lg font-medium leading-snug text-ink hover:underline"
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
      </section>
    </div>
  );
}
