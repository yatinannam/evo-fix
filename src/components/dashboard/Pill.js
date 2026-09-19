"use client";
/**
 * components/dashboard/Pill.js
 * Pastel status pill used throughout the dashboard.
 * tone: "mint" | "peach" | "sand" | "teal" | "coral" | "neutral"
 */
export function Pill({ tone = "neutral", children, className = "" }) {
  return (
    <span className={`d-pill d-pill-${tone} ${className}`}>
      {children}
    </span>
  );
}

/** Returns the pill tone matching a document type */
export function docTagTone(type) {
  switch (type) {
    case "Prescription": return "mint";
    case "Lab Report":   return "peach";
    case "Scan":         return "sand";
    case "Invoice":      return "coral";
    default:             return "sand";
  }
}
