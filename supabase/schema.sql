create extension if not exists "pgcrypto";

create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  role text not null default 'user',
  plan text not null default 'free',
  created_at timestamp with time zone not null default now()
);

create table if not exists public.law_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question text not null,
  answer text not null,
  score integer,
  feedback_json jsonb,
  weakness_tags text[],
  confidence text,
  created_at timestamp with time zone not null default now()
);

create table if not exists public.english_exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  level text not null,
  question_type text not null,
  topic text,
  question_json jsonb not null,
  user_answer text,
  correct_answer text,
  explanation text,
  is_correct boolean,
  weakness_tags text[],
  created_at timestamp with time zone not null default now()
);

create table if not exists public.usage_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  action_type text not null,
  created_at timestamp with time zone not null default now()
);

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

alter table public.user_profiles enable row level security;
alter table public.law_submissions enable row level security;
alter table public.english_exercises enable row level security;
alter table public.usage_logs enable row level security;
alter table public.member_invite_codes enable row level security;
alter table public.postal_rule_questions enable row level security;
alter table public.postal_rule_attempts enable row level security;

create policy "Users can read own profile"
  on public.user_profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.user_profiles for update
  using (auth.uid() = id);

create policy "Users can read own law submissions"
  on public.law_submissions for select
  using (auth.uid() = user_id);

create policy "Users can read own english exercises"
  on public.english_exercises for select
  using (auth.uid() = user_id);

create policy "Users can read own usage logs"
  on public.usage_logs for select
  using (auth.uid() = user_id);

create policy "Users can read approved postal questions"
  on public.postal_rule_questions for select
  using (review_status = 'approved');

create policy "Users can read own postal attempts"
  on public.postal_rule_attempts for select
  using (auth.uid() = user_id);

-- Deployment hardening:
-- Authenticated users may update only their own display name through the public API.
-- Never grant direct client-side update access to role or plan; membership activation
-- must go through server routes using the service role key.
revoke update on table public.user_profiles from authenticated;
grant update (display_name) on table public.user_profiles to authenticated;
