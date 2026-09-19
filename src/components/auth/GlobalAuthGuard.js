"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export function GlobalAuthGuard() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (localStorage.getItem("evocare_logged_in") === "true") {
        if (!pathname.startsWith("/evocare/dashboard") && 
            !pathname.startsWith("/evocare/onboarding") && 
            !pathname.startsWith("/share") &&
            !pathname.startsWith("/emp-dash")) {
          router.replace("/evocare/dashboard");
        }
      }
    }
  }, [pathname, router]);

  return null;
}
