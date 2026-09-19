import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>

      {/* ── Main content ── */}
      <div className={styles.inner}>

        {/* Left: description + socials */}
        <div className={styles.brand}>
          <p className={styles.tagline}>
            The next generation of clinical intelligence.<br />
            Empowering modern physicians with AI-assisted<br />
            diagnostics and high-fidelity insights.
          </p>

          <div className={styles.socials}>
            {/* X / Twitter */}
            <a href="#" className={styles.socialLink} aria-label="X (Twitter)">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            {/* LinkedIn */}
            <a href="#" className={styles.socialLink} aria-label="LinkedIn">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Nav columns */}
        <nav className={styles.nav} aria-label="Footer navigation">
          <div className={styles.column}>
            <h4 className={styles.colHead}>Platform</h4>
            <ul>
              <li><a href="/evodoc/about">About Us</a></li>
              <li><a href="#">Log In</a></li>
            </ul>
          </div>

          <div className={styles.column}>
            <h4 className={styles.colHead}>Connect</h4>
            <ul>
              <li><a href="#">About Founder</a></li>
              <li><a href="/evodoc/contact">Contact Us</a></li>
              <li><a href="#">Feedback</a></li>
            </ul>
          </div>
        </nav>
      </div>

      {/* ── Divider ── */}
      <div className={styles.divider} />

      {/* ── Bottom bar ── */}
      <div className={styles.bottomBar}>
        <span className={styles.copy}>© 2026 EvoDoc AI. All rights reserved.</span>
        <div className={styles.bottomLinks}>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Cookies</a>
        </div>
      </div>

      {/* ── Watermark ── */}
      <div className={styles.watermark} aria-hidden="true">EVODOC</div>

    </footer>
  );
}
