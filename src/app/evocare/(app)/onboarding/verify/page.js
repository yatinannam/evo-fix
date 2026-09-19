"use client";
/**
 * app/onboarding/verify/page.js
 * OTP verification has been removed from the onboarding flow.
 * This route now redirects immediately to the details step.
 */
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { withBasePath } from "@/lib/basePath";

export default function OnboardingVerifyPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(withBasePath("/onboarding/details"));
  }, [router]);

  return null;
}
