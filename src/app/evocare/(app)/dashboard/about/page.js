'use client';

import React from 'react';
import { Rise } from "@/components/dashboard/Rise";

export default function AboutUsDashboardPage() {
  return (
    <div className="dash-grid-layout" style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
      <Rise delay={0.02}>
        <div className="dash-header-row">
          <div className="dash-greeting-area">
            <h1 className="dash-greeting-title">About EvoCare</h1>
            <p className="dash-greeting-subtitle">For the people we're really building for</p>
          </div>
        </div>
      </Rise>
      
      <Rise delay={0.08}>
        <div className="glass-card" style={{ padding: '40px', maxWidth: '800px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '700', color: 'var(--ink)', marginBottom: '24px' }}>We Built EvoCare So You Never Have To Explain It Twice.</h2>
          <p style={{ fontSize: '18px', color: 'var(--ink)', lineHeight: '1.6', marginBottom: '40px' }}>
            Every report, every prescription, every "what did the last doctor say" — kept in one gentle, private place. So you can walk into any appointment already understood, and spend less time being a filing clerk for your own health.
          </p>
          
          <h3 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--brand-deep)', marginBottom: '16px' }}>Healthcare Shouldn't Feel Like Homework.</h3>
          <p style={{ fontSize: '16px', color: 'var(--ink)', lineHeight: '1.6', marginBottom: '16px' }}>
            You know the feeling — sitting in a new doctor's office, trying to remember what the last one said, what dosage you were on, whether that scan from two years ago even matters anymore. It's exhausting, and it's not your job to remember all of it.
          </p>
          <p style={{ fontSize: '16px', color: 'var(--ink)', lineHeight: '1.6' }}>
            That's why EvoCare exists. We believe your medical history shouldn't be scattered across five different patient portals or stuffed into a physical binder you carry around. It should be yours, instantly accessible, beautifully organized, and simple enough for a tired mind to understand at 3 AM.
          </p>
        </div>
      </Rise>
    </div>
  );
}
