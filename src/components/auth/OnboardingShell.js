"use client";
/**
 * components/auth/OnboardingShell.js
 * Shared centered-card shell for the post-signup onboarding steps
 * (password -> phone → details). Redesigned to use the two-column login layout.
 */
import { ArrowLeft, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { withBasePath } from "@/lib/basePath";
import { logoutUser } from "@/lib/api";

const STEPS = ["password", "phone", "details"];

export function OnboardingShell({ step, onBack, children }) {
  const router = useRouter();
  const stepIndex = STEPS.indexOf(step);

  function handleBack() {
    if (onBack) return onBack();
    if (stepIndex > 0) router.push(withBasePath(`/onboarding/${STEPS[stepIndex - 1]}`));
    else router.push(withBasePath("/login"));
  }
  
  async function handleExit() {
    await logoutUser();
    router.push(withBasePath("/login"));
  }

  return (
    <div className="login-layout">
      {/* Left Column (Onboarding Form) */}
      <div className="login-left">
        <header className="login-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="login-logo-wrap">
            <img src="/evocare_logo.png" alt="EvoCare" style={{ height: "40px", objectFit: "contain" }} />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div className="onb-progress" role="progressbar" aria-valuenow={stepIndex + 1} aria-valuemin={1} aria-valuemax={STEPS.length} style={{ width: '120px' }}>
              {STEPS.map((s, i) => (
                <div key={s} className={`onb-progress-seg ${i < stepIndex ? "done" : i === stepIndex ? "active" : ""}`} />
              ))}
            </div>
            <button onClick={handleExit} className="login-btn-secondary" title="Exit setup" style={{ padding: 0 }}>
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <main className="login-main">
          {children}

          <div className="login-nav-helpers" style={{ marginTop: '1rem' }}>
            <button 
              type="button" 
              onClick={handleBack} 
              className="login-btn-back"
            >
              <ArrowLeft size={16} className="login-back-icon" /> Back
            </button>
          </div>
        </main>

        <footer className="login-footer">
          {/* Empty footer for spacing */}
        </footer>
      </div>

      {/* Right Column (Glass Panel Art) */}
      <div className="login-right">
        <div className="login-glass-panel">
          {/* Decorative star/sparkle icon inside glass panel */}
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="login-star-icon">
            <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" fill="currentColor" />
          </svg>
        </div>
      </div>
    </div>
  );
}
