"use client";
/**
 * app/signup/page.js — Create account
 * Collects only email + password. Phone, name, age, and gender are
 * collected right after in the /onboarding flow, one thing at a time.
 */
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { signInWithGoogle, signupUser } from "@/lib/api";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthButton } from "@/components/auth/AuthButton";
import { withBasePath } from "@/lib/basePath";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await signupUser(email, password);
      // The authenticated phone step needs the email for the final profile form.
      sessionStorage.setItem("evocare_onboarding_email", email);
      router.push(withBasePath("/onboarding/phone"));
    } catch (err) {
      setError(err.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignup() {
    setError("");
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err.message || "Google sign-up could not be started.");
      setLoading(false);
    }
  }

  return (
    <AuthShell
      tagline="Get Started with EvoCare"
      sub="A connected healthcare experience designed around patients and families."
    >
      <p className="auth-heading e-rise">Create your account</p>


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
        </div>

        <div className="auth-field">
          <label className="auth-label" htmlFor="password">Password</label>
          <div className="auth-input-wrap">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              className="d-input"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="auth-input-eye"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16} aria-hidden /> : <Eye size={16} aria-hidden />}
            </button>
          </div>
          <p className="auth-hint">At least 8 characters.</p>
        </div>

        <div className="auth-field">
          <label className="auth-label" htmlFor="confirm-password">Confirm Password</label>
          <div className="auth-input-wrap">
            <input
              id="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              className="d-input"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="auth-input-eye"
              onClick={() => setShowConfirmPassword((v) => !v)}
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? <EyeOff size={16} aria-hidden /> : <Eye size={16} aria-hidden />}
            </button>
          </div>
          {error && <p className="auth-error-text">{error}</p>}
        </div>

        <div style={{ marginTop: "24px" }}>
          <AuthButton loading={loading} loadingLabel="Creating account…">Create account</AuthButton>
        </div>
      </form>

      <div className="auth-divider">or</div>

      <button type="button" className="auth-google-btn" onClick={handleGoogleSignup} disabled={loading}>
        <GoogleIcon />
        Continue with Google
      </button>

      <p className="auth-footer-text">
        Already have an account? <Link href={withBasePath("/login")} className="auth-link">Sign in</Link>
      </p>
    </AuthShell>
  );
}

function GoogleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.55c2.08-1.92 3.28-4.74 3.28-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.55-2.77c-.98.66-2.23 1.06-3.73 1.06-2.87 0-5.3-1.94-6.16-4.54H2.18v2.85A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.43.34-2.09V7.06H2.18A11 11 0 0 0 1 12c0 1.77.43 3.45 1.18 4.94l3.66-2.85z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 0 0-9.82 6.06l3.66 2.85C6.7 7.32 9.13 5.38 12 5.38z" />
    </svg>
  );
}
