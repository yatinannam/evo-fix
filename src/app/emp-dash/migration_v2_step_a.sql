-- =============================================================================
-- emp-dash migration v2 — STEP A
-- Run this FIRST in the Supabase SQL Editor and allow it to COMMIT before
-- running step B. Postgres requires the new enum value to be committed in its
-- own transaction before any code that references 'draft' can safely use it.
-- =============================================================================

-- Add 'draft' before 'not_started' in the task_status enum.
-- ALTER TYPE ... ADD VALUE cannot run inside a transaction block in older PG
-- versions; Supabase SQL Editor runs each statement auto-committed, which is
-- exactly what we need here.
ALTER TYPE task_status ADD VALUE IF NOT EXISTS 'draft' BEFORE 'not_started';

-- That's the only change in step A. Commit and then run migration_v2_step_b.sql.
