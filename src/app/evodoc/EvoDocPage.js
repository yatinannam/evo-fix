"use client";

import { useState, useRef, useEffect } from "react";
import {
  ArrowUpRight,
  ChevronDown,
  Clock3,
  FileText,
  Menu,
  MessagesSquare,
  Pause,
  Play,
  Plus,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UsersRound,
  Workflow,
  X,
} from "lucide-react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  useInView,
  AnimatePresence,
} from "motion/react";
import { SiteHeader, SiteFooter } from "@/evodoc-components/layout/EvodocShared";
import PreRegisterCard from "@/evodoc-components/PreRegisterCard";
import Image from "next/image";

const assets = {
  logo: "/logo.png",
  missed: "/missed.png",
  scattered: "/scattered.png",
  slow: "/slow.png",
  laptop: "/laptop.png",
  socialA: "/socialA.svg",
  socialB: "/socialB.svg",
};

const problemCards = [
  {
    title: "Missed Context.",
    copy: "A cough today might be connected to an allergy from three years ago, buried in a file nobody has time to reopen.",
    image: assets.missed,
  },
  {
    title: "Scattered Records.",
    copy: "Years of paper, scans, and typed notes, with no single place that shows the whole story.",
    image: assets.scattered,
  },
  {
    title: "Slower Decisions.",
    copy: "Every minute spent searching for history is a minute not spent with the patient in front of you.",
    image: assets.slow,
  },
];

const featureGroups = [
  {
    title: "For Doctors",
    eyebrow: "Less Documentation. More Medicine.",
    copy: "See a patient's entire relevant history — symptoms, past prescriptions, allergies — organized into one clean timeline before you even say hello. No more flipping through decades of paper files mid-consultation.",
    items: [
      ["AI Clinical Summaries", Stethoscope],
      ["Smart Consultation Notes", FileText],
      ["Reduced Documentation Time", Clock3],
    ],
  },
  {
    title: "Clinical Intelligence",
    eyebrow: "Turn Information Into Decisions.",
    copy: "EvoDoc automatically flags dangerous drug interactions and known allergies before a prescription is written — built specifically for the reality of messy, handwritten Indian medical records.",
    items: [
      ["Diagnostic Assistance", MessagesSquare],
      ["Clinical Pathway Generation", Sparkles],
      ["Patient Context Analysis", UsersRound],
    ],
  },
  {
    title: "For Hospitals",
    eyebrow: "One Platform. Smarter Operations.",
    copy: "Give every doctor instant, structured access to a patient's full history — even decades of paper records sitting in your archive — without adding another system nobody has time to learn.",
    items: [
      ["Workflow Optimization", Workflow],
      ["Centralized Records", FileText],
      ["Resource Management", ShieldCheck],
    ],
  },
];

const workflowSteps = [
  ["Upload", "Patient or staff scans the documents.", FileText],
  ["Analyze", "We organize chronological history instantly.", Sparkles],
  ["Review", "You see a 30-second summary before the consult.", Clock3],
];

const faqs = [
  [
    "Is my patients' data safe and DPDP-compliant?",
    "Yes. EvoDoc is built to be fully compliant with India's Digital Personal Data Protection (DPDP) Act, with encrypted storage and role-based access to every record.",
  ],
  [
    "Does EvoDoc replace a doctor's clinical judgment?",
    "No. EvoDoc organizes and surfaces a patient's existing history and flags potential risks — the clinical decision always stays with you.",
  ],
  [
    "How is EvoDoc different from a normal EMR?",
    "Most EMRs store records. EvoDoc reads and understands them — turning years of scattered paper files into a single, symptom-filtered timeline automatically, without manual data entry.",
  ],
  [
    "Does EvoDoc work without a stable internet connection?",
    "Yes. EvoDoc is built to be offline-capable, so it keeps working during the connectivity gaps common in many Indian clinics.",
  ],
  [
    "What does implementation cost, and how long does it take?",
    "Implementation includes hardware setup, staff training, and digitizing your existing paper records, with a one-time setup fee plus a monthly or annual subscription per doctor. [Contact us for exact pricing.]",
  ],
];

const fadeIn = {
  hidden: { opacity: 0, y: 34 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1] },
  },
};

