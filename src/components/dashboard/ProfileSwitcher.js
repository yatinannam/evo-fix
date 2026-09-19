"use client";
/**
 * components/dashboard/ProfileSwitcher.js
 * Dropdown for switching between Circle members on the dashboard hero.
 */
import { useEffect, useRef, useState } from "react";
import { ArrowLeftRight, Check, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { withBasePath } from "@/lib/basePath";

export function ProfileSwitcher() {
  const { profiles, activeProfile, setActiveProfile } = useStore();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const router = useRouter();

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div className="d-profile-switcher" ref={ref}>
      <button
        className="d-profile-switcher-btn"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <ArrowLeftRight size={14} aria-hidden />
        Viewing: {activeProfile.relation}
      </button>

      {open && (
        <div className="d-profile-switcher-dropdown" role="listbox">
          <div className="d-switcher-label">Switch profile</div>

          {profiles.map((p) => {
            const isActive = p.id === activeProfile.id;
            return (
              <button
                key={p.id}
                role="option"
                aria-selected={isActive}
                className={`d-switcher-item ${isActive ? "active" : ""}`}
                onClick={() => {
                  setActiveProfile(p.id);
                  setOpen(false);
                }}
              >
                <span className="d-switcher-avatar">{p.initial}</span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span className="d-switcher-name">
                    {p.relation}{!p.isSelf ? ` · ${p.name.split(" ")[0]}` : ""}
                  </span>
                  <span className="d-switcher-sub">{p.lastActive}</span>
                </span>
                {isActive && <Check size={16} aria-hidden style={{ color: "var(--ink)", flexShrink: 0 }} />}
              </button>
            );
          })}

          <button
            className="d-switcher-add"
            onClick={() => { setOpen(false); router.push(withBasePath("/dashboard/circle")); }}
          >
            <Plus size={16} aria-hidden />
            Add someone to your Circle
          </button>
        </div>
      )}
    </div>
  );
}
