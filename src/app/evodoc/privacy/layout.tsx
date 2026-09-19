import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How EvoDoc collects, protects and uses your data — encryption at rest, row-level security, and your rights over your health records.",
  alternates: { canonical: "/evodoc/privacy" },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
