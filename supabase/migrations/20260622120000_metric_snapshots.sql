-- Trend tracking: store periodic metric snapshots so the learning loop can
-- show progress over time (improving / declining / stable).

create table if not exists public.audit_metric_snapshots (
  id uuid primary key default gen_random_uuid(),
  advisor_id text references public.advisor_profiles(clerk_user_id) on delete set null,
  scope text not null default 'own_audits',  -- 'own_audits' or 'all_advisors'
  total_audits integer not null default 0,
  economic_capture_rate numeric,
  validation_rate numeric,
  value_case_rate numeric,
  proposal_rate numeric,
  request_rate numeric,
  price_to_problem_cost_median numeric,
  overall_score integer,
  overall_grade text,
  metrics_json jsonb not null default '{}'::jsonb,
  scores_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_metric_snapshots_created_idx
  on public.audit_metric_snapshots (scope, created_at desc);

create index if not exists audit_metric_snapshots_advisor_idx
  on public.audit_metric_snapshots (advisor_id, created_at desc);

alter table public.audit_metric_snapshots enable row level security;

drop policy if exists "Advisors can read their own metric snapshots" on public.audit_metric_snapshots;
create policy "Advisors can read their own metric snapshots"
on public.audit_metric_snapshots
for select
using (scope = 'all_advisors' or (auth.jwt() ->> 'sub') = advisor_id);
