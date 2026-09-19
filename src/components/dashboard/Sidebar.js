"use client";
/**
 * components/dashboard/Sidebar.js
 * Left navigation sidebar for the dashboard shell.
 * onNavigate is called after link click (for closing mobile drawer).
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  FileText,
  FolderOpen,
  Pill,
  LineChart,
  Users,
  Link2,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { withBasePath } from "@/lib/basePath";
import { logoutUser } from "@/lib/api";

export const NAV = [
  { href: "/dashboard",             label: "Home",           Icon: LayoutGrid, exact: true },
  { href: "/dashboard/about",           label: "About Us",       Icon: LayoutGrid, exact: true },
  { href: "/dashboard",             label: "Upcoming",       Icon: LayoutGrid, exact: true },
  { href: "/dashboard/documents",   label: "My Docs",        Icon: FileText },
  { href: "/dashboard/medications", label: "Medications",    Icon: Pill },
  { href: "/dashboard/readings",    label: "Vitals",         Icon: LineChart },
];

export const PROFILE_MENU = [
  { href: "/dashboard/profile",     label: "Profile",          Icon: Users },
  { href: "/dashboard/readings",    label: "Health Readings",  Icon: LineChart },
  { href: "/dashboard/documents",   label: "Medical Records",  Icon: FileText },
  { href: "/dashboard/medications", label: "Medications",      Icon: Pill },
  { href: "/dashboard/circle",      label: "Circle",           Icon: Users },
  { href: "/dashboard/shared",      label: "Shared Links",     Icon: Link2 },
  { href: "/dashboard/about",       label: "About Us",         Icon: LayoutGrid },
  { href: "/dashboard/settings",    label: "Settings",         Icon: LayoutGrid },
];

export function Sidebar({ onNavigate }) {
  const pathname = usePathname();
  const { user } = useStore();

  async function handleLogout() {
    await logoutUser();
    window.location.assign(withBasePath("/login"));
  }

  return (
    <>
      {/* Brand */}
      <div className="dash-brand">
        <Link href={withBasePath("/dashboard")} className="dash-brand-logo" style={{ display: "inline-block", marginBottom: "4px" }}>
          <img src="/evocare_logo.png" alt="EvoCare" style={{ height: "30px", width: "auto", objectFit: "contain", display: "block" }} />
        </Link>
        <div className="dash-brand-sub">Personal Health Records</div>
      </div>

      {/* Nav */}
      <nav className="dash-nav" aria-label="Dashboard navigation">
        {NAV.map(({ href, label, Icon, exact }) => {
          const target = withBasePath(href);
          const isActive = exact ? pathname === target : pathname.startsWith(target);
          return (
            <Link
              key={label}
              href={target}
              onClick={onNavigate}
              className={`dash-nav-link ${isActive ? "active" : ""}`}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon size={16} aria-hidden />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="dash-sidebar-foot">
        <div className="dash-sidebar-email">{user.email}</div>
        <button className="dash-logout-btn" onClick={handleLogout}>Log out</button>
      </div>
    </>
  );
}
