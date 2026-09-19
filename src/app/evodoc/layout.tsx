import type { Metadata } from 'next';
import './globals.css';

// metadataBase comes from the root layout so every section resolves URLs
// against the same origin.
export const metadata: Metadata = {
  title: { absolute: "EvoDoc — AI Clinical Co-Pilot for Doctors & Clinics in India" },
  description:
    "EvoDoc turns years of scattered paper medical records into a one-page, symptom-driven patient timeline in seconds, and flags dangerous drug interactions before you prescribe. Pre-register for early access.",
  alternates: {
    canonical: '/evodoc',
  },
  openGraph: {
    title: "EvoDoc — AI Clinical Co-Pilot for Doctors & Clinics in India",
    description:
      "One-page, symptom-driven patient timelines and drug-interaction alerts. Pre-register for early access.",
    url: '/evodoc',
  },
};

// Fonts injected via the layout — Next.js App Router merges these into <head> correctly
// (Space Grotesk, Outfit, JetBrains Mono, Raleway, Caveat are used by EvoDoc)
export default function EvoDocLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
    </>
  );
}

