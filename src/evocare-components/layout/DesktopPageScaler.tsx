import { useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import DesktopLandingPage from "../pages/DesktopLandingPage";
import { DesktopInteractiveOverlay } from "../components/overlays/DesktopInteractiveOverlay";
import { DESKTOP_PAGE_HEIGHT } from "../site/desktopLayout";
import { scrollToSection } from "../site/sections";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export const DESIGN_WIDTH = 1512;
export const DESIGN_HEIGHT = DESKTOP_PAGE_HEIGHT;

export function DesktopPageScaler() {
  // Initialize to 1 so the page renders during Server-Side Rendering (SSR).
  const [scale, setScale] = useState<number>(1);

  useEffect(() => {
    const updateScale = () => {
      setScale(Math.min(1, window.innerWidth / DESIGN_WIDTH));
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  useEffect(() => {
    ScrollTrigger.refresh();
  }, [scale]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash === "#upcoming-features" || hash === "#features" || hash === "#launching-next") {
        setTimeout(() => {
          scrollToSection("upcoming-features", scale, "desktop");
        }, 150);
      } else if (hash === "#contact") {
        setTimeout(() => {
          scrollToSection("contact", scale, "desktop");
        }, 150);
      }
    };
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, [scale]);

  return (
    <div className="w-full overflow-x-hidden bg-white">
      <div
        className="relative mx-auto"
        style={{
          width: DESIGN_WIDTH * scale,
          height: DESIGN_HEIGHT * scale,
        }}
      >
        <div
          className="absolute left-0 top-0 origin-top-left"
          style={{
            width: DESIGN_WIDTH,
            height: DESIGN_HEIGHT,
            transform: `scale(${scale})`,
          }}
        >
          <DesktopLandingPage />
          <DesktopInteractiveOverlay scale={scale} />
        </div>
      </div>
    </div>
  );
}
