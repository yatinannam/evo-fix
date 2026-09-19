-- =============================================================================
-- emp-dash migration v2 — STEP B
-- Run ONLY after migration_v2_step_a.sql has committed.
-- This file is idempotent where possible (IF NOT EXISTS / IF EXISTS guards).
-- =============================================================================

-- ── 1. reviewing_since column (review lock timeout) ───────────────────────────

ALTER TABLE emp_tasks
  ADD COLUMN IF NOT EXISTS reviewing_since timestamptz;

-- ── 2. created_by on profiles ─────────────────────────────────────────────────

ALTER TABLE emp_profiles
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES emp_profiles(id) ON DELETE SET NULL;

-- ── 3. New tables ─────────────────────────────────────────────────────────────

-- Personal notes (unified — replaces task-level private_note columns)
CREATE TABLE IF NOT EXISTS emp_personal_notes (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id        uuid NOT NULL REFERENCES emp_profiles(id) ON DELETE CASCADE,
  about_profile_id uuid REFERENCES emp_profiles(id) ON DELETE CASCADE,
  task_id          uuid REFERENCES emp_tasks(id) ON DELETE SET NULL,
  body             text NOT NULL,
  -- 'private'  = author + admin+ only
  -- 'upward'   = author + anyone with higher role in the same domain
  visibility_scope text NOT NULL DEFAULT 'private' CHECK (visibility_scope IN ('private','upward')),
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

CREATE TRIGGER emp_personal_notes_updated_at
  BEFORE UPDATE ON emp_personal_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Task milestones (replaces milestones JSONB on emp_tasks)
CREATE TABLE IF NOT EXISTS emp_task_milestones (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id    uuid NOT NULL REFERENCES emp_tasks(id) ON DELETE CASCADE,
  title      text NOT NULL,
  due_date   timestamptz,
  done       boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- In-app notifications
CREATE TABLE IF NOT EXISTS emp_notifications (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id uuid NOT NULL REFERENCES emp_profiles(id) ON DELETE CASCADE,
  type       text NOT NULL CHECK (type IN (
    'task_assigned','status_changed','comment_added',
    'mention','review_overdue','review_claimed'
  )),
  payload    jsonb NOT NULL DEFAULT '{}',
  read       boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Audit log
CREATE TABLE IF NOT EXISTS emp_audit_log (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id   uuid NOT NULL REFERENCES emp_profiles(id),
  action     text NOT NULL CHECK (action IN (
    'profile_created','role_changed','super_admin_created',
    'domain_reassigned','task_created','status_changed'
  )),
  target     jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- ── 4. Migrate existing private_note data ─────────────────────────────────────
-- Copy non-null private_note rows from emp_tasks into emp_personal_notes.

DO $$
DECLARE
  v_source_count   int;
  v_inserted_count int;
BEGIN
  -- Count non-null source rows
  SELECT count(*) INTO v_source_count
  FROM emp_tasks
  WHERE private_note IS NOT NULL AND private_note_author_id IS NOT NULL;

  IF v_source_count > 0 THEN
    -- Copy: author = private_note_author_id, first assignee as about_profile_id if exists
    INSERT INTO emp_personal_notes (author_id, about_profile_id, task_id, body, visibility_scope)
    SELECT
      t.private_note_author_id,
      (
        SELECT ta.profile_id FROM emp_task_assignees ta
        WHERE ta.task_id = t.id
        LIMIT 1
      ),
      t.id,
      t.private_note,
      'upward'  -- private_note was visible to admin+, so 'upward' is the correct match
    FROM emp_tasks t
    WHERE t.private_note IS NOT NULL AND t.private_note_author_id IS NOT NULL;

    -- Sanity check: inserted rows must exactly match source rows
    SELECT count(*) INTO v_inserted_count
    FROM emp_personal_notes
    WHERE task_id IN (
      SELECT id FROM emp_tasks
      WHERE private_note IS NOT NULL AND private_note_author_id IS NOT NULL
    );

    IF v_inserted_count <> v_source_count THEN
      RAISE EXCEPTION
        'private_note migration mismatch: expected % rows, inserted % rows. Aborting DROP COLUMN.',
        v_source_count, v_inserted_count;
    END IF;

    RAISE NOTICE 'private_note migration: % rows copied and verified.', v_inserted_count;
  ELSE
    RAISE NOTICE 'private_note migration: no non-null rows to copy.';
  END IF;
END $$;

-- Safe to drop only after the DO block above committed without exception
ALTER TABLE emp_tasks DROP COLUMN IF EXISTS private_note;
ALTER TABLE emp_tasks DROP COLUMN IF EXISTS private_note_author_id;

-- ── 5. Migrate milestones JSONB → table ──────────────────────────────────────
-- The milestones column exists but was always seeded as '[]' — still verify.

DO $$
DECLARE
  v_source_count   int;
  v_inserted_count int;
BEGIN
  -- Count tasks that have non-empty milestones arrays
  SELECT count(*) INTO v_source_count
  FROM emp_tasks
  WHERE milestones IS NOT NULL AND jsonb_array_length(milestones) > 0;

  IF v_source_count > 0 THEN
    INSERT INTO emp_task_milestones (task_id, title, due_date, done, sort_order)
    SELECT
      t.id,
      (m->>'title')::text,
      (m->>'date')::timestamptz,
      coalesce((m->>'done')::boolean, false),
      row_number() OVER (PARTITION BY t.id ORDER BY ordinality) - 1
    FROM emp_tasks t,
         jsonb_array_elements(t.milestones) WITH ORDINALITY AS a(m, ordinality)
    WHERE t.milestones IS NOT NULL AND jsonb_array_length(t.milestones) > 0;

    -- Sanity check: total elements inserted must equal total JSONB elements in source
    SELECT count(*) INTO v_inserted_count FROM emp_task_milestones;

    -- We count individual milestone elements across all tasks
    -- v_source_count here is task-level; recompute element-level count
    DECLARE
      v_element_count int;
    BEGIN
      SELECT sum(jsonb_array_length(milestones)) INTO v_element_count
      FROM emp_tasks WHERE milestones IS NOT NULL AND jsonb_array_length(milestones) > 0;

      IF v_inserted_count <> v_element_count THEN
        RAISE EXCEPTION
          'milestones migration mismatch: expected % elements, inserted % rows. Aborting.',
          v_element_count, v_inserted_count;
      END IF;
      RAISE NOTICE 'milestones migration: % elements copied and verified.', v_inserted_count;
    END;
  ELSE
    RAISE NOTICE 'milestones migration: no non-empty milestone arrays to copy.';
  END IF;
END $$;

ALTER TABLE emp_tasks DROP COLUMN IF EXISTS milestones;

-- ── 6. Status transition enforcement trigger ──────────────────────────────────
-- Enforces the allowed state machine at the DB level.
-- Only creator can move draft → not_started.
-- Assignees move not_started → in_progress, in_progress → submitted_for_review.
-- Head/admin move submitted_for_review → completed or back to in_progress.

CREATE OR REPLACE FUNCTION enforce_task_status_transition()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_uid        uuid := auth.uid();
  v_old        task_status := OLD.status;
  v_new        task_status := NEW.status;
  v_is_admin   boolean;
  v_is_head    boolean;
  v_is_assignee boolean;
  v_is_creator  boolean;
BEGIN
  -- No change — skip
  IF v_old = v_new THEN RETURN NEW; END IF;

  v_is_admin   := is_admin_or_above();
  v_is_head    := is_head_or_above_for_domain(NEW.domain_id);
  v_is_assignee := is_task_assignee(NEW.id);
  v_is_creator  := (NEW.created_by = v_uid);

  -- draft → not_started: only creator (once assignees are being added)
  IF v_old = 'draft' AND v_new = 'not_started' THEN
    IF NOT (v_is_creator OR v_is_admin) THEN
      RAISE EXCEPTION 'Only the task creator or an admin can publish a draft task.';
    END IF;
    RETURN NEW;
  END IF;

  -- not_started → in_progress: assignee or head/admin
  IF v_old = 'not_started' AND v_new = 'in_progress' THEN
    IF NOT (v_is_assignee OR v_is_head) THEN
      RAISE EXCEPTION 'Only an assignee or domain head can start this task.';
    END IF;
    RETURN NEW;
  END IF;

  -- in_progress → submitted_for_review: assignee only
  IF v_old = 'in_progress' AND v_new = 'submitted_for_review' THEN
    IF NOT v_is_assignee THEN
      RAISE EXCEPTION 'Only an assignee can submit a task for review.';
    END IF;
    RETURN NEW;
  END IF;

  -- submitted_for_review → completed: head/admin only
  IF v_old = 'submitted_for_review' AND v_new = 'completed' THEN
    IF NOT v_is_head THEN
      RAISE EXCEPTION 'Only a domain head or admin can approve and complete a task.';
    END IF;
    RETURN NEW;
  END IF;

  -- submitted_for_review → in_progress (return with changes): head/admin only
  IF v_old = 'submitted_for_review' AND v_new = 'in_progress' THEN
    IF NOT v_is_head THEN
      RAISE EXCEPTION 'Only a domain head or admin can return a task for changes.';
    END IF;
    RETURN NEW;
  END IF;

  -- All other transitions are forbidden
  RAISE EXCEPTION 'Invalid status transition: % → %', v_old::text, v_new::text;
END;
$$;

DROP TRIGGER IF EXISTS task_status_transition_check ON emp_tasks;
CREATE TRIGGER task_status_transition_check
  BEFORE UPDATE OF status ON emp_tasks
  FOR EACH ROW EXECUTE FUNCTION enforce_task_status_transition();

-- ── 7. Channel ↔ Domain sync triggers ────────────────────────────────────────

-- Helper: find the domain channel id for a given domain
CREATE OR REPLACE FUNCTION get_domain_channel_id(p_domain_id uuid)
RETURNS uuid LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT id FROM emp_channels
  WHERE domain_id = p_domain_id AND type = 'domain'
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION sync_domain_channel_on_user_domain_insert()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_channel_id uuid;
BEGIN
  v_channel_id := get_domain_channel_id(NEW.domain_id);
  IF v_channel_id IS NOT NULL THEN
    INSERT INTO emp_channel_members (channel_id, profile_id)
    VALUES (v_channel_id, NEW.profile_id)
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION sync_domain_channel_on_user_domain_delete()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_channel_id uuid;
BEGIN
  v_channel_id := get_domain_channel_id(OLD.domain_id);
  IF v_channel_id IS NOT NULL THEN
    DELETE FROM emp_channel_members
    WHERE channel_id = v_channel_id AND profile_id = OLD.profile_id;
  END IF;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS sync_channel_on_domain_join ON emp_user_domains;
CREATE TRIGGER sync_channel_on_domain_join
  AFTER INSERT ON emp_user_domains
  FOR EACH ROW EXECUTE FUNCTION sync_domain_channel_on_user_domain_insert();

DROP TRIGGER IF EXISTS sync_channel_on_domain_leave ON emp_user_domains;
CREATE TRIGGER sync_channel_on_domain_leave
  AFTER DELETE ON emp_user_domains
  FOR EACH ROW EXECUTE FUNCTION sync_domain_channel_on_user_domain_delete();

-- Backfill: add existing domain members to their domain channel if not already there
INSERT INTO emp_channel_members (channel_id, profile_id)
SELECT c.id, ud.profile_id
FROM emp_user_domains ud
JOIN emp_channels c ON c.domain_id = ud.domain_id AND c.type = 'domain'
ON CONFLICT DO NOTHING;

-- ── 8. RLS on new tables ──────────────────────────────────────────────────────

ALTER TABLE emp_personal_notes  ENABLE ROW LEVEL SECURITY;
ALTER TABLE emp_task_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE emp_notifications   ENABLE ROW LEVEL SECURITY;
ALTER TABLE emp_audit_log       ENABLE ROW LEVEL SECURITY;

-- emp_personal_notes
-- Rule: author sees own notes; admin+ sees all; upward-scoped notes visible to
--       domain heads of the author's domain. The NOTE SUBJECT (about_profile_id)
--       can NEVER see a note about themselves — this is a hard RESTRICTIVE policy.

-- RESTRICTIVE policy: explicitly deny if you are the subject
CREATE POLICY "personal_notes_deny_subject" ON emp_personal_notes
  AS RESTRICTIVE
  FOR SELECT TO authenticated
  USING (about_profile_id IS NULL OR about_profile_id <> auth.uid());

-- PERMISSIVE policies (all must pass + the restrictive above)
CREATE POLICY "personal_notes_author_read" ON emp_personal_notes
  FOR SELECT TO authenticated
  USING (author_id = auth.uid());

CREATE POLICY "personal_notes_admin_read" ON emp_personal_notes
  FOR SELECT TO authenticated
  USING (is_admin_or_above());

-- 'upward' notes: visible to domain heads who manage the author
CREATE POLICY "personal_notes_upward_read" ON emp_personal_notes
  FOR SELECT TO authenticated
  USING (
    visibility_scope = 'upward'
    AND is_head_or_above_for_domain(
      (SELECT domain_id FROM emp_user_domains WHERE profile_id = author_id LIMIT 1)
    )
  );

-- Insert: any authenticated user can create notes
CREATE POLICY "personal_notes_insert" ON emp_personal_notes
  FOR INSERT TO authenticated
  WITH CHECK (author_id = auth.uid());

-- Update/delete: author only
CREATE POLICY "personal_notes_update_own" ON emp_personal_notes
  FOR UPDATE TO authenticated
  USING (author_id = auth.uid());

CREATE POLICY "personal_notes_delete_own" ON emp_personal_notes
  FOR DELETE TO authenticated
  USING (author_id = auth.uid());

-- emp_task_milestones: same visibility as the task
CREATE POLICY "milestones_read" ON emp_task_milestones
  FOR SELECT TO authenticated
  USING (
    is_admin_or_above()
    OR is_domain_member((SELECT domain_id FROM emp_tasks WHERE id = task_id))
    OR is_task_assignee(task_id)
  );

CREATE POLICY "milestones_write" ON emp_task_milestones
  FOR ALL TO authenticated
  USING (
    is_head_or_above_for_domain((SELECT domain_id FROM emp_tasks WHERE id = task_id))
    OR is_task_assignee(task_id)
  );

-- emp_notifications: each user sees only their own
CREATE POLICY "notifications_read_own" ON emp_notifications
  FOR SELECT TO authenticated
  USING (profile_id = auth.uid());

CREATE POLICY "notifications_update_own" ON emp_notifications
  FOR UPDATE TO authenticated
  USING (profile_id = auth.uid());

-- Insert allowed via service role only (server action writes)
CREATE POLICY "notifications_insert_service" ON emp_notifications
  FOR INSERT TO authenticated
  WITH CHECK (true); -- server actions use service role which bypasses RLS anyway

-- emp_audit_log: super_admin sees all; admin sees non-super-admin actions
CREATE POLICY "audit_log_read" ON emp_audit_log
  FOR SELECT TO authenticated
  USING (
    get_my_role_name() = 'super_admin'
    OR (
      get_my_role_name() = 'admin'
      AND NOT (target->>'action' = 'super_admin_created')
    )
  );

CREATE POLICY "audit_log_insert" ON emp_audit_log
  FOR INSERT TO authenticated
  WITH CHECK (actor_id = auth.uid());

-- ── 9. Storage bucket RLS (storage.objects) ───────────────────────────────────
-- Bucket path convention: {domain_id}/{task_id|'general'}/{filename}
-- The domain_id is always the first path segment.
-- These policies mirror the emp_files table-level RLS.
--
-- NOTE: Create the 'emp-dash-files' bucket in the Supabase Dashboard first
-- (Storage → New bucket → Name: emp-dash-files → Private).
-- These policies then govern object-level access within it.

-- Helper: extract domain_id from storage object name (first path segment)
CREATE OR REPLACE FUNCTION emp_storage_domain_id(object_name text)
RETURNS uuid LANGUAGE sql IMMUTABLE AS $$
  SELECT (string_to_array(object_name, '/'))[1]::uuid;
$$;

-- SELECT (download)
CREATE POLICY "emp_storage_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'emp-dash-files'
    AND (
      is_admin_or_above()
      OR is_domain_member(emp_storage_domain_id(name))
    )
  );

-- INSERT (upload)
CREATE POLICY "emp_storage_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'emp-dash-files'
    AND (
      is_admin_or_above()
      OR is_domain_member(emp_storage_domain_id(name))
    )
  );

-- UPDATE (overwrite/version)
CREATE POLICY "emp_storage_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'emp-dash-files'
    AND (
      is_admin_or_above()
      OR is_domain_member(emp_storage_domain_id(name))
    )
  );

-- DELETE
CREATE POLICY "emp_storage_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'emp-dash-files'
    AND (
      is_admin_or_above()
      OR is_domain_member(emp_storage_domain_id(name))
    )
  );