function Reveal({ children, className = "", delay = 0 }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      variants={reduceMotion ? undefined : fadeIn}
      initial={reduceMotion ? false : "hidden"}
      whileInView={reduceMotion ? undefined : "show"}
      viewport={{ once: true, amount: 0.24 }}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

function CtaButton({ children, tone = "solid", href = "/evodoc#pre-register" }) {
  return (
    <motion.a
      href={href}
      className={`cta cta-${tone}`}
      whileHover={{ y: -3, scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
    >
      <span>{children}</span>
      <ArrowUpRight aria-hidden="true" size={26} />
    </motion.a>
  );
}

function HeroVisual() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="hero-visual"
      initial={reduceMotion ? false : { opacity: 0, x: 56, scale: 0.96 }}
      animate={reduceMotion ? undefined : { opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
      data-node-id="234:246"
    >
      <video 
        src="/evodoc-hero-video.mp4" 
        poster="/hero-video-background.png"
        autoPlay 
        loop 
        muted 
        playsInline 
        style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
      />
    </motion.div>
  );
}

function KineticHeadline() {
  const reduceMotion = useReducedMotion();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  return (
    <div
      ref={ref}
      className={`kinetic-stage${reduceMotion ? " reduce-motion" : ""}${isInView ? " animate-once" : ""}`}
      aria-label="More searching, more understanding"
    >
      <div className="kinetic-stage-inner">
        <div className="kinetic-scribble-wrap">
          <span className="kinetic-scribble">More searching.</span>
          <span className="kinetic-strike" aria-hidden="true" />
        </div>
        <div className="kinetic-type-line">
          <span className="kinetic-type">
            More <span className="kinetic-accent">understanding.</span>
          </span>
          <span className="kinetic-cursor" aria-hidden="true" />
        </div>
        <p className="kinetic-subtext">
          Doctors lose real consultation time hunting through old files. EvoDoc gives you the
          full clinical picture in seconds, not minutes.
        </p>
      </div>
    </div>
  );
}

function ProblemSection() {
  const { scrollYProgress } = useScroll();
  const reduceMotion = useReducedMotion();
  const headingY = useTransform(scrollYProgress, [0.1, 0.34], [60, -18]);

  return (
    <section className="problem-section" id="about" data-node-id="234:209">
      <motion.div
        className="problem-sticky"
        style={reduceMotion ? undefined : { y: headingY }}
      >
        <h2>Medicine moves fast. Information doesn't.</h2>
        <p className="problem-subtext">
          Medical records weren't meant to live in folders, inboxes, and forgotten PDFs. EvoDoc brings every report, prescription, scan, and note into one living timeline.
        </p>
        <div className="problem-grid">
          {problemCards.map((card, index) => (
            <motion.article
              className="problem-card"
              key={card.title}
              initial={reduceMotion ? false : { opacity: 0, y: 60 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{
                duration: 0.7,
                delay: index * 0.12,
                ease: [0.22, 1, 0.36, 1],
              }}
              whileHover={{ y: -8 }}
            >
              <Image src={card.image} alt="" width={800} height={600} />
              <div className="problem-overlay" />
              <div className="problem-copy">
                <h3>{card.title}</h3>
                <p>{card.copy}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

function FeatureGroup({ group, index }) {
  return (
    <Reveal className="feature-group" delay={index * 0.06}>
      <div>
        <h3>{group.title}</h3>
        <p className="feature-eyebrow">{group.eyebrow}</p>
        <p>{group.copy}</p>
      </div>
      <p className="key-benefits-label">Key Benefits</p>
      <div className="benefit-grid">
        {group.items.map(([label, Icon]) => (
          <motion.div
            className="benefit"
            key={label}
            whileHover={{ y: -5, borderColor: "#d6f303" }}
          >
            <Icon aria-hidden="true" size={28} />
            <span>{label}</span>
          </motion.div>
        ))}
      </div>
    </Reveal>
  );
}

/* -- Demo video â€” lazy-loads on scroll, play/pause button overlay -- */
function DemoVideo() {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const reduceMotion = useReducedMotion();
  const isInView = useInView(containerRef, { amount: 0.2 });

  // Step 1: mark sources ready once section scrolls into view
  useEffect(() => {
    if (isInView && !isLoaded) setIsLoaded(true);
  }, [isInView, isLoaded]);

  // Step 2: CRITICAL â€” call video.load() after <source> elements are injected
  // Dynamically added sources are NOT picked up without this call
  useEffect(() => {
    if (isLoaded && videoRef.current) {
      videoRef.current.load();
    }
  }, [isLoaded]);

  // Auto-pause when scrolled out of view (manual resume only)
  useEffect(() => {
    if (!isInView && isPlaying) {
      videoRef.current?.pause();
      setIsPlaying(false);
    }
  }, [isInView]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup on unmount
  useEffect(() => {
    return () => { videoRef.current?.pause(); };
  }, []);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setIsPlaying(true); }
    else { v.pause(); setIsPlaying(false); }
  };

  return (
    <>
      <div className="video-placeholder" ref={containerRef}>
        <video
          ref={videoRef}
          className="demo-video"
          playsInline
          preload="none"
          onEnded={() => setIsPlaying(false)}
          aria-label="EvoDoc product demo"
        >
          {isLoaded && (
            <>
              <source src="/evodoc-demo-video.mp4" type="video/mp4" />
            </>
          )}
        </video>
      </div>

      {/* Overlay — outside video-placeholder so it isn't trapped under the bezel's z-index */}
      <div
        className="demo-video-overlay"
        style={{
          opacity: isPlaying ? 0 : 1,
          pointerEvents: isPlaying ? "none" : "auto",
          transition: reduceMotion ? "none" : "opacity 0.25s ease",
        }}
        onClick={toggle}
      >
        <button
          className="demo-video-play-btn"
          type="button"
          tabIndex={isPlaying ? -1 : 0}
          aria-label={isPlaying ? "Pause demo" : "Play demo"}
          onClick={(e) => { e.stopPropagation(); toggle(); }}
        >
          {isPlaying
            ? <Pause size={26} aria-hidden="true" />
            : <Play  size={26} aria-hidden="true" />}
        </button>
      </div>
    </>
  );
}

function ProductSection() {
  const layoutRef = useRef(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: layoutRef,
    offset: ["start start", "end end"],
  });

  return (
    <section className="product-section" id="features">
      {/* Background marquee */}
      <div className="bg-marquee" aria-hidden="true">
        <span className="bg-marquee-track">
          Introducing EVODOC&nbsp;&nbsp;&nbsp;&middot;&nbsp;&nbsp;&nbsp;Introducing
          EVODOC&nbsp;&nbsp;&nbsp;&middot;&nbsp;&nbsp;&nbsp;Introducing
          EVODOC&nbsp;&nbsp;&nbsp;&middot;&nbsp;&nbsp;&nbsp;Introducing
          EVODOC&nbsp;&nbsp;&nbsp;&middot;&nbsp;&nbsp;&nbsp;
        </span>
      </div>

      <Reveal className="product-title">
        <h2>Introducing EVODOC</h2>
      </Reveal>


      <div className="product-layout" ref={layoutRef}>
        {/* Left column — sticky laptop */}
        <div className="laptop-stage">
          <div className="laptop-frame">
            <Image src={assets.laptop} alt="EvoDoc dashboard showing an AI-generated patient overview timeline." width={3846} height={2344} priority />
            {/* Demo video — lazy loaded, custom play/pause */}
            <DemoVideo />
          </div>
          <div className="product-actions">
            <CtaButton href="/evodoc/demo">Try Free Demo Now</CtaButton>
          </div>
        </div>

        {/* Right column â€” scrolling feature text */}
        <div className="feature-list">
          {featureGroups.map((group, index) => (
            <FeatureGroup group={group} index={index} key={group.title} />
          ))}
        </div>
      </div>
    </section>
  );
}

function WorkflowSection() {
  return (
    <section className="workflow-section" id="collaborate">
      <Reveal className="section-copy">
        <h2>It Fits Quietly Into Your Workflow</h2>
        <p>No data entry. No complex training. It just works.</p>
      </Reveal>
      <div className="workflow-cards">
        {workflowSteps.map(([title, copy, Icon], index) => (
          <Reveal className="workflow-card" delay={index * 0.08} key={title}>
            <div className="workflow-card-icon">
              <Icon aria-hidden="true" size={34} />
            </div>
            <div className="workflow-card-body">
              <h3>{title}</h3>
              <p>{copy}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function FaqSection() {
  const [open, setOpen] = useState(0);

  return (
    <section className="faq-section" id="faq" data-node-id="234:376">
      <Reveal className="faq-heading">
        <h2>Questions. Answered.</h2>
        <p>
          Everything you need to know about architecture, security, and clinical
          integration.
        </p>
      </Reveal>
      <div className="faq-list">
        {faqs.map(([question, answer], index) => {
          const expanded = open === index;
          return (
            <motion.article className="faq-item" key={`${question}-${index}`}>
              <button
                type="button"
                aria-expanded={expanded}
                onClick={() => setOpen(expanded ? -1 : index)}
              >
                <span>{question}</span>
                <motion.span
                  className="faq-icon"
                  animate={{ rotate: expanded ? 45 : 0 }}
                >
                  <Plus size={20} aria-hidden="true" />
                </motion.span>
              </button>
              <motion.div
                className="faq-answer"
                initial={false}
                animate={{
                  height: expanded ? "auto" : 0,
                  opacity: expanded ? 1 : 0,
                }}
                transition={{ duration: 0.28, ease: "easeOut" }}
              >
                <p>{answer}</p>
              </motion.div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}

function PreRegisterSection() {
  return (
    <section id="pre-register" className="pr-section">
      <div className="pr-headerWrapper">
        <h2 className="pr-headerTitle">Get Started with EvoDoc</h2>
        <p className="pr-headerSubtitle">
          AI-powered clinical documentation built for modern healthcare professionals.
        </p>
        <img
          src="/prereg.png"
          alt="EvoDoc Pre-register"
          className="pr-hero-illustration"
          style={{ marginTop: "3rem", width: "100%", maxWidth: "420px", height: "auto", display: "block" }}
        />
      </div>

      {/* Card outer — takes remaining space on desktop, stacks on mobile */}
      <div style={{ flex: "1 1 0", minWidth: 0, display: "flex", justifyContent: "flex-start", width: "100%" }}>
        <PreRegisterCard source="homepage" />
      </div>
    </section>
  );
}



export default function EvoDocContent({ nonce }) {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash === "#faq") {
      setTimeout(() => {
        document.getElementById("faq")?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    }
  }, []);

  const schemaData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "name": "EvoDoc",
        "logo": "https://evodoc.in/logo.png",
        "sameAs": ["https://www.linkedin.com/company/evodoc", "https://twitter.com/evodoc"]
      },
      {
        "@type": "SoftwareApplication",
        "name": "EvoDoc",
        "applicationCategory": "MedicalApplication"
      },
      {
        "@type": "FAQPage",
        "mainEntity": faqs.map(([q, a]) => ({
          "@type": "Question",
          "name": q,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": a
          }
        }))
      }
    ]
  };

  return (
    <main id="top" className="page-shell" data-node-id="234:207">
      <script
        type="application/ld+json"
        nonce={nonce}
        // See app/layout.tsx — browsers clear the nonce DOM property after
        // use, which otherwise reads as a false-positive hydration mismatch.
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      <SiteHeader />

      <section className="hero-section">
        <motion.div
          className="hero-copy"
          initial={reduceMotion ? false : { opacity: 0, y: 34 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >

          <KineticHeadline />
          <div className="hero-actions">
            <CtaButton href="/evodoc/demo">Try Free Demo Now</CtaButton>
            <CtaButton tone="outline" href="#pre-register">Pre-Register Now</CtaButton>
          </div>
        </motion.div>
        <HeroVisual />
      </section>

      <div className="promo-strip">
        <div className="promo-strip-track">
          <span>PRE-REGISTER TO GET 6 MONTHS FREE</span>
          <span>PRE-REGISTER TO GET 6 MONTHS FREE</span>
          <span>PRE-REGISTER TO GET 6 MONTHS FREE</span>
          <span>PRE-REGISTER TO GET 6 MONTHS FREE</span>
          <span>PRE-REGISTER TO GET 6 MONTHS FREE</span>
          <span>PRE-REGISTER TO GET 6 MONTHS FREE</span>
          <span>PRE-REGISTER TO GET 6 MONTHS FREE</span>
          <span>PRE-REGISTER TO GET 6 MONTHS FREE</span>
        </div>
      </div>

      <ProblemSection />
      <ProductSection />
      <WorkflowSection />
      <FaqSection />
      <PreRegisterSection />
      <SiteFooter />

      <a className="floating-register" href="#pre-register">
        <span>Pre-Register</span>
        <ChevronDown aria-hidden="true" size={16} />
      </a>
    </main>
  );
}

