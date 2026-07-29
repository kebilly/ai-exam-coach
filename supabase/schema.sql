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

alter table public.user_profiles enable row level security;
alter table public.law_submissions enable row level security;
alter table public.english_exercises enable row level security;
alter table public.usage_logs enable row level security;

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

