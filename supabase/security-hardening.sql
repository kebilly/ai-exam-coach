-- Run this in Supabase SQL Editor before production deployment.
-- It prevents browser clients using the anon/authenticated key from changing
-- membership or admin fields directly.

revoke update on table public.user_profiles from authenticated;
grant update (display_name) on table public.user_profiles to authenticated;

-- Keep normal read access for the owner. Service-role server routes still bypass
-- RLS and can update plan/role when needed.
grant select on table public.user_profiles to authenticated;

create table if not exists public.member_invite_codes (
  id uuid primary key default gen_random_uuid(),
  code_hash text not null unique,
  label text,
  active boolean not null default true,
  max_uses integer not null default 1,
  used_count integer not null default 0,
  used_by uuid[] not null default '{}',
  expires_at timestamp with time zone,
  created_at timestamp with time zone not null default now()
);

alter table public.member_invite_codes enable row level security;

-- Invite codes must never be readable or writable from browser clients.
-- Server routes use the service_role key to generate, toggle, and redeem codes.
revoke all on table public.member_invite_codes from anon, authenticated;
grant select, insert, update on table public.member_invite_codes to service_role;

create table if not exists public.postal_rule_questions (
  id uuid primary key default gen_random_uuid(),
  career_level text not null,
  question_format text not null,
  law_area text not null,
  difficulty integer not null default 2,
  question text not null,
  options jsonb,
  answer text not null,
  explanation text not null,
  source_articles jsonb not null default '[]'::jsonb,
  tags text[] not null default '{}',
  source_type text not null default 'ai_generated_pending_review',
  review_status text not null default 'pending',
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone not null default now()
);

create table if not exists public.postal_rule_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  career_level text not null,
  question_ids uuid[] not null default '{}',
  exam_json jsonb not null,
  user_answers jsonb,
  score integer,
  correct_count integer,
  total_questions integer,
  created_at timestamp with time zone not null default now()
);

alter table public.postal_rule_questions enable row level security;
alter table public.postal_rule_attempts enable row level security;

revoke all on table public.postal_rule_questions from anon, authenticated;
revoke all on table public.postal_rule_attempts from anon, authenticated;

grant select, insert, update, delete on table public.postal_rule_questions to service_role;
grant select, insert, update, delete on table public.postal_rule_attempts to service_role;
