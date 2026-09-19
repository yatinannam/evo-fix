-- =============================================================================
-- emp-dash initial migration
-- Run this on your dedicated emp-dash Supabase project.
-- =============================================================================

-- ── Extensions ────────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── Enum types ────────────────────────────────────────────────────────────────
create type task_status   as enum ('not_started','in_progress','submitted_for_review','completed');
create type role_name     as enum ('super_admin','admin','domain_head','employee');
create type role_in_domain as enum ('head','member');
create type channel_type  as enum ('domain','dm');
create type priority      as enum ('low','medium','high','urgent');

-- ── Core tables ───────────────────────────────────────────────────────────────

create table emp_roles (
  id         uuid primary key default uuid_generate_v4(),
  name       role_name unique not null,
  created_at timestamptz default now()
);

-- Seed roles
insert into emp_roles (name) values ('super_admin'),('admin'),('domain_head'),('employee');

create table emp_profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text not null,
  email      text not null unique,
  avatar_url text,
  role_id    uuid not null references emp_roles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger emp_profiles_updated_at before update on emp_profiles
  for each row execute function update_updated_at();

create table emp_domains (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  slug       text not null unique,
  created_at timestamptz default now()
);

-- Seed 7 domains
insert into emp_domains (name, slug) values
  ('Outreach',            'outreach'),
  ('Social Media',        'social_media'),
  ('Backend Development', 'backend_dev'),
  ('Website Development', 'website_dev'),
  ('App Development',     'app_dev'),
  ('AI / ML',             'ai_ml'),
  ('UI / UX',             'ui_ux');

-- Domain → Admin ownership (editable from admin UI, never hardcoded in app)
create table emp_domain_admin_map (
  id               uuid primary key default uuid_generate_v4(),
  domain_id        uuid not null references emp_domains(id) on delete cascade,
  admin_profile_id uuid not null references emp_profiles(id) on delete cascade,
  created_at       timestamptz default now(),
  unique (domain_id, admin_profile_id)
);

-- Profile ↔ Domain membership with per-domain role (many-to-many)
create table emp_user_domains (
  id              uuid primary key default uuid_generate_v4(),
  profile_id      uuid not null references emp_profiles(id) on delete cascade,
  domain_id       uuid not null references emp_domains(id) on delete cascade,
  role_in_domain  role_in_domain not null default 'member',
  created_at      timestamptz default now(),
  unique (profile_id, domain_id)
);

-- Domain field templates (seeded, admin-editable)
create table emp_domain_field_templates (
  id         uuid primary key default uuid_generate_v4(),
  domain_id  uuid not null references emp_domains(id) on delete cascade unique,
  schema     jsonb not null default '[]',
  updated_by uuid references emp_profiles(id),
  updated_at timestamptz default now()
);

-- ── Task tables ───────────────────────────────────────────────────────────────

create table emp_tasks (
  id                     uuid primary key default uuid_generate_v4(),
  title                  text not null,
  description            text,
  domain_id              uuid not null references emp_domains(id),
  priority               priority not null default 'medium',
  status                 task_status not null default 'not_started',
  deadline               timestamptz,
  tags                   text[] not null default '{}',
  links                  jsonb not null default '[]',
  milestones             jsonb not null default '[]',
  custom_fields          jsonb not null default '{}',
  private_note           text,
  private_note_author_id uuid references emp_profiles(id),
  reviewing_by           uuid references emp_profiles(id),
  created_by             uuid not null references emp_profiles(id),
  created_at             timestamptz default now(),
  updated_at             timestamptz default now()
);

create trigger emp_tasks_updated_at before update on emp_tasks
  for each row execute function update_updated_at();

create table emp_task_assignees (
  task_id     uuid not null references emp_tasks(id) on delete cascade,
  profile_id  uuid not null references emp_profiles(id) on delete cascade,
  assigned_by uuid not null references emp_profiles(id),
  created_at  timestamptz default now(),
  primary key (task_id, profile_id)
);

create table emp_task_status_history (
  id          uuid primary key default uuid_generate_v4(),
  task_id     uuid not null references emp_tasks(id) on delete cascade,
  changed_by  uuid not null references emp_profiles(id),
  from_status task_status,
  to_status   task_status not null,
  comment     text,
  created_at  timestamptz default now()
);

-- ── File tables ───────────────────────────────────────────────────────────────

create table emp_files (
  id           uuid primary key default uuid_generate_v4(),
  task_id      uuid references emp_tasks(id) on delete cascade,
  domain_id    uuid not null references emp_domains(id),
  filename     text not null,
  storage_path text not null,
  mime_type    text,
  size_bytes   bigint,
  uploaded_by  uuid not null references emp_profiles(id),
  created_at   timestamptz default now()
);

create table emp_file_versions (
  id          uuid primary key default uuid_generate_v4(),
  file_id     uuid not null references emp_files(id) on delete cascade,
  version     int not null default 1,
  storage_url text not null,
  uploaded_by uuid not null references emp_profiles(id),
  created_at  timestamptz default now()
);

-- ── Communication tables ──────────────────────────────────────────────────────

