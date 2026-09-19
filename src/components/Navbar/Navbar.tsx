'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollYRef = useRef(0);
  const tickingRef = useRef(false);

  useEffect(() => {
    const updateVisibility = () => {
      const currentScrollY = window.scrollY;
      const shouldHide = currentScrollY > lastScrollYRef.current && currentScrollY > 100;
      setIsVisible(prev => (prev === !shouldHide ? prev : !shouldHide));
      lastScrollYRef.current = currentScrollY;
      tickingRef.current = false;
    };

    lastScrollYRef.current = window.scrollY;

    const handleScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      requestAnimationFrame(updateVisibility);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      tickingRef.current = false;
    };
  }, []);

  return (
    <nav className={`${styles.nav} ${isVisible ? '' : styles.navHidden}`} id="navbar">
      {/* Logo */}
      <Link href="/" className={styles.logo} aria-label="EvoDoc Home">
        <Image
          src="/logo.png"
          alt="EvoDoc"
          width={180}
          height={48}
          className={styles.logoImg}
          priority
        />
      </Link>

      {/* Desktop Nav Links */}
      <ul className={styles.links} role="list">
        <li><a href="/evodoc/about" className={styles.link}>About Us</a></li>
        <li><a href="/blog" className={styles.link}>Blogs</a></li>
        <li><a href="/evodoc/contact" className={styles.link}>Contact Us</a></li>
        <li><a href="/evodoc" className={`${styles.link} ${styles.linkEvoDoc}`}>EvoDoc</a></li>
        <li><a href="/evocare" className={`${styles.link} ${styles.linkEvoCare}`}>EvoCare</a></li>
      </ul>


      {/* Mobile hamburger */}
      <button
        className={`${styles.burger} ${open ? styles.burgerOpen : ''}`}
        onClick={() => setOpen(v => !v)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
      >
        <span /><span /><span />
      </button>

      {/* Mobile drawer */}
      <div className={`${styles.drawer} ${open ? styles.drawerOpen : ''}`} aria-hidden={!open}>
        <ul role="list">
          <li><a href="/evodoc/about"   className={styles.drawerLink} onClick={() => setOpen(false)}>About Us</a></li>
          <li><a href="/blog"   className={styles.drawerLink} onClick={() => setOpen(false)}>Blogs</a></li>
          <li><a href="/evodoc/contact" className={styles.drawerLink} onClick={() => setOpen(false)}>Contact Us</a></li>
          <li><a href="/evodoc"  className={`${styles.drawerLink} ${styles.drawerLinkEvoDoc}`}  onClick={() => setOpen(false)}>EvoDoc</a></li>
          <li><a href="/evocare" className={`${styles.drawerLink} ${styles.drawerLinkEvoCare}`} onClick={() => setOpen(false)}>EvoCare</a></li>
        </ul>
      </div>
    </nav>
  );
}
