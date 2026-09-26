-- migration_v8_files_assignee_access.sql
--
-- Bug: a head/admin can assign any company profile to a task regardless of
-- that profile's domain membership (task-form.tsx offers every profile,
-- unfiltered by domain), and every other task-scoped write already accounts
-- for this — tasks_update, task_comments_insert both check
-- "is_domain_member(...) OR is_task_assignee(id)". files_insert and
-- file_versions_read never got the same assignee exception, so a
-- legitimately assigned employee outside the task's domain can open the
-- task, comment, and move its status, but silently fails to upload a file
-- (files_insert rejects it) and can't view files already on the task
-- (file_versions_read rejects the signed-URL lookup).
--
-- Idempotent — safe to re-run.

drop policy if exists "files_insert" on emp_files;
create policy "files_insert" on emp_files
  for insert to authenticated with check (
    is_domain_member(domain_id)
    or is_admin_or_above()
    or (task_id is not null and is_task_assignee(task_id))
  );

drop policy if exists "file_versions_read" on emp_file_versions;
create policy "file_versions_read" on emp_file_versions
  for select to authenticated using (
    exists (
      select 1 from emp_files f
      where f.id = file_id
        and (
          is_admin_or_above()
          or is_domain_member(f.domain_id)
          or (f.task_id is not null and is_task_assignee(f.task_id))
        )
    )
  );
