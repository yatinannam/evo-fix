import { createEmpDashServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { NotesClient } from '@/components/emp-dash/notes-client';
import type { EmpProfile, EmpTask, EmpPersonalNote } from '@/lib/supabase/types';

export default async function NotesPage() {
  const supabase = await createEmpDashServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/emp-dash/login');

  const { data: profile } = await supabase
    .from('emp_profiles')
    .select('*, emp_roles(name)')
    .eq('id', user.id)
    .single();
  if (!profile) redirect('/emp-dash/login');

  // Fetch notes visible to this user (RLS handles visibility including restrictive deny)
  const { data: notes, error: notesErr } = await supabase
    .from('emp_personal_notes')
    .select(`
      *,
      about_profile:emp_profiles!about_profile_id(id, full_name),
      task:emp_tasks!task_id(id, title)
    `)
    .order('created_at', { ascending: false });

  if (notesErr) {
    return (
      <div role="alert" style={{
        padding:'12px 16px', borderRadius:'14px',
        background:'#fff1f2', border:'1px solid #fecdd3',
        color:'#e11d48', fontSize:'13px',
      }}>
        Failed to load notes: {notesErr.message}
      </div>
    );
  }

  // Profiles for "about" dropdown — only show members the user can write notes about
  const { data: profiles } = await supabase
    .from('emp_profiles')
    .select('id, full_name')
    .neq('id', user.id)
    .order('full_name');

  // Tasks the user is involved with for linking
  const { data: tasks } = await supabase
    .from('emp_tasks')
    .select('id, title')
    .or(`created_by.eq.${user.id},emp_task_assignees.profile_id.eq.${user.id}`)
    .order('created_at', { ascending: false })
    .limit(100);

  return (
    <NotesClient
      notes={(notes ?? []) as Parameters<typeof NotesClient>[0]['notes']}
      profiles={(profiles ?? []) as Pick<EmpProfile, 'id' | 'full_name'>[]}
      tasks={(tasks ?? []) as Pick<EmpTask, 'id' | 'title'>[]}
      currentUserId={user.id}
    />
  );
}
