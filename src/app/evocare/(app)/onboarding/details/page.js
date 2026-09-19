"use client";
/**
 * app/onboarding/details/page.js — Onboarding step 2: a few small details
 * Name, age, gender, and blood group — the last step before landing on the dashboard.
 */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserRound } from "lucide-react";
import { completeOnboarding, getCurrentUser } from "@/lib/api";
import { OnboardingShell } from "@/components/auth/OnboardingShell";
import { withBasePath } from "@/lib/basePath";

const GENDERS = ["Female", "Male", "Other", "Prefer not to say"];
const BLOOD_GROUPS = ["A+", "A−", "B+", "B−", "AB+", "AB−", "O+", "O−"];

export default function OnboardingDetailsPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setEmail(sessionStorage.getItem("evocare_onboarding_email") || "");
    getCurrentUser().then((user) => {
      if (user.email && !sessionStorage.getItem("evocare_onboarding_email")) setEmail(user.email);
      if (user.firstName) setFirstName(user.firstName);
      if (user.lastName) setLastName(user.lastName);
      if (user.age) setAge(user.age);
      if (user.gender) setGender(user.gender);
      if (user.bloodGroup) setBloodGroup(user.bloodGroup);
    }).catch(() => {});
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!firstName.trim()) {
      setError("Enter your first name.");
      return;
    }
    const ageNum = Number(age);
    if (!age || ageNum < 1 || ageNum > 120) {
      setError("Enter a valid age.");
      return;
    }
    if (!gender) {
      setError("Select an option so we can personalize your dashboard.");
      return;
    }

    setLoading(true);
    try {
      await completeOnboarding({
        email,
        phone: sessionStorage.getItem("evocare_onboarding_phone") || null,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        age: ageNum,
        gender,
        bloodGroup: bloodGroup || null,
      });
      sessionStorage.removeItem("evocare_onboarding_email");
      sessionStorage.removeItem("evocare_onboarding_phone");
      router.push(withBasePath("/dashboard"));
    } catch (err) {
      setError(err.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <OnboardingShell step="details">
      <h1 className="login-title">Tell us a bit about you</h1>
      <p className="login-subtitle">This helps us personalize reminders, ranges, and insights for you.</p>

      <form onSubmit={handleSubmit} noValidate className="login-form">
        <div className="onb-row-2col">
          <div className="login-field">
            <label className="login-label" htmlFor="firstName">First name</label>
            <input
              id="firstName"
              type="text"
              className="login-input"
              placeholder="e.g. John"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
              autoComplete="given-name"
            />
          </div>
          <div className="login-field">
            <label className="login-label" htmlFor="lastName">Last name</label>
            <input
              id="lastName"
              type="text"
              className="login-input"
              placeholder="e.g. Doe"
              value={lastName}
              onChange={(e) => setLastName(e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
              autoComplete="family-name"
            />
          </div>
        </div>

        <div className="login-field">
          <label className="login-label" htmlFor="age">Age</label>
          <input
            id="age"
            type="number"
            inputMode="numeric"
            className="login-input"
            placeholder="e.g. 21"
            min={1}
            max={120}
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
        </div>

        <div className="onb-row-2col">
          <div className="login-field">
            <label className="login-label">Gender</label>
            <select 
              className="login-input" 
              value={gender} 
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="" disabled>Select Gender</option>
              {GENDERS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div className="login-field">
            <label className="login-label">
              Blood group <span style={{color: '#9CA3AF', fontWeight: 'normal', fontSize: '0.75rem'}}>(optional)</span>
            </label>
            <select 
              className="login-input" 
              value={bloodGroup} 
              onChange={(e) => setBloodGroup(e.target.value)}
            >
              <option value="" disabled>Select Blood Group</option>
              {BLOOD_GROUPS.map((bg) => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>
        </div>

        {error && <p className="login-error">{error}</p>}

        <div className="login-actions">
          <button type="submit" disabled={loading} className="login-btn-primary login-btn-full">
            {loading ? "Setting up your dashboard..." : "Finish setup"}
          </button>
        </div>
      </form>
    </OnboardingShell>
  );
}
