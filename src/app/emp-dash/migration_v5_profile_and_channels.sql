-- =============================================================================
-- emp-dash migration v5 — profile position field + group channels
-- Run after migration_v4_hardening.sql has committed.
-- Idempotent (ADD COLUMN IF NOT EXISTS / ADD VALUE IF NOT EXISTS).
-- =============================================================================

-- ── 1. Position / job title on profiles ────────────────────────────────────
-- Purely descriptive (e.g. "Senior Backend Engineer") — not used in any
-- permission check. Editable by Admin+ from the People page.

ALTER TABLE emp_profiles
  ADD COLUMN IF NOT EXISTS position text;

-- ── 2. 'group' channel type — named, admin/head-created, not tied to a ────
--       single domain and not a 1:1 DM (e.g. a cross-domain project channel).

ALTER TYPE channel_type ADD VALUE IF NOT EXISTS 'group';

-- Group channel creation goes through a server action using the service-role
-- client (see createGroupChannelAction in actions.ts) after an app-layer
-- permission check (Admin+ or a Domain Head of any domain) — same pattern
-- already used by createProfileAction. No RLS policy change is needed since
-- the existing channels_insert_admin / channel_members_write policies are
-- bypassed by the service-role client; they still correctly block a
-- Domain Head from inserting these rows directly via the browser client.

-- ── Done ─────────────────────────────────────────────────────────────────────
-- Run this file in the Supabase SQL editor for the emp-dash project.
-- NOTE: ALTER TYPE ... ADD VALUE cannot run inside the same transaction as
-- a statement that uses the new value — if your SQL editor wraps the whole
-- file in one transaction and errors on this, run section 2 as its own
-- separate statement/run first, then the rest.
