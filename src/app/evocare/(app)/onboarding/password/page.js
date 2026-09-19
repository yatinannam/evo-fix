"use client";
/**
 * app/onboarding/password/page.js — Optional/Mandatory password setup for Google sign-ins
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Eye, EyeOff } from "lucide-react";
import { OnboardingShell } from "@/components/auth/OnboardingShell";
import { updatePassword, getCurrentUser } from "@/lib/api";
import { withBasePath } from "@/lib/basePath";

export default function OnboardingPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await updatePassword(password);
      // After setting password, check if phone is verified
      const user = await getCurrentUser();
      if (!user.phoneVerified) {
        router.push(withBasePath("/onboarding/phone"));
      } else {
        router.push(withBasePath("/dashboard"));
      }
    } catch (err) {
      setError(err.message || "Could not save your password.");
      setLoading(false);
    }
  }

  return (
    <OnboardingShell step="password">
      <h1 className="login-title">Set a password</h1>
      <p className="login-subtitle">
        Since you signed in with Google, you can set a password now to also allow signing in with your email later.
      </p>

      <form onSubmit={handleSubmit} noValidate className="login-form">
        <div className="login-field login-field-relative">
          <label className="login-label" htmlFor="password">New Password</label>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            className="login-input login-input-pr"
            placeholder="Enter at least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            disabled={loading}
          />
          <button
            type="button"
            className="login-eye-btn"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
          </button>
        </div>
        
        <div className="login-field login-field-relative">
          <label className="login-label" htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            className="login-input login-input-pr"
            placeholder="Re-enter your new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            disabled={loading}
          />
          <button
            type="button"
            className="login-eye-btn"
            onClick={() => setShowConfirmPassword((v) => !v)}
            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
          >
            {showConfirmPassword ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
          </button>
          
          {error && <p className="login-error" style={{ marginTop: "8px" }}>{error}</p>}
        </div>

        <div className="login-actions">
          <button type="submit" disabled={loading} className="login-btn-primary login-btn-full">
            {loading ? "Saving..." : "Save password"}
          </button>
        </div>
      </form>
    </OnboardingShell>
  );
}
