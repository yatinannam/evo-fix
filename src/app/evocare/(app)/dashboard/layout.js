"use client";
/**
 * app/dashboard/layout.js
 * Dashboard shell: sticky topbar + mobile slide-up profile drawer + bottom nav.
 * Desktop keeps the full horizontal topbar with inline nav + profile dropdown.
 */
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell, Search, X,
  Home, FolderOpen, Pill, Activity, User, LogOut,
} from "lucide-react";
import { Sidebar, NAV, PROFILE_MENU } from "@/components/dashboard/Sidebar";
import { useStore } from "@/lib/store";
import { StoreProvider } from "@/lib/store";
import { withBasePath } from "@/lib/basePath";
import { logoutUser } from "@/lib/api";

/* ── Bottom nav tabs ─────────────────────────────────────────────────────── */
const BOTTOM_TABS = [
  { href: "/dashboard",             label: "Home",   Icon: Home,      exact: true },
  { href: "/dashboard/documents",   label: "Docs",   Icon: FolderOpen },
  { href: "/dashboard/medications", label: "Meds",   Icon: Pill },
  { href: "/dashboard/readings",    label: "Vitals", Icon: Activity },
];

/* ── Mobile bottom navigation ────────────────────────────────────────────── */
function MobileBottomNav({ pathname, onProfileOpen }) {
  return (
    <nav className="dash-bottom-nav" aria-label="Main navigation">
      {BOTTOM_TABS.map(({ href, label, Icon, exact }) => {
        const target = withBasePath(href);
        const isActive = exact ? pathname === target : pathname.startsWith(target);
        return (
          <Link
            key={label}
            href={target}
            className={`dash-bottom-nav-item${isActive ? " active" : ""}`}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon size={22} aria-hidden />
            <span>{label}</span>
          </Link>
        );
      })}
      <button
        className="dash-bottom-nav-item"
        onClick={onProfileOpen}
        aria-label="Profile and settings"
        type="button"
      >
        <User size={22} aria-hidden />
        <span>Profile</span>
      </button>
    </nav>
  );
}

