'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getEmpDashBrowserClient } from '@/lib/supabase/client';
import '../emp-dash.css';

export default function EmpDashLoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = getEmpDashBrowserClient();
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      router.replace('/emp-dash');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div data-empdash style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse at 30% 0%, #ffedd5 0%, #fff7f0 35%, #f9f6ff 70%, #fdf4ff 100%)',
      fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative blobs */}
      <div style={{ position:'absolute', top:'-80px', right:'-80px', width:'400px', height:'400px', borderRadius:'50%', background:'radial-gradient(circle, rgba(249,115,22,0.12), transparent 70%)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:'-60px', left:'-60px', width:'350px', height:'350px', borderRadius:'50%', background:'radial-gradient(circle, rgba(244,63,94,0.1), transparent 70%)', pointerEvents:'none' }} />

      <div className="ed-fade-up" style={{ width:'100%', maxWidth:'420px', position:'relative', zIndex:1 }}>
        {/* Brand mark */}
        <div style={{ textAlign:'center', marginBottom:'32px' }}>
          <div style={{
            display:'inline-flex', alignItems:'center', justifyContent:'center',
            width:'52px', height:'52px', borderRadius:'16px', marginBottom:'16px',
            background:'linear-gradient(135deg, #f97316, #f43f5e)',
            boxShadow:'0 8px 24px rgba(249,115,22,0.3)',
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z"/>
              <path d="M12 12h.01M8 12h.01M16 12h.01"/>
            </svg>
          </div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', marginBottom:'8px' }}>
            <span style={{ fontWeight:700, fontSize:'18px', color:'#111', letterSpacing:'-0.3px' }}>EvoDoc</span>
            <span style={{ fontSize:'11px', fontWeight:600, padding:'2px 8px', borderRadius:'20px', background:'linear-gradient(135deg,#fff7ed,#fff1f2)', color:'#f97316', border:'1px solid rgba(249,115,22,0.2)' }}>Internal</span>
          </div>
          <h1 style={{ fontSize:'26px', fontWeight:700, color:'#111', letterSpacing:'-0.5px', marginBottom:'6px' }}>Employee Portal</h1>
          <p style={{ fontSize:'14px', color:'#9ca3af' }}>Sign in to access your workspace</p>
        </div>

        {/* Card */}
        <div className="ed-card" style={{ padding:'32px', borderRadius:'20px' }}>
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
            <div>
              <label htmlFor="email" style={{ display:'block', fontSize:'13px', fontWeight:600, color:'#374151', marginBottom:'8px' }}>
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={loading}
                placeholder="you@evodoc.in"
                style={{ opacity: loading ? 0.6 : 1 }}
              />
            </div>

            <div>
              <label htmlFor="password" style={{ display:'block', fontSize:'13px', fontWeight:600, color:'#374151', marginBottom:'8px' }}>
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={loading}
                placeholder="••••••••"
                style={{ opacity: loading ? 0.6 : 1 }}
              />
            </div>

            {error && (
              <div role="alert" style={{
                padding:'12px 16px', borderRadius:'12px',
                background:'#fff1f2', border:'1px solid #fecdd3',
                color:'#e11d48', fontSize:'13px', display:'flex', alignItems:'center', gap:'8px',
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              id="emp-login-submit"
              disabled={loading}
              className="ed-btn-primary"
              style={{ width:'100%', padding:'12px', fontSize:'15px', borderRadius:'12px', marginTop:'4px' }}
            >
              {loading ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation:'spin 0.8s linear infinite' }}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </>
              )}
            </button>
          </form>
        </div>

        <p style={{ textAlign:'center', fontSize:'12px', color:'#9ca3af', marginTop:'20px', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0 }}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          No public sign-up. Contact your Admin to get access.
        </p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
        @keyframes spin { to { transform:rotate(360deg); } }
      `}</style>
    </div>
  );
}
