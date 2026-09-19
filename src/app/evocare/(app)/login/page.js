"use client";
/**
 * app/login/page.js — Redesigned Two-Column Login
 */
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import {
  loginUser,
  signInWithGoogle,
  checkEmail,
  signInWithEmailOtp,
  verifyEmailOtp,
  requestPasswordReset
} from "@/lib/api";
import { withBasePath } from "@/lib/basePath";

export default function LoginPage() {
  const router = useRouter();
  
  // Steps: 'email' -> 'password' | 'otp' | 'reset_otp' | 'set_new_password'
  const [step, setStep] = useState("email");
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [resetOtp, setResetOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  // Flow handlers
  async function handleEmailSubmit(e) {
    e.preventDefault();
    setError("");

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const { exists, confirmed, hasPassword } = await checkEmail(email);
      if (exists) {
        if (confirmed === false) {
          setIsNewUser(true);
          setStep("unconfirmed");
        } else if (hasPassword) {
          setStep("password");
        } else {
          setIsNewUser(false);
          await signInWithEmailOtp(email);
          setStep("otp");
        }
      } else {
        setIsNewUser(true);
        await signInWithEmailOtp(email);
        setStep("otp");
      }
    } catch (err) {
      setError(err.message || "Failed to check email.");
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setError("");

    if (password.length < 1) {
      setError("Enter your password.");
      return;
    }

    setLoading(true);
    try {
      const u = await loginUser(email, password);
      if (!u.phoneVerified) {
        router.push(withBasePath("/onboarding/phone"));
      } else {
        router.push(withBasePath("/dashboard/"));
      }
    } catch (err) {
      setError(err.message || "Incorrect password. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleOtpSubmit(e) {
    e.preventDefault();
    setError("");

    if (otp.length < 6) {
      setError("Enter the code.");
      return;
    }

    setLoading(true);
    try {
      const u = await verifyEmailOtp(email, otp);
      if (isNewUser) {
        router.push(withBasePath("/onboarding/password"));
      } else if (!u.phoneVerified) {
        router.push(withBasePath("/onboarding/phone"));
      } else {
        router.push(withBasePath("/dashboard/"));
      }
    } catch (err) {
      setError(err.message || "Incorrect code. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    setError("");
    setLoading(true);
    try {
      await requestPasswordReset(email);
      setStep("reset_otp");
    } catch (err) {
      setError(err.message || "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetOtpSubmit(e) {
    e.preventDefault();
    setError("");

    if (resetOtp.length < 6) {
      setError("Enter the reset code.");
      return;
    }

    setLoading(true);
    try {
      const { supabase } = await import("@/lib/supabase");
      const { error } = await supabase.auth.verifyOtp({ email, token: resetOtp, type: 'recovery' });
      if (error) throw new Error(error.message);
      
      setStep("set_new_password");
    } catch (err) {
      setError(err.message || "Incorrect reset code. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSetNewPasswordSubmit(e) {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const { updatePassword, getCurrentUser } = await import("@/lib/api");
      await updatePassword(newPassword);
      const user = await getCurrentUser();
      
      if (!user.phoneVerified) {
        router.push(withBasePath("/onboarding/phone"));
      } else {
        router.push(withBasePath("/dashboard/"));
      }
    } catch (err) {
      setError(err.message || "Failed to set new password.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOtp() {
    setError("");
    setLoading(true);
    setOtp("");
    setResetOtp("");
    try {
      if (step === "reset_otp") {
        await requestPasswordReset(email);
      } else {
        await signInWithEmailOtp(email);
      }
    } catch (err) {
      setError(err.message || "Failed to resend code.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError("");
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err.message || "Google sign-in could not be started.");
      setLoading(false);
    }
  }

  return (
    <div className="login-layout">
      {/* Left Column (Login Form) */}
      <div className="login-left">
        <header className="login-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="login-logo-wrap">
            <img src="/evocare_logo.png" alt="EvoCare" style={{ height: "40px", objectFit: "contain" }} />
          </div>
          <button 
            type="button" 
            onClick={() => router.push(withBasePath("/"))} 
            className="login-btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}
          >
            <ArrowLeft size={16} /> Back
          </button>
        </header>
        
        <main className="login-main">
          <h1 className="login-title">
            {step === "email" ? "Welcome to EvoCare," : 
             step === "password" ? "Sign in" : 
             step === "otp" ? "Confirm email" : 
             step === "reset_otp" ? "Reset password" : 
             step === "set_new_password" ? "New password" : "Welcome to EvoCare,"}
          </h1>
          
          <p className="login-subtitle">
            {step === "email" && "Enter email address to continue"}
            {step === "password" && `Enter your password for ${email}`}
            {step === "otp" && `We emailed a code to ${email}`}
            {step === "reset_otp" && `Enter the reset code sent to ${email}`}
            {step === "set_new_password" && "Secure your account with a new password"}
            {step === "unconfirmed" && "Your email address wasn't confirmed yet."}
          </p>

          <form onSubmit={
            step === "email" ? handleEmailSubmit :
            step === "password" ? handlePasswordSubmit :
            step === "otp" ? handleOtpSubmit :
            step === "reset_otp" ? handleResetOtpSubmit :
            step === "set_new_password" ? handleSetNewPasswordSubmit :
            (e) => e.preventDefault()
          } noValidate className="login-form">

            {/* Email Field */}
            {(step === "email" || step === "password") && (
              <div className="login-field">
                <label className="login-label">Email address</label>
                <input
                  type="email"
                  className="login-input"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={step !== "email" || loading}
                />
              </div>
            )}

            {/* Password Field */}
            {step === "password" && (
              <div className="login-field login-field-relative">
                <label className="login-label">Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  className="login-input login-input-pr"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  autoFocus
                />
                <button
                  type="button"
                  className="login-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            )}

            {/* OTP Field */}
            {(step === "otp" || step === "reset_otp") && (
              <div className="login-field">
                <label className="login-label">Code</label>
                <input
                  type="text"
                  inputMode="numeric"
                  className="login-input login-input-center"
                  placeholder="------"
                  value={step === "otp" ? otp : resetOtp}
                  onChange={(e) => step === "otp" ? setOtp(e.target.value.replace(/\D/g, '')) : setResetOtp(e.target.value.replace(/\D/g, ''))}
                  disabled={loading}
                  maxLength={8}
                  autoFocus
                />
                <button type="button" onClick={handleResendOtp} className="login-btn-secondary" style={{ marginTop: '0.5rem', alignSelf: 'flex-end', fontSize: '0.75rem' }}>
                  Resend code
                </button>
              </div>
            )}

            {/* New Password Field */}
            {step === "set_new_password" && (
              <div className="login-field login-field-relative">
                <label className="login-label">New Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  className="login-input login-input-pr"
                  placeholder="At least 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={loading}
                  autoFocus
                />
                <button
                  type="button"
                  className="login-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            )}

            {/* Unconfirmed Block */}
            {step === "unconfirmed" && (
              <div className="login-unconfirmed">
                <button 
                  type="button" 
                  onClick={async () => {
                    setLoading(true);
                    try {
                      await signInWithEmailOtp(email);
                      setStep("otp");
                    } catch (err) {
                      setError(err.message || "Failed to send code.");
                    } finally {
                      setLoading(false);
                    }
                  }} 
                  className="login-btn-primary login-btn-full"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Confirm email now"}
                </button>
                <button type="button" onClick={() => setStep("email")} className="login-btn-back" disabled={loading}>
                  <ArrowLeft size={16} className="login-back-icon" /> Back
                </button>
              </div>
            )}

            {error && <p className="login-error">{error}</p>}

            {/* Primary Action Buttons */}
            {step !== "unconfirmed" && (
              <div className="login-actions" style={step === "email" || step === "otp" || step === "reset_otp" ? { justifyContent: 'center', marginTop: '1rem' } : {}}>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="login-btn-primary"
                >
                  {loading ? "Wait..." : 
                   step === "email" ? "Continue" : 
                   step === "password" ? "Sign in" : 
                   step === "set_new_password" ? "Save" :
                   "Verify"}
                </button>

                {step === "password" && (
                  <button type="button" onClick={handleForgotPassword} className="login-btn-secondary">
                    Forgot password?
                  </button>
                )}
              </div>
            )}

            {/* Navigation Helpers */}
            {(step === "password" || step === "otp" || step === "reset_otp") && (
              <div className="login-nav-helpers">
                <button 
                  type="button" 
                  onClick={() => {
                    if (step === "password" || step === "otp") setStep("email");
                    if (step === "reset_otp") setStep("password");
                    setError("");
                  }} 
                  className="login-btn-back"
                >
                  <ArrowLeft size={16} className="login-back-icon" /> Back
                </button>
              </div>
            )}

            {/* OR Divider and Google Login - Only on Email Step */}
            {step === "email" && (
              <>
                <div className="login-divider">
                  <div className="login-divider-line"></div>
                  <span className="login-divider-text">OR</span>
                  <div className="login-divider-line"></div>
                </div>

                <button 
                  type="button" 
                  onClick={handleGoogleLogin} 
                  disabled={loading}
                  className="login-btn-google"
                >
                  <GoogleIcon />
                  Continue with Google
                </button>
              </>
            )}
          </form>
        </main>
        
        <footer className="login-footer">
          {/* <p>&copy; {new Date().getFullYear()} handhold. All rights reserved.</p> */}
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

function GoogleIcon() {
  return (
    <div className="login-google-icon-wrap">
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.55c2.08-1.92 3.28-4.74 3.28-8.1z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.55-2.77c-.98.66-2.23 1.06-3.73 1.06-2.87 0-5.3-1.94-6.16-4.54H2.18v2.85A11 11 0 0 0 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.43.34-2.09V7.06H2.18A11 11 0 0 0 1 12c0 1.77.43 3.45 1.18 4.94l3.66-2.85z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 0 0-9.82 6.06l3.66 2.85C6.7 7.32 9.13 5.38 12 5.38z" />
      </svg>
    </div>
  );
}
