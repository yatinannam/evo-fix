import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the EvoDoc team — partnerships, early access, demos and support. Email contact@evodoc.site or reach us on WhatsApp.",
  alternates: { canonical: "/evodoc/contact" },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
