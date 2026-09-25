-- =============================================================================
-- emp-dash migration v4 — HARDENING
-- Run after migration_v3_indexes.sql has committed.
-- Idempotent (CREATE OR REPLACE / DROP TRIGGER IF EXISTS / ADD COLUMN IF NOT EXISTS).
-- =============================================================================

-- ── 1. Close self-privilege-escalation hole on emp_profiles.role_id ───────────
-- profiles_update_own_or_admin (migration.sql) has no WITH CHECK, so Postgres
-- reuses the USING clause as the check on the NEW row — which never
-- re-validates role_id. Any authenticated user can currently self-promote via
-- a direct client update. This trigger closes that at the DB level regardless
-- of which RLS branch let the UPDATE through.

CREATE OR REPLACE FUNCTION enforce_profile_role_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.role_id IS DISTINCT FROM OLD.role_id THEN
    IF NOT is_admin_or_above() THEN
      RAISE EXCEPTION 'Only an Admin or Super Admin can change a profile''s role.';
    END IF;
    IF NEW.id = auth.uid() THEN
      RAISE EXCEPTION 'You cannot change your own role.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profile_role_change_check ON emp_profiles;
CREATE TRIGGER profile_role_change_check
  BEFORE UPDATE OF role_id ON emp_profiles
  FOR EACH ROW EXECUTE FUNCTION enforce_profile_role_change();

-- ── 2. status_change_comment scratch column ────────────────────────────────
-- Carries the "reason for returning a task" comment into the same UPDATE
-- statement that changes emp_tasks.status, so the trigger below can validate
-- and log it atomically — not bypassable via a raw client update that skips
-- the server action's app-layer comment check.

ALTER TABLE emp_tasks
  ADD COLUMN IF NOT EXISTS status_change_comment text;

-- ── 3. Extend enforce_task_status_transition: DB-level WHAT-checks + the ──────
--       sole writer of emp_task_status_history (closes the app-layer-only
--       bypass on the Backend Dev checklist gate and the mandatory-comment-
--       on-return rule; previously only the WHO-can-transition rules were
--       enforced here, and history was written by a separate, skippable
--       INSERT in actions.ts).

CREATE OR REPLACE FUNCTION enforce_task_status_transition()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_uid         uuid := auth.uid();
  v_old         task_status := OLD.status;
  v_new         task_status := NEW.status;
  v_is_admin    boolean;
  v_is_head     boolean;
  v_is_assignee boolean;
  v_is_creator  boolean;
  v_domain_slug text;
  v_required    text[] := ARRAY['Tests written','Peer reviewed','No linter errors'];
  v_checked     text[];
BEGIN
  IF v_old = v_new THEN RETURN NEW; END IF;

  v_is_admin    := is_admin_or_above();
  v_is_head     := is_head_or_above_for_domain(NEW.domain_id);
  v_is_assignee := is_task_assignee(NEW.id);
  v_is_creator  := (NEW.created_by = v_uid);

  IF v_old = 'draft' AND v_new = 'not_started' THEN
    IF NOT (v_is_creator OR v_is_admin) THEN
      RAISE EXCEPTION 'Only the task creator or an admin can publish a draft task.';
    END IF;

  ELSIF v_old = 'not_started' AND v_new = 'in_progress' THEN
    IF NOT (v_is_assignee OR v_is_head) THEN
      RAISE EXCEPTION 'Only an assignee or domain head can start this task.';
    END IF;

  ELSIF v_old = 'in_progress' AND v_new = 'submitted_for_review' THEN
    IF NOT v_is_assignee THEN
      RAISE EXCEPTION 'Only an assignee can submit a task for review.';
    END IF;

    -- WHAT-check: backend_dev pre-submit checklist. Hardcoded to match the
    -- same three items src/lib/emp-dash/domain-fields.ts already hardcodes
    -- for backendChecklistComplete() (app-layer check) — the field template
    -- in the DB is not the source of truth for this list today, so this
    -- keeps DB-layer and app-layer consistent with each other.
    SELECT slug INTO v_domain_slug FROM emp_domains WHERE id = NEW.domain_id;
    IF v_domain_slug = 'backend_dev' THEN
      SELECT array_agg(value) INTO v_checked
      FROM jsonb_array_elements_text(coalesce(NEW.custom_fields->'pre_submit_checklist', '[]'::jsonb));
      IF NOT (v_required <@ coalesce(v_checked, ARRAY[]::text[])) THEN
        RAISE EXCEPTION 'Complete the pre-submit checklist (%) before submitting for review.', array_to_string(v_required, ', ');
      END IF;
    END IF;

  ELSIF v_old = 'submitted_for_review' AND v_new = 'completed' THEN
    IF NOT v_is_head THEN
      RAISE EXCEPTION 'Only a domain head or admin can approve and complete a task.';
    END IF;

  ELSIF v_old = 'submitted_for_review' AND v_new = 'in_progress' THEN
    IF NOT v_is_head THEN
      RAISE EXCEPTION 'Only a domain head or admin can return a task for changes.';
    END IF;
    -- WHAT-check: comment is mandatory on return
    IF NEW.status_change_comment IS NULL OR btrim(NEW.status_change_comment) = '' THEN
      RAISE EXCEPTION 'A comment explaining the required changes is mandatory when returning a task.';
    END IF;

  ELSE
    RAISE EXCEPTION 'Invalid status transition: % → %', v_old::text, v_new::text;
  END IF;

  -- Atomic, non-bypassable history write + scratch-column reset (every branch)
  INSERT INTO emp_task_status_history (task_id, changed_by, from_status, to_status, comment)
  VALUES (NEW.id, v_uid, v_old, v_new, NEW.status_change_comment);
  NEW.status_change_comment := NULL;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS task_status_transition_check ON emp_tasks;
CREATE TRIGGER task_status_transition_check
  BEFORE UPDATE OF status ON emp_tasks
  FOR EACH ROW EXECUTE FUNCTION enforce_task_status_transition();

-- ── 4. Close emp_notifications insert hole ─────────────────────────────────
-- notifications_insert_service (migration_v2_step_b.sql) is WITH CHECK (true)
-- with a comment claiming server actions use the service-role client — but
-- writeNotification() in actions.ts actually used the anon-key client, so any
-- authenticated user could insert a notification row impersonating anyone.
-- Fixed in actions.ts (this same pass) to use the admin client; this policy
-- change makes the client-side hole actually closed rather than theoretical.

DROP POLICY IF EXISTS "notifications_insert_service" ON emp_notifications;
CREATE POLICY "notifications_insert_deny_client" ON emp_notifications
  FOR INSERT TO authenticated
  WITH CHECK (false);

-- ── Done ─────────────────────────────────────────────────────────────────────
-- Run this file in the Supabase SQL editor for the emp-dash project.
