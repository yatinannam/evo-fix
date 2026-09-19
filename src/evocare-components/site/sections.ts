/** Vertical scroll targets (visual positions after post-rocket translateY lift) */
export const DESKTOP_SECTIONS = {
  top: 0,
  features: 1251,
  launchingFirst: 2187,
  launchingNext: 5482,
  "upcoming-features": 5482,
  contact: 6640,
} as const;

/** Vertical scroll targets in the 402×10999 mobile design coordinate space */
export const MOBILE_SECTIONS = {
  top: 0,
  features: 1080,
  launchingFirst: 2824,
  launchingNext: 7276,
  "upcoming-features": 7276,
  contact: 9861,
} as const;

export type SectionId = keyof typeof DESKTOP_SECTIONS;
export type LayoutMode = "desktop" | "mobile";

const SECTION_IDS: Partial<Record<SectionId, string>> = {
  features: "three-things-scroll-zone",
  launchingFirst: "launching-first",
  launchingNext: "launching-next",
  "upcoming-features": "launching-next",
  contact: "contact",
};

export function scrollToSection(
  section: SectionId,
  scale: number,
  layout: LayoutMode = "desktop",
) {
  if (section === "top") {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  const sections = layout === "mobile" ? MOBILE_SECTIONS : DESKTOP_SECTIONS;
  const y = sections[section] * scale;
  window.scrollTo({ top: y, behavior: "smooth" });
}
