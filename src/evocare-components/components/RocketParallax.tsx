import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export type RocketParallaxConfig = {
  scrollZoneId?: string;
  yStart?: number;
  yEnd?: number;
  scrollStart?: string;
  scrollEnd?: string;
  scrub?: number;
};

export const DESKTOP_ROCKET_PARALLAX: Required<RocketParallaxConfig> = {
  scrollZoneId: "three-things-scroll-zone",
  yStart: 800,
  yEnd: -1850,
  scrollStart: "450px top",
  scrollEnd: "+=1400",
  scrub: 1,
};

export const MOBILE_ROCKET_PARALLAX: Required<RocketParallaxConfig> = {
  scrollZoneId: "three-things-scroll-zone",
  yStart: 320,
  yEnd: -750,
  scrollStart: "1200px top",
  scrollEnd: "+=1200",
  scrub: 1,
};

type RocketParallaxProps = {
  src: string;
  className?: string;
  config?: RocketParallaxConfig;
};

/** Scroll-linked parallax: rocket rises faster than page scroll, in front of Three Things */
export function RocketParallax({ src, className, config }: RocketParallaxProps) {
  const rocketRef = useRef<HTMLDivElement>(null);
  const {
    scrollZoneId,
    yStart,
    yEnd,
    scrollStart,
    scrollEnd,
    scrub,
  } = { ...DESKTOP_ROCKET_PARALLAX, ...config };

  useGSAP(
    () => {
      const rocket = rocketRef.current;
      if (!rocket) return;

      const zone = document.getElementById(scrollZoneId);
      if (!zone) return;

      gsap.set(rocket, { y: yStart, force3D: true });

      gsap.to(rocket, {
        y: yEnd,
        ease: "none",
        scrollTrigger: {
          trigger: zone,
          start: scrollStart,
          end: scrollEnd,
          scrub,
          invalidateOnRefresh: true,
        },
      });
    },
    {
      scope: rocketRef,
      dependencies: [scrollZoneId, yStart, yEnd, scrollStart, scrollEnd, scrub],
    },
  );

  return (
    <div
      ref={rocketRef}
      className={className}
      data-name="a9a956bc-9388-4afd-8de4-311b3a4b1a78 1"
      data-node-id="489:1287"
      aria-hidden
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img
          alt=""
          className="absolute h-[103.96%] left-[-0.03%] max-w-none top-0 w-[100.06%]"
          src={src}
        />
      </div>
    </div>
  );
}
