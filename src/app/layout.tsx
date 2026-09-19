import type { Metadata, Viewport } from 'next';
import { headers } from 'next/headers';
import { Geist } from "next/font/google";
import Script from "next/script";
import { cn } from "@/lib/utils";
import LenisProvider from "@/components/LenisProvider";
import { GlobalAuthGuard } from "@/components/auth/GlobalAuthGuard";
import { Analytics } from "@vercel/analytics/react";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.evodoc.in';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'EvoDoc — Clinical AI CoPilot for Modern Medicine',
    template: '%s | EvoDoc',
  },
  description: 'EvoDoc provides doctors with an AI-powered clinical copilot that surfaces relevant patient history, smart timelines and instant insights. EvoCare gives patients a complete health companion to manage records, family health and medicine reminders.',
  keywords: ['EvoDoc', 'EvoCare', 'clinical AI', 'medical platform', 'doctor tools', 'patient care', 'health records', 'personal health records', 'India healthcare'],
  applicationName: 'EvoDoc',
  alternates: {
    canonical: '/',
  },
  icons: {
    // Served directly from /public — no image processing by Turbopack
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: 'EvoDoc — Clinical AI CoPilot',
    description: 'AI-powered clinical tools for doctors and complete patient care for everyone.',
    url: '/',
    siteName: 'EvoDoc',
    type: 'website',
    locale: 'en_IN',
    images: [{ url: '/logo.png', width: 512, height: 512, alt: 'EvoDoc' }],
  },
  twitter: {
    card: 'summary',
    title: 'EvoDoc — Clinical AI CoPilot',
    description: 'AI-powered clinical tools for doctors and complete patient care for everyone.',
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'EvoDoc',
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  email: 'contact@evodoc.site',
  sameAs: [
    'https://instagram.com/evodoc.in',
    'https://www.linkedin.com/company/evodoc',
  ],
  description: 'EvoDoc builds an AI clinical copilot for doctors and EvoCare, a personal health record companion for patients and families in India.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const nonce = (await headers()).get('x-nonce') ?? undefined;
  return (
    <html lang="en" className={cn("font-sans", geist.variable)} data-scroll-behavior="smooth">
      <head>
        <Script
          id="evocare-redirect-guard"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('evocare_logged_in') === 'true') {
                  var path = window.location.pathname;
                  if (!path.startsWith('/evocare/dashboard') &&
                      !path.startsWith('/evocare/onboarding') &&
                      !path.startsWith('/share') &&
                      !path.startsWith('/emp-dash')) {
                    window.location.replace('/evocare/dashboard');
                  }
                }
              } catch(e) {}
            `
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Raleway:wght@700;800;900&family=Space+Grotesk:wght@400;500;600;700;800;900&family=Outfit:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500&family=Caveat:wght@700&display=swap"
          rel="stylesheet"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#74d3e0" />
      </head>
      <body>
        <Script
          id="organization-jsonld"
          type="application/ld+json"
          nonce={nonce}
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <LenisProvider>
          <GlobalAuthGuard />
          {children}
          <Analytics />
        </LenisProvider>
      </body>
    </html>
  );
}
