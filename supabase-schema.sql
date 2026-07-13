-- ============================================================
-- StudyFlow — Supabase Database Schema
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard
-- ============================================================

-- 0. Users (Synced with auth.users)
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  avatar_url text,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Trigger function to automatically insert new auth users into public.users
create or replace function public.handle_new_user()
returns trigger
security definer
set search_path = public
language plpgsql
as $$
begin
  insert into public.users (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do update
    set email = excluded.email,
        display_name = coalesce(public.users.display_name, excluded.display_name),
        updated_at = now();
  return new;
end;
$$;

-- Trigger definition
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 1. Courses
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  category text,
  color text not null default '#E8734A',
  thumbnail_url text,
  start_date date,
  end_date date,
  position int not null default 0,
  created_at timestamptz not null default now()
);

-- 2. Sections
create table if not exists public.sections (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  position int not null default 0,
  created_at timestamptz not null default now()
);

-- 3. Lessons
create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.sections(id) on delete cascade,
  title text not null,
  duration_minutes int,
  position int not null default 0,
  is_completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

-- 4. Study sessions (for streak tracking)
create table if not exists public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid references public.lessons(id) on delete set null,
  date date not null default current_date,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

alter table public.users enable row level security;
alter table public.courses enable row level security;
alter table public.sections enable row level security;
alter table public.lessons enable row level security;
alter table public.study_sessions enable row level security;

-- Users: anyone can read profiles, but only owner can edit
create policy "users_select" on public.users for select using (true);
create policy "users_insert" on public.users for insert with check (auth.uid() = id);
create policy "users_update" on public.users for update using (auth.uid() = id);

-- Courses: users can only see/manage their own
create policy "courses_select" on public.courses for select using (auth.uid() = user_id);
create policy "courses_insert" on public.courses for insert with check (auth.uid() = user_id);
create policy "courses_update" on public.courses for update using (auth.uid() = user_id);
create policy "courses_delete" on public.courses for delete using (auth.uid() = user_id);

-- Sections: access if they own the parent course
create policy "sections_select" on public.sections for select using (
  exists (select 1 from public.courses c where c.id = course_id and c.user_id = auth.uid())
);
create policy "sections_insert" on public.sections for insert with check (
  exists (select 1 from public.courses c where c.id = course_id and c.user_id = auth.uid())
);
create policy "sections_update" on public.sections for update using (
  exists (select 1 from public.courses c where c.id = course_id and c.user_id = auth.uid())
);
create policy "sections_delete" on public.sections for delete using (
  exists (select 1 from public.courses c where c.id = course_id and c.user_id = auth.uid())
);

-- Lessons: access if they own the parent section's course
create policy "lessons_select" on public.lessons for select using (
  exists (
    select 1 from public.sections s
    join public.courses c on c.id = s.course_id
    where s.id = section_id and c.user_id = auth.uid()
  )
);
create policy "lessons_insert" on public.lessons for insert with check (
  exists (
    select 1 from public.sections s
    join public.courses c on c.id = s.course_id
    where s.id = section_id and c.user_id = auth.uid()
  )
);
create policy "lessons_update" on public.lessons for update using (
  exists (
    select 1 from public.sections s
    join public.courses c on c.id = s.course_id
    where s.id = section_id and c.user_id = auth.uid()
  )
);
create policy "lessons_delete" on public.lessons for delete using (
  exists (
    select 1 from public.sections s
    join public.courses c on c.id = s.course_id
    where s.id = section_id and c.user_id = auth.uid()
  )
);

-- Study sessions
create policy "sessions_select" on public.study_sessions for select using (auth.uid() = user_id);
create policy "sessions_insert" on public.study_sessions for insert with check (auth.uid() = user_id);
create policy "sessions_delete" on public.study_sessions for delete using (auth.uid() = user_id);

-- Avatar storage bucket
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

drop policy if exists "avatars_select" on storage.objects;
drop policy if exists "avatars_insert" on storage.objects;
drop policy if exists "avatars_update" on storage.objects;

create policy "avatars_select" on storage.objects
for select
using (bucket_id = 'avatars');

create policy "avatars_insert" on storage.objects
for insert
with check (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "avatars_update" on storage.objects
for update
using (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);
-- ============================================================
-- Indexes for performance
-- ============================================================
create index if not exists idx_courses_user_id on public.courses(user_id);
create index if not exists idx_sections_course_id on public.sections(course_id);
create index if not exists idx_lessons_section_id on public.lessons(section_id);
create index if not exists idx_sessions_user_date on public.study_sessions(user_id, date);
