"use client";
/**
 * components/PwaInstallPrompt.js
 * Shows a native-feeling "Add to Home Screen" banner when the browser
 * fires the beforeinstallprompt event (Chrome / Android / Edge).
 * On iOS it surfaces a manual instruction instead.
 */
import { useEffect, useState } from "react";

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    // Detect iOS Safari (no beforeinstallprompt support)
    const ios =
      /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase()) &&
      !window.MSStream;
    const isInStandaloneMode =
      "standalone" in window.navigator && window.navigator.standalone;

    if (ios && !isInStandaloneMode) {
      setIsIos(true);
      const dismissed = sessionStorage.getItem("pwa_banner_dismissed");
      if (!dismissed) setShow(true);
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const dismissed = sessionStorage.getItem("pwa_banner_dismissed");
      if (!dismissed) setShow(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  function handleInstall() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => {
        setDeferredPrompt(null);
        setShow(false);
      });
    }
  }

  function handleDismiss() {
    sessionStorage.setItem("pwa_banner_dismissed", "1");
    setShow(false);
  }

  if (!show) return null;

  if (isIos) {
    return (
      <div className="pwa-install-banner" role="status" aria-live="polite">
        <span>
          Install <strong>EvoCare</strong> — tap{" "}
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ display: "inline", verticalAlign: "middle" }}
            aria-hidden
          >
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>{" "}
          then <em>Add to Home Screen</em>
        </span>
        <button className="pwa-install-dismiss" onClick={handleDismiss} aria-label="Dismiss">
          ×
        </button>
      </div>
    );
  }

  return (
    <div className="pwa-install-banner" role="status" aria-live="polite">
      <span>
        Install <strong>EvoCare</strong> for offline access
      </span>
      <button className="pwa-install-btn" onClick={handleInstall}>
        Install
      </button>
      <button className="pwa-install-dismiss" onClick={handleDismiss} aria-label="Dismiss">
        ×
      </button>
    </div>
  );
}
