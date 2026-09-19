"use client";
/**
 * components/dashboard/CtaButton.js
 * Primary CTA — breathing idle animation via CSS, lift on hover, success morph.
 * Reduced motion handled in globals.css @media query.
 */
import { useState } from "react";

const PLUS_PATH  = "M12 5v14M5 12h14";
const CHECK_PATH = "M4 12l5 5L20 6";

export function CtaButton({ children, successLabel = "Done", onClick, className = "" }) {
  const [success, setSuccess] = useState(false);

  function handleClick() {
    onClick?.();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 1800);
  }

  return (
    <>
      <button
        onClick={handleClick}
        className={`d-cta-btn ${success ? "success" : ""} ${className}`}
        style={
          success
            ? { boxShadow: "0 0 0 6px rgba(175,242,251,0.5), 0 6px 18px -4px rgba(20,24,26,0.4)", animation: "none" }
            : undefined
        }
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
        >
          <path d={success ? CHECK_PATH : PLUS_PATH} />
        </svg>
        {success ? successLabel : children}
      </button>
      <span aria-live="polite" className="d-sr-only">
        {success ? successLabel : ""}
      </span>
    </>
  );
}
