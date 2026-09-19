"use client";
import React, { useRef } from "react";
import { useMotionValueEvent, useScroll, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const StickyScroll = ({
  content,
  contentClassName,
}: {
  content: {
    title: string;
    description: string;
    content?: React.ReactNode;
    leftContent?: React.ReactNode;
  }[];
  contentClassName?: string;
}) => {
  const [activeCard, setActiveCard] = React.useState(0);
  const ref = useRef<HTMLDivElement>(null);

  // Track page scroll relative to this section
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const cardLength = content.length;
    const cardsBreakpoints = content.map((_, index) => index / cardLength);
    const closestBreakpointIndex = cardsBreakpoints.reduce(
      (acc, breakpoint, index) => {
        const distance = Math.abs(latest - breakpoint);
        if (distance < Math.abs(latest - cardsBreakpoints[acc])) {
          return index;
        }
        return acc;
      },
      0,
    );
    setActiveCard(closestBreakpointIndex);
  });

  return (
    // This div spans the full scroll height (100vh per card).
    // Both columns live inside it; left flows normally, right is sticky.
    <div
      ref={ref}
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "60px",
        alignItems: "start",
        // Total height = one viewport per card so page scroll maps cleanly
        minHeight: `${content.length * 100}vh`,
      }}
    >
      {/* Left: one card per 100vh in normal page flow */}
      <div>
        {content.map((item, index) => (
          <div
            key={item.title + index}
            style={{
              minHeight: "100vh",
              display: "flex",
              alignItems: "center",
              paddingRight: "20px",
            }}
          >
            <motion.div
              animate={{ opacity: activeCard === index ? 1 : 0.3 }}
              transition={{ duration: 0.3 }}
              style={{ width: "100%" }}
            >
              {item.leftContent ?? (
                <>
                  <h2
                    style={{
                      fontFamily: "'Raleway', sans-serif",
                      fontSize: "36px",
                      fontWeight: 800,
                      color: "#F3FE93",
                      marginBottom: "12px",
                      lineHeight: 1.15,
                    }}
                  >
                    {item.title}
                  </h2>
                  <p
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "16px",
                      color: "#F0EDE5",
                      lineHeight: 1.6,
                    }}
                  >
                    {item.description}
                  </p>
                </>
              )}
            </motion.div>
          </div>
        ))}
      </div>

      {/* Right: sticky — pins to viewport for the entire scroll duration */}
      <div
        style={{
          // Must be same height as the left column so sticky has room to travel
          minHeight: `${content.length * 100}vh`,
          position: "relative",
        }}
      >
        <div
          className={cn("hidden lg:flex", contentClassName)}
          style={{
            position: "sticky",
            top: 0,
            height: "100vh",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Render ALL panels, show only active — avoids remount flicker */}
          {content.map((item, index) => (
            <div
              key={index}
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: activeCard === index ? 1 : 0,
                transition: "opacity 0.4s ease",
                pointerEvents: activeCard === index ? "auto" : "none",
              }}
            >
              {item.content}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
