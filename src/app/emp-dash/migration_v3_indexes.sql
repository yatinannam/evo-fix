-- Employee Dashboard: Add missing indexes for RLS policies
-- Note: 'CREATE INDEX IF NOT EXISTS' is safe to run multiple times.

-- 1. Index on emp_tasks.domain_id 
-- Used heavily by domain-based visibility policies on tasks
CREATE INDEX IF NOT EXISTS idx_emp_tasks_domain_id ON public.emp_tasks(domain_id);

-- 2. Indexes on emp_user_domains
-- Used to check what domains a user belongs to (e.g., tasks visibility)
CREATE INDEX IF NOT EXISTS idx_emp_user_domains_profile_id ON public.emp_user_domains(profile_id);
CREATE INDEX IF NOT EXISTS idx_emp_user_domains_domain_id ON public.emp_user_domains(domain_id);

-- 3. Indexes on emp_task_assignees
-- Used to check what tasks are assigned to a user
CREATE INDEX IF NOT EXISTS idx_emp_task_assignees_task_id ON public.emp_task_assignees(task_id);
CREATE INDEX IF NOT EXISTS idx_emp_task_assignees_profile_id ON public.emp_task_assignees(profile_id);

-- 4. Indexes on emp_channel_members
-- Used heavily for messages visibility (can user see this channel?)
CREATE INDEX IF NOT EXISTS idx_emp_channel_members_channel_id ON public.emp_channel_members(channel_id);
CREATE INDEX IF NOT EXISTS idx_emp_channel_members_profile_id ON public.emp_channel_members(profile_id);

-- 5. Indexes on emp_messages
-- Used to fetch messages for an active channel efficiently
CREATE INDEX IF NOT EXISTS idx_emp_messages_channel_id ON public.emp_messages(channel_id);

-- 6. Indexes on emp_notifications
-- Used for the notification bell
CREATE INDEX IF NOT EXISTS idx_emp_notifications_profile_id ON public.emp_notifications(profile_id);

-- 7. Indexes on emp_files
-- Used for fetching files attached to a specific task
CREATE INDEX IF NOT EXISTS idx_emp_files_task_id ON public.emp_files(task_id);
