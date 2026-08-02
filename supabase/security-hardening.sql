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
