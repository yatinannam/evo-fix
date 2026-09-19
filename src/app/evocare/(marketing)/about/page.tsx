'use client';
import "./about.css";
import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";

export default function EvoCareAboutPage() {
  useEffect(() => {
    const items = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.15 });
    items.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="evocare-about-wrapper">
      

<header className="nav">
  <div className="nav-inner">
    <a href="/evocare" className="logo"><Image src="/evocare_logo.png" alt="EvoCare" width={110} height={30} style={{objectFit:"contain"}}/></a>
    <nav className="links">
      <a href="/evocare/about" className="active">About Us</a>
      <a href="/evodoc/contact">Contact Us</a>
      <a href="/evocare#upcoming-features">Features</a>
    </nav>
    <div style={{display:"flex", alignItems:"center", gap:"12px"}}>
      <a href="/evocare/login" className="btn btn-outline" style={{padding:"10px 18px", fontSize:"13.5px"}}>Login/ Sign up</a>
      <button className="menu-toggle" aria-label="Open menu">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
      </button>
    </div>
  </div>
</header>

<main>

  {/* HERO */}
  <section className="hero">
    <div className="wrap">
      <span className="eyebrow-pill">EvoCare</span>
      <span className="eyebrow-text">About EvoCare — for the people we're really building for</span>
      <h1>We Built EvoCare So You Never Have To Explain It Twice.</h1>
      <p className="lede">Every report, every prescription, every "what did the last doctor say" — kept in one gentle, private place. So you can walk into any appointment already understood, and spend less time being a filing clerk for your own health.</p>
      <div className="hero-actions">
        <a href="/evocare/login" className="btn btn-solid">Get Started For Free <span className="arrow"><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M7 17L17 7M17 7H9M17 7V15" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg></span></a>
        <a href="#founders" className="btn btn-outline">Meet The People Behind It <span className="arrow"><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M7 17L17 7M17 7H9M17 7V15" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg></span></a>
      </div>
    </div>

    <svg className="blob-divider" viewBox="0 0 1440 90" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0,90 L0,50 C 120,-10 260,80 420,45 C 620,0 760,90 960,40 C 1140,0 1300,80 1440,45 L1440,90 Z"></path>
    </svg>
  </section>

  {/* DEVICE VISUAL */}
  <section className="device-section">
    <div className="device-frame reveal">
      <div className="device-bezel">
        <div className="device-screen">
          <div className="screen-header">
            <span className="tag">Your Timeline</span>
            <div className="avatar-dot"></div>
          </div>

          <div className="screen-row active">
            <div className="screen-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M9 12l2 2 4-4" stroke="#3E9DF7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="9" stroke="#3E9DF7" strokeWidth="2"/></svg></div>
            <div className="screen-lines"><div className="line w1"></div><div className="line w2"></div></div>
          </div>
          <div className="screen-row">
            <div className="screen-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h10M4 18h13" stroke="#3E9DF7" strokeWidth="2" strokeLinecap="round"/></svg></div>
            <div className="screen-lines"><div className="line w1"></div><div className="line w2"></div></div>
          </div>
          <div className="screen-row">
            <div className="screen-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" stroke="#3E9DF7" strokeWidth="2" strokeLinejoin="round"/></svg></div>
            <div className="screen-lines"><div className="line w1"></div><div className="line w2"></div></div>
          </div>
          <div className="screen-row">
            <div className="screen-icon"><svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#3E9DF7" strokeWidth="2"/><path d="M12 7v5l3.5 2" stroke="#3E9DF7" strokeWidth="2" strokeLinecap="round"/></svg></div>
            <div className="screen-lines"><div className="line w1"></div><div className="line w2"></div></div>
          </div>
        </div>
      </div>
    </div>
  </section>

  {/* WHY WE BUILT THIS */}
  <section className="section-pad">
    <div className="wrap">
      <div className="section-head reveal">
        <span className="eyebrow-pill">Why EvoCare</span>
        <h2>Healthcare Shouldn't Feel Like Homework.</h2>
      </div>
      <div className="why-grid">
        <div className="reveal">
          <p>You know the feeling — sitting in a new doctor's office, trying to remember what the last one said, what dosage you were on, whether that scan from two years ago even matters anymore. It's exhausting, and it's not your job to remember all of it.</p>
          <p>EvoCare exists so that part gets easier. Upload a report once, and it's there — organized, searchable, and ready to hand over the next time someone asks "so what's the history here?" No more digging through old messages the night before an appointment.</p>
        </div>
        <div className="quote-card reveal">
          <p>"I stopped dreading appointments once I stopped having to remember everything for them."</p>
          <cite>— How families describe using EvoCare</cite>
        </div>
      </div>
    </div>
  </section>

  {/* STORY */}
  <section className="story-strip section-pad">
    <div className="wrap">
      <div className="section-head reveal">
        <span className="eyebrow-pill">Our Story</span>
        <h2>A Small Team, A Very Personal Problem.</h2>
        <p>No grand plan — just people who got tired of losing track of what mattered.</p>
      </div>
      <div className="story-list reveal">
        <div className="story-item">
          <span className="stage">Where It Started</span>
          <h3>A Folder Full Of Papers</h3>
          <p>Reports from three hospitals, none of them talking to each other — sound familiar?</p>
        </div>
        <div className="story-item">
          <span className="stage">The First Try</span>
          <h3>One Simple Timeline</h3>
          <p>Built to sort one person's records. We haven't stopped using it since.</p>
        </div>
        <div className="story-item">
          <span className="stage">Early Days</span>
          <h3>A Few Families, Real Trust</h3>
          <p>The first people who used EvoCare trusted us with something personal. We still don't take that lightly.</p>
        </div>
        <div className="story-item">
          <span className="stage">Now</span>
          <h3>EvoCare, For Everyone</h3>
          <p>The same simple idea, built for every family juggling more doctors than they'd like.</p>
        </div>
      </div>
    </div>
  </section>

  {/* FOUNDERS */}
  <section className="section-pad" id="founders">
    <div className="wrap">
      <div className="section-head reveal">
        <span className="eyebrow-pill">The People Behind It</span>
        <h2>Built By People Who've Sat In The Waiting Room Too.</h2>
        <p>We're a small team — close enough to the problem to still feel it ourselves.</p>
      </div>
      <div className="founders-grid reveal">
        <div className="founder-card">
          <div className="avatar">RJ</div>
          <h3>Raunak Jalan</h3>
          <div className="role">Founder</div>
          <p className="bio">Driven by a vision to eliminate fragmented medical history and empower families with instant access to their health records whenever it matters most.</p>
        </div>
        <div className="founder-card">
          <div className="avatar">SK</div>
          <h3>Shubh Kashyap</h3>
          <div className="role">Co-Founder</div>
          <p className="bio">Passionate about building intuitive clinical and patient tools that seamlessly connect medical history into clear, actionable timelines.</p>
        </div>
      </div>

      <div className="section-head reveal" style={{ marginTop: "72px" }}>
        <span className="eyebrow-pill">Founding Team</span>
        <h2>The Core Builders Behind The Vision.</h2>
        <p>Dedicated engineers, designers, and operators shaping the future of family health records.</p>
      </div>

      <div className="founders-grid reveal">
        <div className="founder-card">
          <div className="avatar">AJ</div>
          <h3>Arjun Jha</h3>
          <div className="role">Founding Team</div>
          <p className="bio">Key driver behind system architecture and full-stack engineering, dedicated to building reliable and secure healthcare intelligence workflows.</p>
        </div>
        <div className="founder-card">
          <div className="avatar">SM</div>
          <h3>Sanchi Mahajan</h3>
          <div className="role">Founding Team</div>
          <p className="bio">Focused on user experience, clinical workflows, and product design, making sure every touchpoint is intuitive for doctors and patients alike.</p>
        </div>
        <div className="founder-card">
          <div className="avatar">LJ</div>
          <h3>Lakshya Jalan</h3>
          <div className="role">Founding Team</div>
          <p className="bio">Instrumental in strategic operations, growth, and cross-functional execution to bring high-fidelity clinical insights to the forefront.</p>
        </div>
      </div>
    </div>
  </section>

  {/* THREE PROMISES */}
  <section className="section-pad" style={{background:"#FAFCFF", borderTop:"1px solid #F0F0F0", borderBottom:"1px solid #F0F0F0"}}>
    <div className="wrap">
      <div className="section-head reveal">
        <span className="eyebrow-pill">What You Can Count On</span>
        <h2>Three Promises. Kept Quietly.</h2>
        <p>Upload once. Stay organized effortlessly. Share only when you choose to.</p>
      </div>
      <div className="promise-grid reveal">
        <div className="promise-card">
          <div className="promise-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" stroke="#3E9DF7" strokeWidth="2" strokeLinejoin="round"/></svg></div>
          <h3>Your Data Stays Yours</h3>
          <p>We don't sell it, and we don't share it without you saying so, plainly and clearly.</p>
        </div>
        <div className="promise-card">
          <div className="promise-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M9 12l2 2 4-4" stroke="#3E9DF7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="9" stroke="#3E9DF7" strokeWidth="2"/></svg></div>
          <h3>You're Always In Control</h3>
          <p>Choose exactly who sees what — a doctor, a family member, or just you.</p>
        </div>
        <div className="promise-card">
          <div className="promise-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#3E9DF7" strokeWidth="2"/><path d="M12 7v5l3.5 2" stroke="#3E9DF7" strokeWidth="2" strokeLinecap="round"/></svg></div>
          <h3>Ready When You Need It</h3>
          <p>No digging, no guessing — your history's there in seconds, exactly when it matters most.</p>
        </div>
      </div>
    </div>
  </section>

  {/* CTA */}
  <section className="cta-section" id="cta">
    <div className="cta-inner wrap">
      <h2 className="reveal">You Shouldn't Have To Remember It All Alone.</h2>
      <p className="reveal">Get started for free and see what a little organization can do for the next appointment.</p>
      <div className="hero-actions reveal">
        <a href="/evocare/login" className="btn btn-solid">Get Started For Free <span className="arrow"><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M7 17L17 7M17 7H9M17 7V15" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg></span></a>
        <a href="#" className="btn btn-outline">Watch How It Works <span className="arrow"><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M7 17L17 7M17 7H9M17 7V15" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg></span></a>
      </div>
    </div>
  </section>

</main>

<footer>
  <div className="wrap">
    <div className="footer-grid">
      <a href="/evocare" className="logo"><Image src="/evocare_logo.png" alt="EvoCare" width={110} height={30} style={{objectFit:"contain"}}/></a>
      <div className="footer-links">
        <a href="/evocare/about">About Us</a>
        <a href="/evodoc/contact">Contact Us</a>
        <a href="/evocare#upcoming-features">Features</a>
      </div>
    </div>
    <div className="footer-bottom">
      <span>© 2026 EvoCare, by EvoDoc.</span>
      <span>Made for families who deserve to be understood.</span>
    </div>
  </div>
</footer>




    </div>
  );
}
