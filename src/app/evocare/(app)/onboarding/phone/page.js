"use client";
/**
 * app/onboarding/phone/page.js — Onboarding step 1: mobile number
 * Phone powers Emergency QR access and family reminders.
 */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Smartphone } from "lucide-react";
import { OnboardingShell } from "@/components/auth/OnboardingShell";
import { PhoneInput } from "@/components/auth/PhoneInput";
import { withBasePath } from "@/lib/basePath";
import { getCurrentUser, checkPhone, savePhone } from "@/lib/api";

export default function OnboardingPhonePage() {
  const router = useRouter();
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCurrentUser().then((user) => {
      if (user.phoneVerified) router.replace(withBasePath("/dashboard"));
    }).catch(() => { });
  }, [router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const digits = phone.replace(/\D/g, "");
    if (digits.length !== 10) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);
    try {
      const fullPhone = `${countryCode}${digits}`;
      const data = await checkPhone(fullPhone);
      if (data.exists) {
        throw new Error("This phone number is already linked to another EvoCare account.");
      }
      await savePhone(fullPhone);
      sessionStorage.setItem("evocare_onboarding_phone", fullPhone);
      router.push(withBasePath("/onboarding/details"));
    } catch (err) {
      setError(err.message || "Could not check your mobile number.");
      setLoading(false);
    }
  }

  return (
    <OnboardingShell step="phone">
      <h1 className="login-title">What's your mobile number?</h1>
      <p className="login-subtitle">
        Your number powers Emergency QR access and reminders for your care circle.
      </p>

      <form onSubmit={handleSubmit} noValidate className="login-form">
        <div className="login-field">
          <label className="login-label" htmlFor="phone">Mobile number</label>
          <PhoneInput
            countryCode={countryCode}
            onCountryCodeChange={setCountryCode}
            phone={phone}
            onPhoneChange={setPhone}
          />
          {error && <p className="login-error" style={{ marginTop: "8px" }}>{error}</p>}
        </div>

        <div className="login-actions">
          <button type="submit" disabled={loading} className="login-btn-primary login-btn-full">
            {loading ? "Saving..." : "Continue"}
          </button>
        </div>
      </form>
    </OnboardingShell>
  );
}
