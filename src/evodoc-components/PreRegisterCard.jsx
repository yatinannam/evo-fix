"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Check, ArrowUpRight } from "lucide-react";
import styles from "./PreRegisterCard.module.css";
import { useSignupSubmit } from "@/evodoc-hooks/useSignupSubmit";

export default function PreRegisterCard({ source = "homepage" }) {
  const [step, setStep] = useState(1);
  const [completedStep1, setCompletedStep1] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    designation: "",
    organization: "",
    notes: "",
    updates: true,
    terms: false,
    website: "",
  });

  // Validation State
  const [errors, setErrors] = useState({});

  const { status, errorMsg, handleSubmit } = useSignupSubmit({ source });

  // Refs for focusing
  const step1FirstInput = useRef(null);
  const step2FirstInput = useRef(null);
  const formRef = useRef(null);

  // Focus management on step change
  useEffect(() => {
    if (step === 2 && step2FirstInput.current) {
      step2FirstInput.current.focus();
    }
  }, [step]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validateStep1()) {
      setCompletedStep1(true);
      setStep(2);
    }
  };

  const handleEnterKeyStep1 = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleContinue();
    }
  };

  const handleFinalSubmit = (e) => {
    e.preventDefault();
    if (!formData.terms) {
      setErrors({ terms: "You must accept the terms and conditions" });
      return;
    }

    // Map to API contract expected by useSignupSubmit
    handleSubmit({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      designation: formData.designation,
      organization: formData.organization,
      feedback: formData.notes,
      earlyAccess: formData.updates,
      termsAccepted: formData.terms,
      website: formData.website,
    });
  };

  // Animation variants
  const variants = {
    enter: (direction) => ({
      x: shouldReduceMotion ? 0 : direction > 0 ? 20 : -20,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      x: shouldReduceMotion ? 0 : direction < 0 ? 20 : -20,
      opacity: 0,
    }),
  };

  // 1 to 2 means positive direction, 2 to 1 means negative
  const direction = step === 1 ? -1 : 1;

  if (status === "success") {
    return (
      <div className={styles.cardWrap}>
        <div className={styles.card}>
          <div className={styles.success}>
            <div className={styles.successIcon}>
              <Check size={28} strokeWidth={3} />
            </div>
            <h2>You're on the list.</h2>
            <p>We'll email you the moment EvoDoc opens up. Thanks for getting in early.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.cardWrap}>
      <div className={styles.card}>
        <div className={styles.badge}>
          <span>PRE-REGISTER</span>
        </div>
        <h1 className={styles.title}>Let's get your practice set up.</h1>
        <p className={styles.sub}>Two short steps. Pre-register now and get 6 months free.</p>

        {/* Custom Tab Navigation */}
        <div className={styles.steps}>
          <div
            className={`${styles.stepTab} ${step === 1 ? styles.active : ""} ${
              completedStep1 && step !== 1 ? styles.done : ""
            }`}
            onClick={() => {
              if (completedStep1) setStep(1);
            }}
            role="button"
            tabIndex={completedStep1 && step !== 1 ? 0 : -1}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                if (completedStep1) setStep(1);
              }
            }}
            aria-current={step === 1 ? "step" : undefined}
          >
            <span className={styles.stepIndex}>01</span>
            <span className={styles.stepLabel}>Basic info</span>
          </div>
          <div
            className={`${styles.stepTab} ${step === 2 ? styles.active : ""}`}
            aria-current={step === 2 ? "step" : undefined}
          >
            <span className={styles.stepIndex}>02</span>
            <span className={styles.stepLabel}>Professional info</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className={styles.progressTrack}>
          <motion.div
            className={styles.progressFill}
            initial={false}
            animate={{ width: step === 1 ? "50%" : "100%" }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.35, ease: "easeOut" }}
          />
        </div>

        {/* Screen Reader Announcement for step changes */}
        <div aria-live="polite" className={styles.srOnly}>
          {step === 1
            ? "Step 1 of 2: Basic information"
            : "Step 2 of 2: Professional information"}
        </div>

        <form ref={formRef} className={styles.form} onSubmit={handleFinalSubmit} noValidate>
          {/* Honeypot */}
          <div className={styles.srOnly} aria-hidden="true">
            <label htmlFor="website">Website</label>
            <input
              type="text"
              id="website"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={formData.website}
              onChange={handleChange}
            />
          </div>

          {(status === "error" || errorMsg) && (
            <div className={styles.globalError} role="alert">
              {errorMsg}
            </div>
          )}

          <AnimatePresence mode="wait" custom={direction}>
            {step === 1 && (
              <motion.div
                key="step1"
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: shouldReduceMotion ? 0 : 0.25, ease: "easeInOut" }}
                className={styles.fieldset}
              >
                <div className={styles.grid2}>
                  <div className={styles.field}>
                    <label htmlFor="firstName">First name *</label>
                    <input
                      ref={step1FirstInput}
                      id="firstName"
                      name="firstName"
                      type="text"
                      className={styles.input}
                      placeholder="e.g. John"
                      value={formData.firstName}
                      onChange={handleChange}
                      onKeyDown={handleEnterKeyStep1}
                      aria-invalid={!!errors.firstName}
                      aria-describedby={errors.firstName ? "firstName-error" : undefined}
                      required
                    />
                    {errors.firstName && (
                      <div id="firstName-error" className={styles.errorText} role="alert">
                        {errors.firstName}
                      </div>
                    )}
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="lastName">Last name *</label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      className={styles.input}
                      placeholder="e.g. Doe"
                      value={formData.lastName}
                      onChange={handleChange}
                      onKeyDown={handleEnterKeyStep1}
                      aria-invalid={!!errors.lastName}
                      aria-describedby={errors.lastName ? "lastName-error" : undefined}
                      required
                    />
                    {errors.lastName && (
                      <div id="lastName-error" className={styles.errorText} role="alert">
                        {errors.lastName}
                      </div>
                    )}
                  </div>
                </div>
                <div className={styles.grid2}>
                  <div className={styles.field}>
                    <label htmlFor="email">Email address *</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      className={styles.input}
                      placeholder="you@clinic.com"
                      value={formData.email}
                      onChange={handleChange}
                      onKeyDown={handleEnterKeyStep1}
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? "email-error" : undefined}
                      required
                    />
                    {errors.email && (
                      <div id="email-error" className={styles.errorText} role="alert">
                        {errors.email}
                      </div>
                    )}
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="phone">Phone number</label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      className={styles.input}
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={handleChange}
                      onKeyDown={handleEnterKeyStep1}
                    />
                  </div>
                </div>
                <div className={styles.btnRow}>
                  <button type="button" className={styles.btnPrimary} onClick={handleContinue}>
                    Continue <ArrowUpRight aria-hidden="true" size={20} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: shouldReduceMotion ? 0 : 0.25, ease: "easeInOut" }}
                className={styles.fieldset}
              >
                <div className={styles.grid2}>
                  <div className={styles.field}>
                    <label htmlFor="designation">Designation</label>
                    <input
                      ref={step2FirstInput}
                      id="designation"
                      name="designation"
                      type="text"
                      className={styles.input}
                      placeholder="General physician"
                      value={formData.designation}
                      onChange={handleChange}
                    />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="organization">Organization</label>
                    <input
                      id="organization"
                      name="organization"
                      type="text"
                      className={styles.input}
                      placeholder="Apollo Clinic"
                      value={formData.organization}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className={styles.field}>
                  <label htmlFor="notes">Anything you'd like us to know? (optional)</label>
                  <textarea
                    id="notes"
                    name="notes"
                    className={styles.input}
                    placeholder="Tell us about your practice..."
                    value={formData.notes}
                    onChange={handleChange}
                  />
                </div>

                <label className={styles.checkboxRow} htmlFor="updates">
                  <input
                    type="checkbox"
                    id="updates"
                    name="updates"
                    checked={formData.updates}
                    onChange={handleChange}
                  />
                  <span>Keep me posted about early access and launch updates.</span>
                </label>

                <label className={styles.checkboxRow} htmlFor="terms">
                  <input
                    type="checkbox"
                    id="terms"
                    name="terms"
                    checked={formData.terms}
                    onChange={handleChange}
                    aria-invalid={!!errors.terms}
                    aria-describedby={errors.terms ? "terms-error" : undefined}
                  />
                  <span>
                    I agree to the{" "}
                    <a href="/evodoc/privacy" target="_blank" rel="noopener">
                      Terms &amp; Privacy Policy
                    </a>
                    . *
                  </span>
                </label>
                {errors.terms && (
                  <div id="terms-error" className={styles.errorText} role="alert">
                    {errors.terms}
                  </div>
                )}

                <div className={styles.btnRow}>
                  <button
                    type="button"
                    className={styles.btnGhost}
                    onClick={() => setStep(1)}
                    disabled={status === "submitting"}
                  >
                    ← Back
                  </button>
                  <button type="submit" className={styles.btnPrimary} disabled={status === "submitting"}>
                    {status === "submitting" ? "Submitting..." : "Pre-register now →"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>
    </div>
  );
}
