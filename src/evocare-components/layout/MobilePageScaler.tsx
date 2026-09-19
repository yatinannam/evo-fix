import { useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import MobileLandingPage from "../pages/MobileLandingPage";
import { MobileInteractiveOverlay } from "../components/overlays/MobileInteractiveOverlay";
import { scrollToSection } from "../site/sections";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export const MOBILE_DESIGN_WIDTH = 402;
export const MOBILE_DESIGN_HEIGHT = 10999;
export const MOBILE_DESIGN_HEIGHT_COLLAPSED = 9544;

export function MobilePageScaler() {
  const [scale, setScale] = useState(1);
  const [showAllCards, setShowAllCards] = useState(false);

  useEffect(() => {
    const updateScale = () => {
      setScale(Math.min(1, window.innerWidth / MOBILE_DESIGN_WIDTH));
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
          scrollToSection("upcoming-features", scale, "mobile");
        }, 150);
      } else if (hash === "#contact") {
        setTimeout(() => {
          scrollToSection("contact", scale, "mobile");
        }, 150);
      }
    };
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, [scale]);

  const designHeight = showAllCards ? MOBILE_DESIGN_HEIGHT : MOBILE_DESIGN_HEIGHT_COLLAPSED;

  return (
    <div className="w-full overflow-x-hidden bg-white">
      <div
        className="relative mx-auto"
        style={{
          width: MOBILE_DESIGN_WIDTH * scale,
          height: designHeight * scale,
        }}
      >
        <div
          className="absolute left-0 top-0 origin-top-left"
          style={{
            width: MOBILE_DESIGN_WIDTH,
            height: designHeight,
            transform: `scale(${scale})`,
          }}
        >
          <MobileLandingPage showAllCards={showAllCards} setShowAllCards={setShowAllCards} />
          <MobileInteractiveOverlay scale={scale} showAllCards={showAllCards} />
        </div>
      </div>
    </div>
  );
}
