"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthButton } from "@/components/auth/AuthButton";
import { updatePassword } from "@/lib/api";
import { withBasePath } from "@/lib/basePath";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
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
      await updatePassword(password);
      router.push(withBasePath("/dashboard"));
    } catch (err) {
      setError(err.message || "This reset link is invalid or has expired.");
      setLoading(false);
    }
  }

  return (
    <AuthShell tagline="Create a new password" sub="Secure your account with a new password.">
      <p className="auth-heading e-rise">New password</p>

      <form onSubmit={handleSubmit} noValidate>
        <div className="auth-field">
          <label className="auth-label" htmlFor="password">New password</label>
          <input id="password" type="password" className="d-input" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
        </div>
        <div className="auth-field">
          <label className="auth-label" htmlFor="confirm-password">Confirm new password</label>
          <input id="confirm-password" type="password" className="d-input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" />
        </div>
        {error && <p className="auth-error-text">{error}</p>}
        <div style={{ marginTop: "24px" }}>
          <AuthButton loading={loading} loadingLabel="Saving…">Save password</AuthButton>
        </div>
      </form>
    </AuthShell>
  );
}
