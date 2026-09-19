const fs = require('fs');

let serverCode = fs.readFileSync('src/lib/supabase/server.ts', 'utf-8');
if (!serverCode.includes('getCachedUser')) {
  serverCode = serverCode.replace('}\n\n/** Service-role client', '}\n\nimport { cache } from \'react\';\n\n/** Cached user fetch — resolves once per request */\nexport const getCachedUser = cache(async () => {\n  const supabase = await createEmpDashServerClient();\n  return supabase.auth.getUser();\n});\n\n/** Service-role client');
  fs.writeFileSync('src/lib/supabase/server.ts', serverCode);
}

let layoutCode = fs.readFileSync('src/app/emp-dash/(main)/layout.tsx', 'utf-8');
const layoutImportRegex = /import \{ createEmpDashServerClient \} from '@\/lib\/supabase\/server';/;
layoutCode = layoutCode.replace(layoutImportRegex, 'import { createEmpDashServerClient, getCachedUser } from \'@/lib/supabase/server\';');

const layoutTopBlock = `async function getLayoutData(): Promise<LayoutData | null> {
  const supabase = await createEmpDashServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile, error: profileErr } = await supabase
    .from('emp_profiles')
    .select('*, emp_roles(name)')
    .eq('id', user.id)
    .single();

  if (profileErr || !profile) return null;

  const { data: userDomains } = await supabase
    .from('emp_user_domains')
    .select('*, emp_domains(id, name, slug)')
    .eq('profile_id', user.id);

  // Fetch recent notifications for the bell — limit 50, unread first
  const { data: notifications } = await supabase
    .from('emp_notifications')
    .select('*')
    .eq('profile_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);`;

const layoutNewTopBlock = `async function getLayoutData(): Promise<LayoutData | null> {
  const { data: { user } } = await getCachedUser();
  if (!user) return null;

  const supabase = await createEmpDashServerClient();

  const [profileResult, userDomainsResult, notificationsResult] = await Promise.all([
    supabase.from('emp_profiles').select('*, emp_roles(name)').eq('id', user.id).single(),
    supabase.from('emp_user_domains').select('*, emp_domains(id, name, slug)').eq('profile_id', user.id),
    supabase.from('emp_notifications').select('*').eq('profile_id', user.id).order('created_at', { ascending: false }).limit(50)
  ]);

  const { data: profile, error: profileErr } = profileResult;
  if (profileErr || !profile) return null;

  const { data: userDomains } = userDomainsResult;
  const { data: notifications } = notificationsResult;`;

layoutCode = layoutCode.replace(layoutTopBlock, layoutNewTopBlock);
fs.writeFileSync('src/app/emp-dash/(main)/layout.tsx', layoutCode);
console.log('Fixed server.ts and layout.tsx');
