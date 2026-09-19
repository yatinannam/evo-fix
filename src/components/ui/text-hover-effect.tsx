"use client";
import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";

export const TextHoverEffect = ({
  text,
  duration,
}: {
  text: string;
  duration?: number;
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const [maskPosition, setMaskPosition] = useState({ cx: "50%", cy: "50%" });

  useEffect(() => {
    if (svgRef.current && cursor.x !== null && cursor.y !== null) {
      const svgRect = svgRef.current.getBoundingClientRect();
      const cxPercentage = ((cursor.x - svgRect.left) / svgRect.width) * 100;
      const cyPercentage = ((cursor.y - svgRect.top) / svgRect.height) * 100;
      setMaskPosition({
        cx: `${cxPercentage}%`,
        cy: `${cyPercentage}%`,
      });
    }
  }, [cursor]);

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      viewBox="0 0 300 100"
      xmlns="http://www.w3.org/2000/svg"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={(e) => setCursor({ x: e.clientX, y: e.clientY })}
      style={{ userSelect: "none" }}
    >
      <defs>
        <linearGradient
          id="textGradientEvodoc"
          gradientUnits="userSpaceOnUse"
          cx="50%"
          cy="50%"
          r="25%"
        >
          {hovered && (
            <>
              <stop offset="0%"   stopColor="#D6F303" />
              <stop offset="25%"  stopColor="#F2FF93" />
              <stop offset="50%"  stopColor="#D6F303" />
              <stop offset="75%"  stopColor="#a8c200" />
              <stop offset="100%" stopColor="#D6F303" />
            </>
          )}
        </linearGradient>

        {/* motion.radialGradient is valid framer-motion SVG */}
        <motion.radialGradient
          id="revealMaskEvodoc"
          gradientUnits="userSpaceOnUse"
          r="20%"
          initial={{ cx: "50%", cy: "50%" }}
          animate={maskPosition}
          transition={{ duration: duration ?? 0, ease: "easeOut" }}
        >
          <stop offset="0%"   stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </motion.radialGradient>

        <mask id="textMaskEvodoc">
          <rect x="0" y="0" width="100%" height="100%" fill="url(#revealMaskEvodoc)" />
        </mask>
      </defs>

      {/* Outline layer — visible on hover */}
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        strokeWidth="0.3"
        style={{
          fill: "transparent",
          stroke: "rgba(214,243,3,0.15)",
          fontFamily: "Raleway, helvetica, sans-serif",
          fontSize: "7rem",
          fontWeight: 900,
          opacity: hovered ? 0.7 : 0,
          transition: "opacity 0.3s ease",
        }}
      >
        {text}
      </text>

      {/* Draw-on animation layer */}
      <motion.text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        strokeWidth="0.3"
        style={{
          fill: "transparent",
          stroke: "rgba(214,243,3,0.12)",
          fontFamily: "Raleway, helvetica, sans-serif",
          fontSize: "7rem",
          fontWeight: 900,
        }}
        initial={{ strokeDashoffset: 1000, strokeDasharray: 1000 }}
        animate={{ strokeDashoffset: 0, strokeDasharray: 1000 }}
        transition={{ duration: 4, ease: "easeInOut" }}
      >
        {text}
      </motion.text>

      {/* Gradient reveal layer — follows cursor */}
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        stroke="url(#textGradientEvodoc)"
        strokeWidth="0.3"
        mask="url(#textMaskEvodoc)"
        style={{
          fill: "transparent",
          fontFamily: "Raleway, helvetica, sans-serif",
          fontSize: "7rem",
          fontWeight: 900,
        }}
      >
        {text}
      </text>
    </svg>
  );
};
