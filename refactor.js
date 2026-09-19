const fs = require('fs');

// tasks/page.tsx
let code = fs.readFileSync('src/app/emp-dash/(main)/tasks/page.tsx', 'utf-8');

const importRegex = /import \{ createEmpDashServerClient \} from '@\/lib\/supabase\/server';/;
code = code.replace(importRegex, "import { createEmpDashServerClient, getCachedUser } from '@/lib/supabase/server';");

const topBlock = `  const supabase = await createEmpDashServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/emp-dash/login');

  const { data: profile } = await supabase
    .from('emp_profiles')
    .select('*, emp_roles(name)')
    .eq('id', user.id)
    .single();

  if (!profile) redirect('/emp-dash/login');

  const roleName: string = (profile as EmpProfile & { emp_roles: Pick<EmpRole, 'name'> }).emp_roles.name;
  const isAdminPlus = roleName === 'admin' || roleName === 'super_admin';

  const { data: userDomains } = await supabase
    .from('emp_user_domains')
    .select('domain_id, role_in_domain, emp_domains(id, name, slug)')
    .eq('profile_id', user.id);

  const userDomainIds = (userDomains ?? []).map(ud => ud.domain_id);

  const { data: allDomains } = await supabase.from('emp_domains').select('*').order('name');
  const { data: allProfiles } = await supabase.from('emp_profiles').select('id, full_name').order('full_name');`;

const newTopBlock = `  const { data: { user } } = await getCachedUser();
  if (!user) redirect('/emp-dash/login');

  const supabase = await createEmpDashServerClient();

  const [profileResult, userDomainsResult] = await Promise.all([
    supabase.from('emp_profiles').select('*, emp_roles(name)').eq('id', user.id).single(),
    supabase.from('emp_user_domains').select('domain_id, role_in_domain, emp_domains(id, name, slug)').eq('profile_id', user.id)
  ]);

  const { data: profile } = profileResult;
  if (!profile) redirect('/emp-dash/login');

  const roleName: string = profile.emp_roles.name;
  const isAdminPlus = roleName === 'admin' || roleName === 'super_admin';

  const { data: userDomains } = userDomainsResult;
  const userDomainIds = (userDomains ?? []).map((ud: any) => ud.domain_id);`;

code = code.replace(topBlock, newTopBlock);

const taskQueryBlock = `  const { data: rawTasks, error: tasksErr } = await taskQuery;

  const { data: templates } = await supabase.from('emp_domain_field_templates').select('domain_id, schema');`;

const newTaskQueryBlock = `  const [allDomainsResult, allProfilesResult, tasksResult, templatesResult] = await Promise.all([
    supabase.from('emp_domains').select('*').order('name'),
    supabase.from('emp_profiles').select('id, full_name').order('full_name'),
    taskQuery,
    supabase.from('emp_domain_field_templates').select('domain_id, schema')
  ]);

  const { data: allDomains } = allDomainsResult;
  const { data: allProfiles } = allProfilesResult;
  const { data: rawTasks, error: tasksErr } = tasksResult;
  const { data: templates } = templatesResult;`;

code = code.replace(taskQueryBlock, newTaskQueryBlock);

fs.writeFileSync('src/app/emp-dash/(main)/tasks/page.tsx', code);

// page.tsx (My Day)
let myDayCode = fs.readFileSync('src/app/emp-dash/(main)/page.tsx', 'utf-8');

const importMyDayRegex = /import \{ createEmpDashServerClient \} from '@\/lib\/supabase\/server';/;
myDayCode = myDayCode.replace(importMyDayRegex, "import { createEmpDashServerClient, getCachedUser } from '@/lib/supabase/server';");

const myDayTopBlock = `  const supabase = await createEmpDashServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/emp-dash/login');

  const { data: profile } = await supabase
    .from('emp_profiles').select('*, emp_roles(name)').eq('id', user.id).single();
  if (!profile) redirect('/emp-dash/login');

  const roleName: string = (profile as EmpProfile & { emp_roles: Pick<EmpRole,'name'> }).emp_roles.name;

  const { data: myTasks, error: myTasksErr } = await supabase
    .from('emp_tasks')
    .select('*, emp_domains(name, slug), emp_task_assignees!inner(profile_id)')
    .eq('emp_task_assignees.profile_id', user.id)
    .neq('status', 'completed')
    .order('deadline', { ascending: true })
    .limit(10);

  const awaitingReview: TaskWithProfile[] = [];
  const isReviewer = roleName !== 'employee';
  if (isReviewer) {
    const { data: rt } = await supabase
      .from('emp_tasks')
      .select('*, emp_domains(name, slug), emp_profiles!created_by(full_name)')
      .eq('status', 'submitted_for_review').limit(5);
    if (rt) awaitingReview.push(...(rt as TaskWithProfile[]));
  }

  const { data: recentComments } = await supabase
    .from('emp_task_comments')
    .select('*, emp_profiles!author_id(full_name), emp_tasks!inner(title, domain_id)')
    .order('created_at', { ascending: false })
    .limit(5);`;

const myDayNewTopBlock = `  const { data: { user } } = await getCachedUser();
  if (!user) redirect('/emp-dash/login');

  const supabase = await createEmpDashServerClient();

  const [profileResult, myTasksResult, recentCommentsResult] = await Promise.all([
    supabase.from('emp_profiles').select('*, emp_roles(name)').eq('id', user.id).single(),
    supabase.from('emp_tasks').select('*, emp_domains(name, slug), emp_task_assignees!inner(profile_id)').eq('emp_task_assignees.profile_id', user.id).neq('status', 'completed').order('deadline', { ascending: true }).limit(10),
    supabase.from('emp_task_comments').select('*, emp_profiles!author_id(full_name), emp_tasks!inner(title, domain_id)').order('created_at', { ascending: false }).limit(5)
  ]);

  const { data: profile } = profileResult;
  if (!profile) redirect('/emp-dash/login');

  const roleName: string = profile.emp_roles.name;
  const { data: myTasks, error: myTasksErr } = myTasksResult;
  const { data: recentComments } = recentCommentsResult;

  const awaitingReview: TaskWithProfile[] = [];
  const isReviewer = roleName !== 'employee';
  if (isReviewer) {
    const { data: rt } = await supabase
      .from('emp_tasks')
      .select('*, emp_domains(name, slug), emp_profiles!created_by(full_name)')
      .eq('status', 'submitted_for_review').limit(5);
    if (rt) awaitingReview.push(...(rt as TaskWithProfile[]));
  }`;

myDayCode = myDayCode.replace(myDayTopBlock, myDayNewTopBlock);
fs.writeFileSync('src/app/emp-dash/(main)/page.tsx', myDayCode);

console.log('done');
