"use client";
/**
 * components/auth/AuthButton.js
 * Full-width pill submit button shared by login, signup, and onboarding steps.
 * Shows a spinner + custom label while `loading` is true.
 */
export function AuthButton({ children, loading, loadingLabel = "Please wait…", type = "submit", ...rest }) {
  return (
    <button type={type} className="auth-submit-btn" disabled={loading} {...rest}>
      {loading && <span className="auth-spinner" aria-hidden />}
      {loading ? loadingLabel : children}
    </button>
  );
}