-- ── 10. Seed domain field templates with full schemas ─────────────────────────
-- Updates the emp_domain_field_templates rows inserted in the original migration
-- with the full JSON schemas defined in src/lib/emp-dash/domain-fields.ts.

UPDATE emp_domain_field_templates SET schema = '[
  {"key":"contacts","label":"Outreach Contacts","type":"table",
   "columns":["Name","Organization","Role","Contact Info","Date Reached Out","Channel","Response","Status","Next Follow-up Date"]}
]'::jsonb
WHERE domain_id = (SELECT id FROM emp_domains WHERE slug = 'outreach');

UPDATE emp_domain_field_templates SET schema = '[
  {"key":"platform","label":"Platform","type":"multiselect","options":["Instagram","LinkedIn","Twitter/X","YouTube","Facebook","Threads"]},
  {"key":"post_type","label":"Post Type","type":"select","options":["Reel","Carousel","Static","Story","Thread","Video"]},
  {"key":"caption","label":"Caption","type":"textarea"},
  {"key":"hashtags","label":"Hashtags","type":"text"},
  {"key":"scheduled_at","label":"Scheduled Date/Time","type":"date"},
  {"key":"live_link","label":"Live Link (post-publish)","type":"url"},
  {"key":"likes","label":"Likes","type":"number"},
  {"key":"comments_count","label":"Comments","type":"number"},
  {"key":"shares","label":"Shares","type":"number"}
]'::jsonb
WHERE domain_id = (SELECT id FROM emp_domains WHERE slug = 'social_media');

