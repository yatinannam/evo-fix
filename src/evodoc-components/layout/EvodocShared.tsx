"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const assets = {
  logo: "/logo.png",
  missed: "/missed.png",
  scattered: "/scattered.png",
  slow: "/slow.png",
  laptop: "/laptop.png",
  socialA: "/socialA.svg",
  socialB: "/socialB.svg",
};

function MobileMenu({ isOpen, onClose, pathname }: { isOpen: boolean; onClose: () => void; pathname?: string }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="mobile-menu-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.nav
            className="mobile-menu"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            aria-label="Mobile navigation"
          >
            <button
              className="mobile-menu-close"
              onClick={onClose}
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
            <nav className="mobile-menu-links">
              <Link href="/evodoc/about" onClick={onClose}>About Us</Link>
              <Link href="/evodoc/contact" onClick={onClose}>Contact Us</Link>
              <Link href="/evodoc/privacy" onClick={onClose}>Privacy</Link>
              <a
                href="/evodoc#faq"
                onClick={(e) => {
                  onClose();
                  if (pathname === "/evodoc") {
                    e.preventDefault();
                    document.getElementById("faq")?.scrollIntoView({ behavior: "smooth" });
                  }
                }}
              >
                FAQs
              </a>
              <Link href="/evodoc/blog" onClick={onClose}>Blogs</Link>
            </nav>
            <Link className="mobile-menu-cta" href="/evodoc#pre-register" onClick={onClose}>
              Pre-Register
            </Link>
          </motion.nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const logoHref = pathname === "/evodoc" ? "/" : "/evodoc";
  
  return (
    <>
      <header className="site-header" data-node-id="234:391">
        <Link className="logo" href={logoHref} aria-label="EvoDoc home">
          <Image src={assets.logo} alt="" width={180} height={48} />
        </Link>
        <nav className="primary-nav" aria-label="Primary navigation">
          <Link href="/evodoc/about">About Us</Link>
          <Link href="/evodoc/contact">Contact Us</Link>
          <Link href="/evodoc/privacy">Privacy</Link>
          <a
            href="/evodoc#faq"
            onClick={(e) => {
              if (pathname === "/evodoc") {
                e.preventDefault();
                document.getElementById("faq")?.scrollIntoView({ behavior: "smooth" });
              }
            }}
          >
            FAQs
          </a>
          <Link href="/evodoc/blog">Blogs</Link>
        </nav>
        <Link className="nav-cta" href="/evodoc#pre-register">
          Pre-Register
        </Link>
        <button
          className="hamburger"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          aria-expanded={menuOpen}
        >
          <Menu size={24} />
        </button>
      </header>
      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} pathname={pathname} />
    </>
  );
}

export function SiteFooter() {
  const pathname = usePathname();
  const logoHref = pathname === "/evodoc" ? "/" : "/evodoc";

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div>
          <p>
            The next generation of clinical intelligence. Empowering modern
            physicians with AI-assisted diagnostics and high-fidelity insights.
          </p>
          <p className="mt-4 text-sm opacity-70">
            <strong>EvoDoc</strong><br/>
            42 charari, Kal Bangla, Kanpur, Uttar Pradesh 208007
          </p>
          <div className="socials" aria-label="Social links">
            <a href="#" aria-label="Social profile">
              <Image src={assets.socialA} alt="Social A" width={32} height={32} />
            </a>
            <a href="#" aria-label="Social profile">
              <Image src={assets.socialB} alt="Social B" width={32} height={32} />
            </a>
          </div>
        </div>
        <nav aria-label="Footer platform links">
          <strong>Platform</strong>
          <Link href="/evodoc/about">About Us</Link>
          <Link href="/evodoc/blog">Blog</Link>
          <Link href="/evodoc#pre-register">Careers</Link>
        </nav>
        <nav aria-label="Support navigation">
          <h4>Support</h4>
          <Link href="/evodoc/privacy">Privacy Policy</Link>
          <Link href="/evodoc/contact">Contact Us</Link>
          <Link href="/evodoc#pre-register">Feedback</Link>
        </nav>
      </div>
      <div className="footer-bottom">
        <span>© 2026 EvoDoc AI. All rights reserved.</span>
        <a href="#">Privacy Policy</a>
        <a href="#">Terms of Service</a>
        <a href="#">Cookies</a>
      </div>
      <Link href={logoHref}>
        <strong className="footer-wordmark">EVODOC</strong>
      </Link>
    </footer>
  );
}
