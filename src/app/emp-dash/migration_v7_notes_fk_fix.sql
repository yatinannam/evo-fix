-- =============================================================================
-- emp-dash migration v7 — personal notes FK consistency fix
-- Run after migration_v6_security_hardening.sql has committed.
-- =============================================================================

-- emp_personal_notes.about_profile_id was ON DELETE CASCADE — deleting a
-- profile silently destroys every note ever written *about* that person,
-- including notes an admin may have relied on for accountability. task_id
-- is correctly ON DELETE SET NULL (deleting a task just detaches the note,
-- doesn't erase it) — about_profile_id should behave the same way.

ALTER TABLE emp_personal_notes
  DROP CONSTRAINT IF EXISTS emp_personal_notes_about_profile_id_fkey;

ALTER TABLE emp_personal_notes
  ADD CONSTRAINT emp_personal_notes_about_profile_id_fkey
  FOREIGN KEY (about_profile_id) REFERENCES emp_profiles(id) ON DELETE SET NULL;

-- ── Done ─────────────────────────────────────────────────────────────────────
-- Run this file in the Supabase SQL editor for the emp-dash project.
