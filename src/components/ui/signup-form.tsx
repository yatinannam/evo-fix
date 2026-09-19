"use client";
import React from "react";

export default function FeedbackForm() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    height: '52px',
    background: '#171717',
    border: 'none',
    borderRadius: '8px',
    padding: '0 20px',
    color: '#ffffff',
    fontFamily: "'Inter', sans-serif",
    fontSize: '15px',
    outline: 'none',
    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)',
  };

  return (
    <div style={{
      background: '#101010',
      borderRadius: '20px',
      padding: '48px',
      width: '100%',
      boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
    }}>
      {/* Title */}
      <h3 style={{
        fontFamily: "'Raleway', sans-serif",
        fontSize: '48px',
        fontWeight: 800,
        lineHeight: 1.1,
        color: '#D6F303',
        marginBottom: '16px',
      }}>
        Help Us Build the future.
      </h3>

      {/* Subtitle */}
      <p style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: '15px',
        color: '#999999',
        lineHeight: 1.5,
        marginBottom: '32px',
      }}>
        Everything you need to know about architecture, security, and clinical integration.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Name */}
        <input
          type="text"
          placeholder="Name *"
          required
          style={inputStyle}
          onFocus={e => (e.target.style.boxShadow = 'inset 0 0 0 1px rgba(214,243,3,0.4)')}
          onBlur={e => (e.target.style.boxShadow = 'inset 0 0 0 1px rgba(255,255,255,0.06)')}
        />

        {/* Email */}
        <input
          type="email"
          placeholder="Email *"
          required
          style={inputStyle}
          onFocus={e => (e.target.style.boxShadow = 'inset 0 0 0 1px rgba(214,243,3,0.4)')}
          onBlur={e => (e.target.style.boxShadow = 'inset 0 0 0 1px rgba(255,255,255,0.06)')}
        />

        {/* Dropdown */}
        <div style={{ position: 'relative' }}>
          <select
            defaultValue=""
            style={{
              ...inputStyle,
              appearance: 'none',
              cursor: 'pointer',
              paddingRight: '40px',
            }}
            onFocus={e => (e.target.style.boxShadow = 'inset 0 0 0 1px rgba(214,243,3,0.4)')}
            onBlur={e => (e.target.style.boxShadow = 'inset 0 0 0 1px rgba(255,255,255,0.06)')}
          >
            <option value="" disabled hidden>Optional details for feedback (if you have time)</option>
            <option value="feature" style={{ background: '#171717' }}>Feature Request</option>
            <option value="bug" style={{ background: '#171717' }}>Bug Report</option>
            <option value="integration" style={{ background: '#171717' }}>Clinical EHR Integration</option>
            <option value="other" style={{ background: '#171717' }}>Other Feedback</option>
          </select>
          <svg
            style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            width="16" height="16" viewBox="0 0 24 24" fill="none"
          >
            <path d="M6 9l6 6 6-6" stroke="#D6F303" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Submit */}
        <button
          type="submit"
          style={{
            width: '100%',
            height: '52px',
            background: '#D6F303',
            border: 'none',
            borderRadius: '8px',
            color: '#111111',
            fontFamily: "'Inter', sans-serif",
            fontSize: '16px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginTop: '8px',
            transition: 'opacity 0.2s ease',
          }}
          onMouseEnter={e => ((e.target as HTMLButtonElement).style.opacity = '0.9')}
          onMouseLeave={e => ((e.target as HTMLButtonElement).style.opacity = '1')}
        >
          Share your Feedback
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </form>
    </div>
  );
}
