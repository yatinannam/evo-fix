import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.evodoc.in";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const page = (
    path: string,
    priority: number,
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = "weekly"
  ) => ({ url: `${SITE_URL}${path}`, lastModified: now, changeFrequency, priority });

  return [
    page("/", 1),
    page("/evodoc", 0.9),
    page("/evocare", 0.9),
    page("/evodoc/contact", 0.5, "monthly"),
    page("/evodoc/privacy", 0.3, "monthly"),
    page("/evocare/signup", 0.6, "monthly"),
    page("/evocare/login", 0.4, "monthly"),
  ];
}
