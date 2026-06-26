export type ProjectKind = "client" | "internal" | "personal";

export type Project = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  kind: ProjectKind | null;
  why: string | null;
  client: string | null;
  status: string;
  started_at: string | null;
  updated_at: string;
};

export type Feature = {
  id: string;
  project_id: string;
  slug: string;
  name: string;
  description: string | null;
  status: string;
};

export type Significance = "landmark" | "notable" | "standard";

export type WorkEntry = {
  id: string;
  project_id: string;
  feature_id: string | null;
  occurred_on: string;
  title: string;
  summary: string | null;
  significance: Significance;
  source: string[];
  source_ref: string | null;
  files_changed: number | null;
  context: string | null;
  options_considered: string | null;
  decision: string | null;
  rationale: string | null;
  foresight: string | null;
  outcome: string | null;
  business_impact: string | null;
};

export type Achievement = {
  id: string;
  project_id: string;
  feature_id: string | null;
  title: string;
  description: string | null;
  impact: string | null;
  occurred_on: string | null;
  tags: string[];
};

export type WeeklyReport = {
  id: string;
  week_start: string;
  week_end: string | null;
  summary: string | null;
  highlights: string[];
};