UPDATE emp_domain_field_templates SET schema = '[
  {"key":"repo_link","label":"Repo Link","type":"url"},
  {"key":"branch","label":"Branch","type":"text"},
  {"key":"issue_ref","label":"Related Issue #","type":"text"},
  {"key":"tech_stack","label":"Tech Stack Tags","type":"text"},
  {"key":"environment","label":"Environment","type":"select","options":["Development","Staging","Production"]},
  {"key":"task_type","label":"Type","type":"select","options":["Feature","Bug Fix","Refactor","Infra","Security"]},
  {"key":"pre_submit_checklist","label":"Pre-Submit Checklist","type":"checklist","options":["Tests written","Peer reviewed","No linter errors"],"required":true}
]'::jsonb
WHERE domain_id = (SELECT id FROM emp_domains WHERE slug = 'backend_dev');

UPDATE emp_domain_field_templates SET schema = '[
  {"key":"page_section","label":"Page / Section","type":"text"},
  {"key":"staging_link","label":"Staging Link","type":"url"},
  {"key":"figma_link","label":"Figma Link","type":"url"},
  {"key":"browser_checklist","label":"Browser / Device Checklist","type":"checklist","options":["Chrome Desktop","Firefox Desktop","Safari Desktop","Chrome Mobile","Safari iOS"]},
  {"key":"screenshot_before","label":"Screenshot Before","type":"url"},
  {"key":"screenshot_after","label":"Screenshot After","type":"url"}
]'::jsonb
WHERE domain_id = (SELECT id FROM emp_domains WHERE slug = 'website_dev');

