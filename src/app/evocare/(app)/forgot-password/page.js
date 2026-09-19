"use client";
/**
 * app/forgot-password/page.js — Password reset request
 */
import { useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthButton } from "@/components/auth/AuthButton";
import { withBasePath } from "@/lib/basePath";
import { requestPasswordReset } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      setError(err.message || "Could not send a reset link. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      tagline={sent ? "Check your email" : "Reset your password"}
      sub={sent ? "A reset link is on its way." : "We'll help you get signed back in — no history lost."}
    >
      {sent ? (
        <>
          <div className="onb-icon-badge">
            <Mail size={22} aria-hidden />
          </div>
          <p className="auth-heading e-rise">Link sent</p>
          <p className="auth-subtext e-rise e-delay-1">
            If an account exists for <b style={{ color: "var(--ink)" }}>{email}</b>, a reset link is on its way.
          </p>
          <Link href={withBasePath("/login")} className="auth-link">Back to sign in</Link>
        </>
      ) : (
        <>
          <p className="auth-heading e-rise">Account recovery</p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <label className="auth-label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="d-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              {error && <p className="auth-error-text">{error}</p>}
            </div>

            <div style={{ marginTop: "24px" }}>
              <AuthButton loading={loading} loadingLabel="Sending…">Send reset link</AuthButton>
            </div>
          </form>

          <p className="auth-footer-text">
            Remembered it? <Link href={withBasePath("/login")} className="auth-link">Back to sign in</Link>
          </p>
        </>
      )}
    </AuthShell>
  );
}
