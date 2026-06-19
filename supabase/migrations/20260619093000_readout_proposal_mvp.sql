alter table public.advisor_audits
  add column if not exists current_stage text,
  add column if not exists readout_status text,
  add column if not exists proposal_status text,
  add column if not exists selected_next_step text,
  add column if not exists client_interest_level text,
  add column if not exists client_agreement_level text,
  add column if not exists proposal_requested boolean not null default false,
  add column if not exists prd_requested boolean not null default false,
  add column if not exists pedigree_demo_discussed boolean not null default false,
  add column if not exists geo_package_discussed boolean not null default false,
  add column if not exists budget_discussed boolean not null default false,
  add column if not exists decision_maker_identified boolean not null default false,
  add column if not exists timeline_discussed boolean not null default false;

update public.advisor_audits
set current_stage = coalesce(current_stage, status)
where current_stage is null;

create table if not exists public.audit_readouts (
  id uuid primary key default gen_random_uuid(),
  audit_id uuid not null references public.advisor_audits(id) on delete cascade,
  advisor_id text not null references public.advisor_profiles(clerk_user_id) on delete cascade,
  client_name text,
  readout_guide_json jsonb,
  readout_guide_text text,
  readout_transcript_text text,
  advisor_notes text,
  readout_call_date date,
  participants text,
  client_agreement_level text,
  client_interest_level text,
  selected_next_step text,
  proposal_requested boolean not null default false,
  prd_requested boolean not null default false,
  geo_package_discussed boolean not null default false,
  pedigree_demo_discussed boolean not null default false,
  budget_discussed boolean not null default false,
  decision_maker_identified boolean not null default false,
  timeline_discussed boolean not null default false,
  objections jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_proposals (
  id uuid primary key default gen_random_uuid(),
  audit_id uuid not null references public.advisor_audits(id) on delete cascade,
  readout_id uuid references public.audit_readouts(id) on delete set null,
  advisor_id text not null references public.advisor_profiles(clerk_user_id) on delete cascade,
  proposal_type text,
  proposal_title text,
  proposal_json jsonb,
  proposal_text text,
  proposal_status text not null default 'draft',
  selected_recommendations jsonb not null default '[]'::jsonb,
  estimated_value text,
  pricing_notes text,
  generated_from_prompt_version text,
  generated_model text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists audit_readouts_audit_updated_idx
  on public.audit_readouts(audit_id, updated_at desc);

create index if not exists audit_proposals_audit_updated_idx
  on public.audit_proposals(audit_id, updated_at desc);

drop trigger if exists audit_readouts_set_updated_at on public.audit_readouts;
create trigger audit_readouts_set_updated_at
before update on public.audit_readouts
for each row execute function public.set_updated_at();

drop trigger if exists audit_proposals_set_updated_at on public.audit_proposals;
create trigger audit_proposals_set_updated_at
before update on public.audit_proposals
for each row execute function public.set_updated_at();

alter table public.audit_readouts enable row level security;
alter table public.audit_proposals enable row level security;

drop policy if exists "Advisors can read their own readouts" on public.audit_readouts;
create policy "Advisors can read their own readouts"
on public.audit_readouts
for select
using ((auth.jwt() ->> 'sub') = advisor_id);

drop policy if exists "Advisors can insert their own readouts" on public.audit_readouts;
create policy "Advisors can insert their own readouts"
on public.audit_readouts
for insert
with check ((auth.jwt() ->> 'sub') = advisor_id);

drop policy if exists "Advisors can update their own readouts" on public.audit_readouts;
create policy "Advisors can update their own readouts"
on public.audit_readouts
for update
using ((auth.jwt() ->> 'sub') = advisor_id)
with check ((auth.jwt() ->> 'sub') = advisor_id);

drop policy if exists "Advisors can read their own proposals" on public.audit_proposals;
create policy "Advisors can read their own proposals"
on public.audit_proposals
for select
using ((auth.jwt() ->> 'sub') = advisor_id);

drop policy if exists "Advisors can insert their own proposals" on public.audit_proposals;
create policy "Advisors can insert their own proposals"
on public.audit_proposals
for insert
with check ((auth.jwt() ->> 'sub') = advisor_id);

drop policy if exists "Advisors can update their own proposals" on public.audit_proposals;
create policy "Advisors can update their own proposals"
on public.audit_proposals
for update
using ((auth.jwt() ->> 'sub') = advisor_id)
with check ((auth.jwt() ->> 'sub') = advisor_id);
