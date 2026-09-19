import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shared Medical Records",
  description: "Securely shared medical documents — access expires automatically.",
  // Tokenised private medical shares must never be indexed.
  robots: { index: false, follow: false },
};

export default function ShareLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
