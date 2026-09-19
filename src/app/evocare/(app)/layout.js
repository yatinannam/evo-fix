/**
 * (app) group — the EvoCare patient app section (/evocare/login,
 * /evocare/dashboard, /evocare/onboarding/*, …).
 *
 * Section layout (NOT a root layout — the app-wide <html>/<body> live in
 * src/app/layout.tsx). Loads the scoped patient-app stylesheet and the
 * next/font variables, and wraps everything in .evocare-scope so the demo's
 * bare global CSS (reset, body background) only applies inside the app.
 */
import { Inter, Fraunces } from "next/font/google";
import { PwaInstallPrompt } from "@/components/PwaInstallPrompt";
import { RouteGuard } from "@/components/auth/RouteGuard";
import Script from "next/script";
import "./evocare-app.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

export const metadata = {
  title: { absolute: "EvoCare — Personal Health Records" },
  description:
    "Keep every medical record in one calm place. Track medications, share safely, and know your health story.",
  // Signed-in app screens: keep them out of search results.
  robots: { index: false, follow: false },
};

export default function EvoCareAppLayout({ children }) {
  return (
    <div className={`evocare-scope ${inter.variable} ${fraunces.variable}`}>
      <RouteGuard>
        {children}
      </RouteGuard>
      <PwaInstallPrompt />
      <Script
        id="pwa-service-worker"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(function(registration) {
                  console.log('ServiceWorker registration successful with scope: ', registration.scope);
                }, function(err) {
                  console.log('ServiceWorker registration failed: ', err);
                });
              });
            }
          `
        }}
      />
    </div>
  );
}
