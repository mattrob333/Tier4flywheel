-- Economic Opportunity layer: quantify the cost of the problem and track validation.

create table if not exists public.audit_economic_impacts (
  id uuid primary key default gen_random_uuid(),
  audit_id uuid not null references public.advisor_audits(id) on delete cascade,
  readout_id uuid references public.audit_readouts(id) on delete set null,
  advisor_id text not null references public.advisor_profiles(clerk_user_id) on delete cascade,
  client_name text,
  audit_type_key text,
  source text not null default 'discovery_transcript',
  status text not null default 'estimated',
  currency text default 'USD',
  annual_cost_estimate numeric,
  annual_savings_low numeric,
  annual_savings_high numeric,
  annual_revenue_opportunity numeric,
  payback_months_low numeric,
  payback_months_high numeric,
  confidence text,
  variables jsonb not null default '{}'::jsonb,
  formulas jsonb not null default '{}'::jsonb,
  evidence_quotes jsonb not null default '[]'::jsonb,
  assumptions jsonb not null default '[]'::jsonb,
  missing_inputs jsonb not null default '[]'::jsonb,
  validation_questions jsonb not null default '[]'::jsonb,
  client_validation_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists audit_economic_impacts_audit_id_idx
  on public.audit_economic_impacts (audit_id, updated_at desc);

alter table public.advisor_audits
  add column if not exists economic_impact_status text,
  add column if not exists economic_annual_cost_estimate numeric,
  add column if not exists economic_confidence text,
  add column if not exists economic_validated boolean not null default false,
  add column if not exists economic_summary text;

alter table public.audit_readouts
  add column if not exists economics_discussed boolean not null default false,
  add column if not exists economics_validated boolean not null default false,
  add column if not exists economics_revised boolean not null default false,
  add column if not exists validated_annual_cost numeric,
  add column if not exists revised_annual_cost numeric,
  add column if not exists client_economic_feedback text;

alter table public.audit_proposals
  add column if not exists economic_impact_id uuid,
  add column if not exists includes_value_case boolean not null default false,
  add column if not exists proposal_investment_low numeric,
  add column if not exists proposal_investment_high numeric,
  add column if not exists estimated_payback_months_low numeric,
  add column if not exists estimated_payback_months_high numeric;

alter table public.audit_economic_impacts enable row level security;

drop policy if exists "Advisors can read their own economic impacts" on public.audit_economic_impacts;
create policy "Advisors can read their own economic impacts"
on public.audit_economic_impacts
for select
using ((auth.jwt() ->> 'sub') = advisor_id);

drop policy if exists "Advisors can insert their own economic impacts" on public.audit_economic_impacts;
create policy "Advisors can insert their own economic impacts"
on public.audit_economic_impacts
for insert
with check ((auth.jwt() ->> 'sub') = advisor_id);

drop policy if exists "Advisors can update their own economic impacts" on public.audit_economic_impacts;
create policy "Advisors can update their own economic impacts"
on public.audit_economic_impacts
for update
using ((auth.jwt() ->> 'sub') = advisor_id)
with check ((auth.jwt() ->> 'sub') = advisor_id);
