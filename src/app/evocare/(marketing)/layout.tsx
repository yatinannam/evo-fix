import type { Metadata } from 'next';
import '@/evocare-components/index.css';

export const metadata: Metadata = {
  alternates: { canonical: '/evocare' },
  openGraph: {
    title: 'EvoCare — Your Complete Health Companion',
    description:
      "Store records, get reminders, track your health and your family's — all in one place with EvoCare.",
    url: '/evocare',
  },
};

/**
 * (marketing) group — the EvoCare landing page at /evocare.
 * Loads the landing stylesheet here (not in the parent) so it stays out of
 * the patient-app group.
 */
export default function EvoCareMarketingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
