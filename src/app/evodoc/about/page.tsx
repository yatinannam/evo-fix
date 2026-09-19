"use client";
import "./about.css";
import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import { SiteHeader, SiteFooter } from "@/evodoc-components/layout/EvodocShared";

export default function AboutPage() {
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
    <div className="about-wrapper">
      

<SiteHeader />

<main>

  {/* HERO */}
  <section className="hero">
    <div className="wrap hero-grid">
      <div>
        <span className="eyebrow">About EvoDoc</span>
        <h1>We Got Tired Of Watching Families Search A Shoebox<span> For Answers.</span></h1>
        <p className="lede">EvoDoc started as a favour — sorting one relative's reports after a scary night in an ER, three hospitals, and a file nobody could make sense of. We built the tool we wished existed. Now we're building it for every family that's ever lost a report the night it mattered most.</p>
        <div className="hero-actions">
          <a href="#story" className="btn btn-solid">See Our Story <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M7 17L17 7M17 7H9M17 7V15" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg></a>
          <a href="#founders" className="btn btn-ghost">Meet The Founders <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M7 17L17 7M17 7H9M17 7V15" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg></a>
        </div>
      </div>

      <div className="hero-visual">
        <div className="note-card card-2" aria-hidden="true"></div>
        <div className="note-card card-1">
          <span className="tag">Founder's Note</span>
          <p>"I wanted one link to send the next doctor — not seven assumptions."</p>
          <span className="who">— Where EvoDoc began</span>
        </div>
        <div className="stat-card">
          <div className="tag">Patient Timeline</div>
          <div className="num">39 documents sorted</div>
          <div className="sub">Critical history found in seconds</div>
        </div>
      </div>
    </div>
  </section>

  {/* PROBLEM */}
  <section className="section-pad">
    <div className="wrap problem-grid">
      <div className="reveal">
        <p>The best medical record system most Indian families have is a WhatsApp folder called "Papa Reports." It works — until it doesn't. Until a new doctor asks a question only the last hospital's discharge summary can answer, and that PDF is buried under two years of forwarded messages.</p>
        <p>We didn't start EvoDoc by mapping a market. We started it because we lived this — hunting through folders at midnight, re-explaining a history to every new doctor, hoping we hadn't lost the one report that mattered. Every feature we've built since has come from that same question: would this have helped, that night?</p>
      </div>
      <blockquote className="pull reveal">
        Medical records weren't meant to live in folders, inboxes, and forgotten PDFs. We think your health story deserves better than a shoebox.
        <cite>— The reason EvoDoc exists</cite>
      </blockquote>
    </div>
  </section>

  {/* STORY TIMELINE */}
  <section className="section-pad" id="story">
    <div className="wrap">
      <div className="section-head reveal">
        <span className="eyebrow">How We Got Here</span>
        <h2>Our Story, Sorted Like Everything Else We Build.</h2>
        <p>No investor deck version — just the chapters, in order.</p>
      </div>
      <div className="story-scroller reveal">
        <div className="story-card">
          <div>
            <span className="stage">Before EvoDoc</span>
            <h3>The Shoebox</h3>
          </div>
          <p>A relative's reports, scattered across three hospitals and one shoebox — none of it making sense at 11pm in an ER.</p>
        </div>
        <div className="story-card">
          <div>
            <span className="stage">Week One</span>
            <h3>The First Prototype</h3>
          </div>
          <p>A rough timeline view, built to sort one person's reports. It worked. We couldn't stop using it ourselves.</p>
        </div>
        <div className="story-card">
          <div>
            <span className="stage">Private Beta</span>
            <h3>A Few Families, Real Trust</h3>
          </div>
          <p>A handful of families let us hold their real records. That trust is still the whole product, every day since.</p>
        </div>
        <div className="story-card">
          <div>
            <span className="stage">Today</span>
            <h3>EvoDoc, Building In The Open</h3>
          </div>
          <p>Every report, prescription and scan — sorted, searchable, and ready before the doctor even asks.</p>
        </div>
      </div>
    </div>
  </section>

  {/* FOUNDERS */}
  <section className="section-pad" id="founders">
    <div className="wrap">
      <div className="section-head reveal">
        <span className="eyebrow">The People Behind It</span>
        <h2>Built By People Who've Sat In The Waiting Room Too.</h2>
        <p>EvoDoc is small on purpose — close enough to every user to still feel the problem ourselves.</p>
      </div>

      <div className="founders-grid reveal">
        <div className="founder-card">
          <div className="avatar">RJ</div>
          <h3>Raunak Jalan</h3>
          <div className="role">Founder</div>
          <p className="bio">Driven by a vision to eliminate fragmented medical history and empower families with instant access to their health records whenever it matters most.</p>
          <div className="socials">
            <a href="https://www.linkedin.com/company/evocare-in/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.22 8.75h4.56V23H.22V8.75zM8.5 8.75h4.37v1.95h.06c.61-1.15 2.1-2.36 4.32-2.36 4.62 0 5.47 3.04 5.47 7v8.66h-4.56v-7.68c0-1.83-.03-4.19-2.55-4.19-2.55 0-2.94 1.99-2.94 4.05v7.82H8.5V8.75z" fill="currentColor"/></svg></a>
          </div>
        </div>

        <div className="founder-card">
          <div className="avatar">SK</div>
          <h3>Shubh Kashyap</h3>
          <div className="role">Co-Founder</div>
          <p className="bio">Passionate about building intuitive clinical and patient tools that seamlessly connect medical history into clear, actionable timelines.</p>
          <div className="socials">
            <a href="https://www.linkedin.com/company/evocare-in/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.22 8.75h4.56V23H.22V8.75zM8.5 8.75h4.37v1.95h.06c.61-1.15 2.1-2.36 4.32-2.36 4.62 0 5.47 3.04 5.47 7v8.66h-4.56v-7.68c0-1.83-.03-4.19-2.55-4.19-2.55 0-2.94 1.99-2.94 4.05v7.82H8.5V8.75z" fill="currentColor"/></svg></a>
          </div>
        </div>
      </div>

      <div className="section-head reveal" style={{ marginTop: "72px" }}>
        <span className="eyebrow">Founding Team</span>
        <h2>The Core Builders Behind The Vision.</h2>
        <p>Dedicated engineers, designers, and operators shaping the future of clinical intelligence.</p>
      </div>

      <div className="founders-grid reveal">
        <div className="founder-card">
          <div className="avatar">AJ</div>
          <h3>Arjun Jha</h3>
          <div className="role">Founding Team</div>
          <p className="bio">Key driver behind system architecture and full-stack engineering, dedicated to building reliable and secure healthcare intelligence workflows.</p>
          <div className="socials">
            <a href="https://www.linkedin.com/company/evocare-in/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.22 8.75h4.56V23H.22V8.75zM8.5 8.75h4.37v1.95h.06c.61-1.15 2.1-2.36 4.32-2.36 4.62 0 5.47 3.04 5.47 7v8.66h-4.56v-7.68c0-1.83-.03-4.19-2.55-4.19-2.55 0-2.94 1.99-2.94 4.05v7.82H8.5V8.75z" fill="currentColor"/></svg></a>
          </div>
        </div>

        <div className="founder-card">
          <div className="avatar">SM</div>
          <h3>Sanchi Mahajan</h3>
          <div className="role">Founding Team</div>
          <p className="bio">Focused on user experience, clinical workflows, and product design, making sure every touchpoint is intuitive for doctors and patients alike.</p>
          <div className="socials">
            <a href="https://www.linkedin.com/company/evocare-in/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.22 8.75h4.56V23H.22V8.75zM8.5 8.75h4.37v1.95h.06c.61-1.15 2.1-2.36 4.32-2.36 4.62 0 5.47 3.04 5.47 7v8.66h-4.56v-7.68c0-1.83-.03-4.19-2.55-4.19-2.55 0-2.94 1.99-2.94 4.05v7.82H8.5V8.75z" fill="currentColor"/></svg></a>
          </div>
        </div>

        <div className="founder-card">
          <div className="avatar">LJ</div>
          <h3>Lakshya Jalan</h3>
          <div className="role">Founding Team</div>
          <p className="bio">Instrumental in strategic operations, growth, and cross-functional execution to bring high-fidelity clinical insights to the forefront.</p>
          <div className="socials">
            <a href="https://www.linkedin.com/company/evocare-in/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.22 8.75h4.56V23H.22V8.75zM8.5 8.75h4.37v1.95h.06c.61-1.15 2.1-2.36 4.32-2.36 4.62 0 5.47 3.04 5.47 7v8.66h-4.56v-7.68c0-1.83-.03-4.19-2.55-4.19-2.55 0-2.94 1.99-2.94 4.05v7.82H8.5V8.75z" fill="currentColor"/></svg></a>
          </div>
        </div>
      </div>
    </div>
  </section>

  {/* VALUES */}
  <section className="section-pad">
    <div className="wrap">
      <div className="section-head reveal">
        <span className="eyebrow">What We Believe</span>
        <h2>The Rules We Don't Break While Building This.</h2>
      </div>
      <div className="values-grid reveal">
        <div className="value-card">
          <div className="icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h10M4 18h13" stroke="#D9F400" strokeWidth="2" strokeLinecap="round"/></svg></div>
          <h3>No More Shoebox Medicine</h3>
          <p>Every report, prescription and scan lives in one timeline — not a drawer, not a forwarded WhatsApp chat.</p>
        </div>
        <div className="value-card">
          <div className="icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#D9F400" strokeWidth="2"/><path d="M12 7v5l3.5 2" stroke="#D9F400" strokeWidth="2" strokeLinecap="round"/></svg></div>
          <h3>Built For The 2am Question</h3>
          <p>Critical history should surface in seconds, not a search — because that's usually when you need it.</p>
        </div>
        <div className="value-card">
          <div className="icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" stroke="#D9F400" strokeWidth="2" strokeLinejoin="round"/></svg></div>
          <h3>Privacy Isn't A Checkbox</h3>
          <p>Your records stay yours. We don't sell data, and access is something you grant — not something we assume.</p>
        </div>
        <div className="value-card">
          <div className="icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M17 20v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2M10 10a4 4 0 100-8 4 4 0 000 8zM23 20v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="#D9F400" strokeWidth="2" strokeLinecap="round"/></svg></div>
          <h3>Made For Indian Families First</h3>
          <p>Multiple doctors, multiple hospitals, one family keeping track — we design around how care actually happens here.</p>
        </div>
      </div>
    </div>
  </section>

  {/* CTA */}
  <section className="cta-banner" id="preregister">
    <div className="wrap">
      <h2 className="reveal">Your Family's Story Deserves A Better Home.</h2>
      <p className="reveal">Pre-register now and get 6 months free when we launch — no shoebox required.</p>
      <div className="hero-actions reveal">
        <a href="#" className="btn btn-solid">Try Free Demo Now <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M7 17L17 7M17 7H9M17 7V15" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg></a>
        <a href="#" className="btn btn-ghost">Pre-Register Now <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M7 17L17 7M17 7H9M17 7V15" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg></a>
      </div>
    </div>
  </section>

</main>

<div className="ticker" role="marquee" aria-label="Pre-register to get 6 months free">
  <div className="ticker-track">
    <span>Pre-Register To Get 6 Months Free</span>
    <span>Built By People Who've Been There</span>
    <span>One Timeline. Every Report.</span>
    <span>Pre-Register To Get 6 Months Free</span>
    <span>Built By People Who've Been There</span>
    <span>One Timeline. Every Report.</span>
  </div>
</div>

<SiteFooter />




    </div>
  );
}
