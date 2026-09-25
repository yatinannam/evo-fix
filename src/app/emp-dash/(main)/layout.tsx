import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createEmpDashServerClient, getCachedUser, getCachedProfile } from '@/lib/supabase/server';
import { EmpDashSidebar } from '@/components/emp-dash/sidebar';
import { NotificationBell } from '@/components/emp-dash/notification-bell';
import type { EmpProfile, EmpRole, EmpUserDomain, EmpDomain, EmpNotification } from '@/lib/supabase/types';
import '../emp-dash.css';

export const metadata: Metadata = {
  title: { absolute: 'EvoDoc — Employee Dashboard' },
  description: 'Internal employee dashboard — task management, file sharing, and team communication.',
  robots: { index: false, follow: false },
};

interface LayoutData {
  profile: EmpProfile & { emp_roles: Pick<EmpRole, 'name'> };
  userDomains: (EmpUserDomain & { emp_domains: Pick<EmpDomain, 'id' | 'name' | 'slug'> })[];
  notifications: EmpNotification[];
  userId: string;
}

async function getLayoutData(): Promise<LayoutData | null> {
  const user = await getCachedUser();
  if (!user) return null;

  const profile = await getCachedProfile(user.id);
  if (!profile) return null;

  const supabase = await createEmpDashServerClient();

  // userDomains and notifications are both independent given user.id — batch them.
  const [{ data: userDomains }, { data: notifications }] = await Promise.all([
    supabase.from('emp_user_domains').select('*, emp_domains(id, name, slug)').eq('profile_id', user.id),
    supabase.from('emp_notifications').select('*').eq('profile_id', user.id).order('created_at', { ascending: false }).limit(50),
  ]);

  return {
    profile: profile as LayoutData['profile'],
    userDomains: (userDomains ?? []) as LayoutData['userDomains'],
    notifications: (notifications ?? []) as EmpNotification[],
    userId: user.id,
  };
}

export default async function EmpDashLayout({ children }: { children: React.ReactNode }) {
  const data = await getLayoutData();
  if (!data) redirect('/emp-dash/login');

  const { profile, userDomains, notifications, userId } = data;

  return (
    <div data-empdash data-lenis-prevent style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'radial-gradient(ellipse at 80% -10%, #ffedd5 0%, #fef3e2 20%, #faf8f5 50%, #f9f6ff 100%)',
      fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
    }}>
      <EmpDashSidebar
        profile={profile}
        userDomains={userDomains}
        notificationBell={
          <NotificationBell
            initialNotifications={notifications}
            currentUserId={userId}
          />
        }
      />
      <main className="ed-main-content" style={{ flex: 1, minWidth: 0, overflow: 'auto', paddingTop: '0px' }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '32px 32px 60px' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
