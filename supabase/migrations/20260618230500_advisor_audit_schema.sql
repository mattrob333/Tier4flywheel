create extension if not exists pgcrypto;

create table if not exists public.advisor_profiles (
  clerk_user_id text primary key,
  email text not null,
  name text,
  role text not null default 'advisor',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.advisor_audits (
  id uuid primary key default gen_random_uuid(),
  owner_clerk_user_id text not null references public.advisor_profiles(clerk_user_id) on delete cascade,
  owner_email text not null,
  owner_name text,
  client_name text not null,
  client_url text,
  client_desc text,
  audit_type_key text not null default 'discovery',
  audit_type_name text,
  author_name text,
  research text,
  questions jsonb,
  transcript text,
  report jsonb,
  followup_email text,
  overall_score numeric,
  score_band text,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists advisor_audits_owner_updated_idx
  on public.advisor_audits(owner_clerk_user_id, updated_at desc);

create index if not exists advisor_audits_updated_idx
  on public.advisor_audits(updated_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists advisor_profiles_set_updated_at on public.advisor_profiles;
create trigger advisor_profiles_set_updated_at
before update on public.advisor_profiles
for each row execute function public.set_updated_at();

drop trigger if exists advisor_audits_set_updated_at on public.advisor_audits;
create trigger advisor_audits_set_updated_at
before update on public.advisor_audits
for each row execute function public.set_updated_at();

alter table public.advisor_profiles enable row level security;
alter table public.advisor_audits enable row level security;

drop policy if exists "Advisors can read their own profile" on public.advisor_profiles;
create policy "Advisors can read their own profile"
on public.advisor_profiles
for select
using ((auth.jwt() ->> 'sub') = clerk_user_id);

drop policy if exists "Advisors can read their own audits" on public.advisor_audits;
create policy "Advisors can read their own audits"
on public.advisor_audits
for select
using ((auth.jwt() ->> 'sub') = owner_clerk_user_id);

drop policy if exists "Advisors can insert their own audits" on public.advisor_audits;
create policy "Advisors can insert their own audits"
on public.advisor_audits
for insert
with check ((auth.jwt() ->> 'sub') = owner_clerk_user_id);

drop policy if exists "Advisors can update their own audits" on public.advisor_audits;
create policy "Advisors can update their own audits"
on public.advisor_audits
for update
using ((auth.jwt() ->> 'sub') = owner_clerk_user_id)
with check ((auth.jwt() ->> 'sub') = owner_clerk_user_id);

comment on table public.advisor_audits is
  'Advisor audit records. Superuser visibility is enforced in the server API through AUDIT_SUPERUSER_EMAILS and the Supabase service-role key.';
