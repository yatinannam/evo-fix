import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { absolute: 'EvoCare — Your Complete Health Companion' },
  description: "Store records, get reminders, track your health and your family's — all in one place with EvoCare.",
};

/**
 * Passthrough. The two subsections bring their own CSS in their own group
 * layouts — (marketing) loads the landing stylesheet, (app) loads the scoped
 * patient-app stylesheet — so neither leaks into the other or into the portal.
 */
export default function EvoCareLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
