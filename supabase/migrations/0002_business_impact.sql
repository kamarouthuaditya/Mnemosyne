-- Business impact: the concrete value of the work — cost saved/added, time saved,
-- revenue, risk reduced. Free text so it can carry figures + currency
-- (e.g. "Placid cost ~$39/mo (~₹4.5k); now self-hosted at $0").
alter table work_entries add column if not exists business_impact text;
