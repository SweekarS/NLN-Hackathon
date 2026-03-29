-- =============================================================================
-- PREREQUISITE: public.profiles must exist first.
--
-- In Supabase → SQL → New query, run the FULL script:
--   mobile/supabase/sql/dashboard_statistics.sql
-- (creates profiles, daily_logs, RLS, and the auth trigger.)
--
-- Then run THIS file in a new query.
-- =============================================================================

do $$
begin
  if not exists (
    select 1
    from information_schema.tables
    where table_schema = 'public' and table_name = 'profiles'
  ) then
    raise exception
      'Table public.profiles does not exist. Run dashboard_statistics.sql first (same folder), then re-run this migration.';
  end if;
end $$;

-- Adds onboarding flag + persisted ritual tasks for returning users.

alter table public.profiles
  add column if not exists has_completed_onboarding boolean not null default false;

alter table public.profiles
  add column if not exists tasks_json jsonb;

comment on column public.profiles.has_completed_onboarding is 'True after user finishes the 5-step onboarding + Gemini flow.';
comment on column public.profiles.tasks_json is 'Last saved daily ritual tasks (4 items) from onboarding/customize.';

-- Optional: mark existing active users as onboarded so they are not forced through quiz again
update public.profiles
set has_completed_onboarding = true
where has_completed_onboarding = false
  and (
    coalesce(total_xp, 0) > 0
    or coalesce(current_streak, 0) > 0
    or exists (select 1 from public.daily_logs dl where dl.user_id = profiles.id)
  );
