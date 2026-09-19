import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Product Demo",
  // Sandbox demo screens with mock patient data — keep out of search.
  robots: { index: false, follow: false },
};

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