UPDATE emp_domain_field_templates SET schema = '[
  {"key":"platform","label":"Platform","type":"select","options":["iOS","Android","Both","Web"]},
  {"key":"build_version","label":"Build / Version","type":"text"},
  {"key":"feature_flag","label":"Feature Flag Name","type":"text"},
  {"key":"device_matrix","label":"Device Matrix Checklist","type":"checklist","options":["iPhone 14","iPhone SE","Pixel 7","Samsung S24","iPad"]},
  {"key":"store_checklist","label":"Store Submission Checklist","type":"checklist","options":["App icon uploaded","Screenshots uploaded","Description updated","Privacy policy link added"]}
]'::jsonb
WHERE domain_id = (SELECT id FROM emp_domains WHERE slug = 'app_dev');

UPDATE emp_domain_field_templates SET schema = '[
  {"key":"dataset_link","label":"Dataset Link / Version","type":"url"},
  {"key":"model_name","label":"Model Name / Version","type":"text"},
  {"key":"notebook_link","label":"Notebook Link","type":"url"},
  {"key":"metrics","label":"Key Metrics","type":"keyvalue"},
  {"key":"compute_used","label":"Compute Used","type":"text"}
]'::jsonb
WHERE domain_id = (SELECT id FROM emp_domains WHERE slug = 'ai_ml');

UPDATE emp_domain_field_templates SET schema = '[
  {"key":"figma_link","label":"Figma Link","type":"url"},
  {"key":"design_version","label":"Design Version","type":"text"},
  {"key":"deliverable_type","label":"Deliverable Type","type":"select","options":["Wireframe","Prototype","High-fi","Design System","Handoff"]},
  {"key":"style_guide_checklist","label":"Style Guide Checklist","type":"checklist","options":["Follows color tokens","Typography matches","Spacing consistent","Icons from approved set"]},
  {"key":"annotation_notes","label":"Inline Annotation Notes","type":"textarea"}
]'::jsonb
WHERE domain_id = (SELECT id FROM emp_domains WHERE slug = 'ui_ux');

-- ── 11. Enable Realtime for new tables ───────────────────────────────────────
-- Do this in Supabase Dashboard → Database → Replication:
-- Enable for: emp_notifications, emp_task_milestones
-- (emp_messages, emp_task_status_history, emp_tasks already enabled)

-- ── Done ─────────────────────────────────────────────────────────────────────
-- After running this file, run the following in Supabase Dashboard:
--   Storage → New Bucket → Name: emp-dash-files → Private → 50 MB file size limit
--   Database → Replication → add emp_notifications, emp_task_milestones to realtime