/* ── Profile slide-up drawer (mobile) ────────────────────────────────────── */
function ProfileDrawer({ open, onClose, user, activeProfile, profiles, setActiveProfile, onLogout }) {
  if (!open) return null;
  return (
    <>
      {/* Dimmed backdrop */}
      <div
        className="dash-profile-overlay"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Slide-up sheet */}
      <div
        className="dash-profile-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="Profile and settings"
      >
        <div className="dps-handle" aria-hidden="true" />

        {/* User identity */}
        <div className="dps-user">
          <div className="dps-user-avatar">
            {activeProfile.initial}
          </div>
          <div>
            <div className="dps-user-name">{user.email.split("@")[0]}</div>
            <div className="dps-user-email">{user.email}</div>
          </div>
        </div>

        {/* Family / circle switcher */}
        {profiles.length > 1 && (
          <div className="dps-section">
            <div className="dps-section-label">Switch Profile</div>
            {profiles.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`dps-row${p.id === activeProfile.id ? " dps-row-active" : ""}`}
                onClick={() => { setActiveProfile(p.id); onClose(); }}
              >
                <div className="dps-row-avatar">
                  {p.initial || p.name.charAt(0).toUpperCase()}
                </div>
                <span className="dps-row-label">{p.name}</span>
                {p.id === activeProfile.id && (
                  <span className="dps-active-chip">Active</span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Navigation links */}
        <div className="dps-section">
          {PROFILE_MENU.map((item) => (
            <Link
              key={item.label}
              href={withBasePath(item.href)}
              className="dps-row"
              onClick={onClose}
            >
              <div className="dps-row-icon">
                <item.Icon size={16} aria-hidden />
              </div>
              <span className="dps-row-label">{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Log out */}
        <div className="dps-section">
          <button
            type="button"
            className="dps-row dps-row-danger"
            onClick={onLogout}
          >
            <div className="dps-row-icon">
              <LogOut size={16} aria-hidden />
            </div>
            <span className="dps-row-label">Log out</span>
          </button>
        </div>

        {/* iOS safe-area padding */}
        <div className="dps-safe-bottom" aria-hidden="true" />
      </div>
    </>
  );
}

/* ── Dashboard shell ─────────────────────────────────────────────────────── */
function DashboardShell({ children }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileSheetOpen, setProfileSheetOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const { activeProfile, loading, user, profiles, setActiveProfile } = useStore();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    setProfileSheetOpen(false);
    await logoutUser();
    router.push(withBasePath("/login"));
  };

  if (loading || !user?.id) return null;

  return (
    <div className="dash-shell">
      {/* ── Mobile drawer (hamburger, legacy) ──────────────────────────── */}
      {drawerOpen && (
        <div
          className="dash-drawer-overlay"
          aria-modal="true"
          role="dialog"
          aria-label="Navigation menu"
          onClick={() => setDrawerOpen(false)}
        >
          <div className="dash-drawer" onClick={(e) => e.stopPropagation()}>
            <button
              className="dash-drawer-close"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close menu"
            >
              <X size={20} aria-hidden />
            </button>
            <Sidebar onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}

      {/* ── Main column ─────────────────────────────────────────────────── */}
      <div className="dash-main">

        {/* ── Desktop topbar (hidden on mobile) ─────────────────────────── */}
        <div className="dash-topbar-wrapper desktop-only">
          <header className="dash-topbar glass-panel medinest-topbar">
            <div className="dash-topbar-left">
              <Link href={withBasePath("/dashboard")} className="dash-brand-logo">
                <img
                  src="/evocare_logo.png"
                  alt="EvoCare"
                  style={{ height: "32px", width: "auto", objectFit: "contain", display: "block" }}
                />
              </Link>
              <nav className="dash-nav-horizontal" aria-label="Main navigation">
                {NAV.map(({ href, label, Icon, exact }) => {
                  const target = withBasePath(href);
                  const isActive = exact ? pathname === target : pathname.startsWith(target);
                  return (
                    <Link
                      key={label}
                      href={target}
                      className={`dash-nav-link-horiz${isActive ? " active" : ""}`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <Icon size={14} aria-hidden />
                      <span>{label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="dash-topbar-right">
              <button className="dash-bell-btn glass-btn" aria-label="Notifications">
                <Bell size={16} aria-hidden />
                <span className="dash-bell-dot" aria-hidden />
              </button>
              <div className="dash-search" role="search" aria-label="Search records">
                <Search size={15} aria-hidden />
                <input
                  type="text"
                  placeholder="Search records..."
                  className="dash-search-input"
                />
              </div>
              {/* Profile dropdown (desktop) */}
              <div className="dash-profile-menu-container">
                <button
                  className="dash-profile-btn glass-btn"
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                >
                  <div className="dash-avatar" aria-label={`Viewing ${activeProfile.name}`}>
                    {activeProfile.initial}
                  </div>
                  <div className="dash-profile-info">
                    <span className="dash-profile-name">{user.email.split("@")[0]}</span>
                    <span className="dash-profile-email">{user.email}</span>
                  </div>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                {profileMenuOpen && (
                  <div className="dash-profile-dropdown glass-card">
                    {PROFILE_MENU.map((item) => (
                      <Link
                        key={item.label}
                        href={withBasePath(item.href)}
                        className="dropdown-item"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        <item.Icon size={14} />
                        {item.label}
                      </Link>
                    ))}
                    <div className="dropdown-divider" />
                    <button
                      className="dropdown-item text-red"
                      onClick={handleLogout}
                    >
                      Log out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>
        </div>

        {/* ── Mobile topbar (hidden on desktop) ─────────────────────────── */}
        <header className="dash-topbar-mobile mobile-only glass-panel">
          <Link
            href={withBasePath("/dashboard")}
            style={{ display: "flex", alignItems: "center" }}
          >
            <img
              src="/evocare_logo.png"
              alt="EvoCare"
              style={{ height: "30px", width: "auto", objectFit: "contain" }}
            />
          </Link>
          {/* Avatar — opens the profile drawer */}
          <button
            type="button"
            onClick={() => setProfileSheetOpen(true)}
            aria-label="Open profile menu"
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              border: "none", background: "none", cursor: "pointer", padding: "4px",
            }}
          >
            <div
              style={{
                width: "34px", height: "34px", borderRadius: "50%",
                background: "var(--teal-primary)", color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "13px", fontWeight: "700",
              }}
            >
              {activeProfile.initial}
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        </header>

        {/* ── Page content ─────────────────────────────────────────────── */}
        <main className="dash-content">
          <div className="dash-content-inner">
            {children}
          </div>
        </main>
      </div>

      {/* ── Bottom navigation (mobile only) ───────────────────────────── */}
      <MobileBottomNav
        pathname={pathname}
        onProfileOpen={() => setProfileSheetOpen(true)}
      />

      {/* ── Profile slide-up drawer (mobile) ──────────────────────────── */}
      <ProfileDrawer
        open={profileSheetOpen}
        onClose={() => setProfileSheetOpen(false)}
        user={user}
        activeProfile={activeProfile}
        profiles={profiles}
        setActiveProfile={setActiveProfile}
        onLogout={handleLogout}
      />
    </div>
  );
}

export default function DashboardLayout({ children }) {
  return (
    <StoreProvider>
      <DashboardShell>{children}</DashboardShell>
    </StoreProvider>
  );
}
