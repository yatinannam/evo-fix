import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.evodoc.in";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/share/",              // private, tokenised medical shares
          "/evodoc/demo/",        // sandbox screens
          "/evocare/dashboard/",  // signed-in patient app
          "/evocare/onboarding/",
          "/evocare/update-password",
          "/evocare/forgot-password",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
