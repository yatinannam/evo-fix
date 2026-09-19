"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/api";
import { withBasePath } from "@/lib/basePath";

const PUBLIC_ROUTES = ["/login", "/signup", "/forgot-password", "/update-password"];
const ONBOARDING_ROUTES = ["/onboarding/phone", "/onboarding/details", "/onboarding/password", "/onboarding/verify"];

export function RouteGuard({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Basic prefix stripping for evocative logic. e.g. /evocare/dashboard -> /dashboard
    const path = pathname.replace(/^\/evocare/, "") || "/";

    getCurrentUser()
      .then(user => {
        // Logged In
        if (PUBLIC_ROUTES.includes(path)) {
          // Visiting a public route while logged in -> redirect appropriately
          if (user.needsPasswordSetup) {
            router.replace(withBasePath("/onboarding/password"));
          } else if (!user.phoneVerified) {
            router.replace(withBasePath("/onboarding/phone"));
          } else if (user.detailsMissing) {
            router.replace(withBasePath("/onboarding/details"));
          } else {
            router.replace(withBasePath("/dashboard"));
          }
        } else if (!PUBLIC_ROUTES.includes(path) && !ONBOARDING_ROUTES.includes(path)) {
          // Protected route
          if (user.needsPasswordSetup) {
            router.replace(withBasePath("/onboarding/password"));
          } else if (!user.phoneVerified) {
            router.replace(withBasePath("/onboarding/phone"));
          } else if (user.detailsMissing) {
            router.replace(withBasePath("/onboarding/details"));
          } else {
            setAuthorized(true);
          }
        } else {
          // Onboarding route -> enforce order
          if (user.needsPasswordSetup && path !== "/onboarding/password") {
            router.replace(withBasePath("/onboarding/password"));
          } else if (!user.needsPasswordSetup && !user.phoneVerified && path !== "/onboarding/phone") {
            router.replace(withBasePath("/onboarding/phone"));
          } else if (!user.needsPasswordSetup && user.phoneVerified && user.detailsMissing && path !== "/onboarding/details") {
            router.replace(withBasePath("/onboarding/details"));
          } else {
            setAuthorized(true);
          }
        }
      })
      .catch(() => {
        // Not Logged In
        if (!PUBLIC_ROUTES.includes(path)) {
          router.replace(withBasePath("/login"));
        } else {
          setAuthorized(true);
        }
      })
      .finally(() => setLoading(false));
  }, [pathname, router]);

  if (loading) {
    // Could render a full-page skeleton/spinner here
    return null;
  }

  return authorized ? children : null;
}
