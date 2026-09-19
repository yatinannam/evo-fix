import { type SectionId } from "./sections";
import { emitSiteToast } from "./toast";

const SECTION_ELEMENT_IDS: Partial<Record<SectionId, string>> = {
  features: "three-things-scroll-zone",
  launchingFirst: "launching-first",
  launchingNext: "launching-next",
  contact: "contact",
};

export function footerGo(section: SectionId) {
  if (section === "top") {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  document
    .getElementById(SECTION_ELEMENT_IDS[section]!)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export const footerToast = {
  login: () => emitSiteToast("Login opens at launch.", "info"),
  privacy: () => emitSiteToast("Privacy policy page coming soon.", "info"),
  terms: () => emitSiteToast("Terms of service page coming soon.", "info"),
  cookies: () => emitSiteToast("Cookie preferences coming soon.", "info"),
};

export function openSocial(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}