create table emp_channels (
  id         uuid primary key default uuid_generate_v4(),
  domain_id  uuid references emp_domains(id) on delete cascade,
  type       channel_type not null,
  name       text,
  created_at timestamptz default now()
);

create table emp_channel_members (
  channel_id uuid not null references emp_channels(id) on delete cascade,
  profile_id uuid not null references emp_profiles(id) on delete cascade,
  joined_at  timestamptz default now(),
  primary key (channel_id, profile_id)
);

create table emp_messages (
  id          uuid primary key default uuid_generate_v4(),
  channel_id  uuid not null references emp_channels(id) on delete cascade,
  sender_id   uuid not null references emp_profiles(id),
  body        text not null,
  attachments jsonb not null default '[]',
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create trigger emp_messages_updated_at before update on emp_messages
  for each row execute function update_updated_at();

create table emp_task_comments (
  id          uuid primary key default uuid_generate_v4(),
  task_id     uuid not null references emp_tasks(id) on delete cascade,
  author_id   uuid not null references emp_profiles(id),
  body        text not null,
  attachments jsonb not null default '[]',
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create trigger emp_task_comments_updated_at before update on emp_task_comments
  for each row execute function update_updated_at();

-- ── Helper functions (used by RLS policies) ───────────────────────────────────

-- Returns the role name for the current authenticated user
create or replace function get_my_role_name()
returns role_name language sql security definer stable as $$
  select r.name from emp_profiles p
  join emp_roles r on r.id = p.role_id
  where p.id = auth.uid()
$$;

-- Returns true if the current user has at least 'admin' rank
create or replace function is_admin_or_above()
returns boolean language sql security definer stable as $$
  select get_my_role_name() in ('admin','super_admin')
$$;

-- Returns true if the current user is domain head or admin+ for a given domain
create or replace function is_head_or_above_for_domain(p_domain_id uuid)
returns boolean language sql security definer stable as $$
  select is_admin_or_above()
  or exists (
    select 1 from emp_user_domains
    where profile_id = auth.uid()
      and domain_id = p_domain_id
      and role_in_domain = 'head'
  )
$$;

-- Returns true if current user is a member of the given domain
create or replace function is_domain_member(p_domain_id uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from emp_user_domains
    where profile_id = auth.uid() and domain_id = p_domain_id
  )
$$;

-- Returns true if current user is assigned to a given task
create or replace function is_task_assignee(p_task_id uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from emp_task_assignees
    where task_id = p_task_id and profile_id = auth.uid()
  )
$$;

-- ── Enable RLS on all tables ──────────────────────────────────────────────────

alter table emp_roles                  enable row level security;
alter table emp_profiles               enable row level security;
alter table emp_domains                enable row level security;
alter table emp_domain_admin_map       enable row level security;
alter table emp_user_domains           enable row level security;
alter table emp_domain_field_templates enable row level security;
alter table emp_tasks                  enable row level security;
alter table emp_task_assignees         enable row level security;
alter table emp_task_status_history    enable row level security;
alter table emp_files                  enable row level security;
alter table emp_file_versions          enable row level security;
alter table emp_channels               enable row level security;
alter table emp_channel_members        enable row level security;
alter table emp_messages               enable row level security;
alter table emp_task_comments          enable row level security;

-- ── RLS Policies ─────────────────────────────────────────────────────────────

-- emp_roles: all authenticated users can read
create policy "roles_read_authenticated" on emp_roles
  for select to authenticated using (true);

-- emp_profiles: all authenticated users can read (directory view)
create policy "profiles_read_authenticated" on emp_profiles
  for select to authenticated using (true);

-- Only admin+ can insert profiles
create policy "profiles_insert_admin" on emp_profiles
  for insert to authenticated with check (is_admin_or_above());

-- Users can update their own profile; admin+ can update anyone's
create policy "profiles_update_own_or_admin" on emp_profiles
  for update to authenticated using (
    id = auth.uid() or is_admin_or_above()
  );

-- emp_domains: all authenticated
create policy "domains_read_authenticated" on emp_domains
  for select to authenticated using (true);

-- emp_domain_admin_map: all authenticated can read; only super_admin can write
create policy "domain_admin_map_read" on emp_domain_admin_map
  for select to authenticated using (true);
create policy "domain_admin_map_write_superadmin" on emp_domain_admin_map
  for all to authenticated using (get_my_role_name() = 'super_admin');

-- emp_user_domains: all authenticated can read
create policy "user_domains_read" on emp_user_domains
  for select to authenticated using (true);
create policy "user_domains_write_admin" on emp_user_domains
  for all to authenticated using (is_admin_or_above());

-- emp_domain_field_templates: readable by all; writable by head+ of that domain
create policy "field_templates_read" on emp_domain_field_templates
  for select to authenticated using (true);
create policy "field_templates_write" on emp_domain_field_templates
  for all to authenticated using (is_head_or_above_for_domain(domain_id));

-- emp_tasks: assignees + domain members + head/admin can read
create policy "tasks_read" on emp_tasks
  for select to authenticated using (
    get_my_role_name() = 'super_admin'
    or is_admin_or_above()
    or is_domain_member(domain_id)
    or is_task_assignee(id)
  );

-- Only admin+ or domain head can create tasks
create policy "tasks_insert" on emp_tasks
  for insert to authenticated with check (
    is_head_or_above_for_domain(domain_id)
  );

-- Assignees can update their task fields; head/admin can update everything
create policy "tasks_update" on emp_tasks
  for update to authenticated using (
    is_head_or_above_for_domain(domain_id)
    or is_task_assignee(id)
  );

-- private_note: column-level security via a view would be ideal, but we use
-- a strict policy: only author and admin+ can see private_note by convention
-- (RLS can't mask individual columns in PostgreSQL; enforce in app layer + service role for reads,
-- and the private_note_author_id makes it queryable server-side).

-- emp_task_assignees
create policy "task_assignees_read" on emp_task_assignees
  for select to authenticated using (
    is_admin_or_above()
    or is_domain_member((select domain_id from emp_tasks where id = task_id))
    or profile_id = auth.uid()
    or is_task_assignee(task_id)
  );
create policy "task_assignees_write" on emp_task_assignees
  for all to authenticated using (
    is_head_or_above_for_domain((select domain_id from emp_tasks where id = task_id))
  );

-- emp_task_status_history
create policy "task_history_read" on emp_task_status_history
  for select to authenticated using (
    is_admin_or_above()
    or is_domain_member((select domain_id from emp_tasks where id = task_id))
    or is_task_assignee(task_id)
  );
create policy "task_history_insert" on emp_task_status_history
  for insert to authenticated with check (changed_by = auth.uid());

-- emp_files
create policy "files_read" on emp_files
  for select to authenticated using (
    is_admin_or_above()
    or is_domain_member(domain_id)
    or (task_id is not null and is_task_assignee(task_id))
  );
create policy "files_insert" on emp_files
  for insert to authenticated with check (
    is_domain_member(domain_id)
    or is_admin_or_above()
  );

-- emp_file_versions
create policy "file_versions_read" on emp_file_versions
  for select to authenticated using (
    exists (
      select 1 from emp_files f
      where f.id = file_id
        and (is_admin_or_above() or is_domain_member(f.domain_id))
    )
  );
create policy "file_versions_insert" on emp_file_versions
  for insert to authenticated with check (uploaded_by = auth.uid());

-- emp_channels
create policy "channels_read" on emp_channels
  for select to authenticated using (
    get_my_role_name() = 'super_admin'
    or domain_id is null  -- DMs — participation checked via channel_members
    or is_domain_member(domain_id)
  );
create policy "channels_insert_admin" on emp_channels
  for insert to authenticated with check (is_admin_or_above());

-- emp_channel_members
create policy "channel_members_read" on emp_channel_members
  for select to authenticated using (
    profile_id = auth.uid() or is_admin_or_above()
  );
create policy "channel_members_write" on emp_channel_members
  for all to authenticated using (is_admin_or_above());

-- emp_messages: members of the channel only
create policy "messages_read" on emp_messages
  for select to authenticated using (
    exists (
      select 1 from emp_channel_members
      where channel_id = emp_messages.channel_id and profile_id = auth.uid()
    )
    or is_admin_or_above()
  );
create policy "messages_insert" on emp_messages
  for insert to authenticated with check (
    sender_id = auth.uid()
    and exists (
      select 1 from emp_channel_members
      where channel_id = emp_messages.channel_id and profile_id = auth.uid()
    )
  );
create policy "messages_update_own" on emp_messages
  for update to authenticated using (sender_id = auth.uid());

-- emp_task_comments
create policy "task_comments_read" on emp_task_comments
  for select to authenticated using (
    is_admin_or_above()
    or is_domain_member((select domain_id from emp_tasks where id = task_id))
    or is_task_assignee(task_id)
  );
create policy "task_comments_insert" on emp_task_comments
  for insert to authenticated with check (
    author_id = auth.uid()
    and (
      is_admin_or_above()
      or is_domain_member((select domain_id from emp_tasks where id = task_id))
      or is_task_assignee(task_id)
    )
  );
create policy "task_comments_update_own" on emp_task_comments
  for update to authenticated using (author_id = auth.uid());

-- ── Seed domain field templates ───────────────────────────────────────────────
-- Run after emp_domain_field_templates table is created and domains are seeded.
-- The JSON matches the defaults in src/lib/emp-dash/domain-fields.ts

insert into emp_domain_field_templates (domain_id, schema)
select id, '[]'::jsonb from emp_domains;

-- ── Storage bucket ────────────────────────────────────────────────────────────
-- Create in Supabase Dashboard → Storage → "emp-dash-files", set to private.
-- Path convention: {domain_slug}/{task_id}/{filename}  or  {domain_slug}/general/{filename}

-- ── Realtime ──────────────────────────────────────────────────────────────────
-- Enable Realtime for: emp_messages, emp_task_status_history, emp_tasks
-- In Supabase Dashboard → Database → Replication → enable for those tables.
