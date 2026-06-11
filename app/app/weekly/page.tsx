import { supabase } from "@/lib/supabase";
import { Card, Empty, NotConfigured, PageTitle, fmtDate } from "@/components/ui";
import Markdown from "@/components/Markdown";

export const dynamic = "force-dynamic";

export default async function WeeklyPage() {
  let reports: any[] = [];
  if (supabase) {
    const { data } = await supabase
      .from("weekly_reports")
      .select("*")
      .order("week_start", { ascending: false });
    reports = data ?? [];
  }

  return (
    <div>
      <PageTitle title="Weekly reports" subtitle="What shipped, week by week." />
      <NotConfigured />
      {supabase && reports.length === 0 && (
        <Empty>No weekly reports yet. Run /worklog week.</Empty>
      )}
      <div className="space-y-4">
        {reports.map((r) => (
          <Card key={r.id}>
            <div className="label">
              {fmtDate(r.week_start)} to {fmtDate(r.week_end)}
            </div>
            {r.highlights && r.highlights.length > 0 && (
              <ul className="mt-4 list-disc space-y-1.5 pl-5 text-[16px] text-ink-soft marker:text-ink-faint">
                {r.highlights.map((h: string, i: number) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            )}
            {r.summary && (
              <div className="mt-3">
                <Markdown>{r.summary}</Markdown>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
