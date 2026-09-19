'use client';

import React from 'react';
import { Rise } from "@/components/dashboard/Rise";

export default function SettingsPage() {
  return (
    <div className="dash-grid-layout" style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
      <Rise delay={0.02}>
        <div className="dash-header-row">
          <div className="dash-greeting-area">
            <h1 className="dash-greeting-title">Settings</h1>
            <p className="dash-greeting-subtitle">Manage your account and preferences</p>
          </div>
        </div>
      </Rise>
      
      <Rise delay={0.08}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          
          {/* Notifications Card */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--ink)', marginBottom: '16px' }}>Notifications</h3>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ fontSize: '14px', color: 'var(--ink)' }}>Email Alerts</span>
              <div style={{ width: '40px', height: '24px', background: 'var(--brand-deep)', borderRadius: '12px', position: 'relative' }}>
                <div style={{ width: '20px', height: '20px', background: 'white', borderRadius: '50%', position: 'absolute', right: '2px', top: '2px' }}></div>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ fontSize: '14px', color: 'var(--ink)' }}>SMS Reminders</span>
              <div style={{ width: '40px', height: '24px', background: 'var(--brand-deep)', borderRadius: '12px', position: 'relative' }}>
                <div style={{ width: '20px', height: '20px', background: 'white', borderRadius: '50%', position: 'absolute', right: '2px', top: '2px' }}></div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '14px', color: 'var(--ink)' }}>Marketing Emails</span>
              <div style={{ width: '40px', height: '24px', background: 'rgba(0,0,0,0.1)', borderRadius: '12px', position: 'relative' }}>
                <div style={{ width: '20px', height: '20px', background: 'white', borderRadius: '50%', position: 'absolute', left: '2px', top: '2px' }}></div>
              </div>
            </div>
          </div>

          {/* Privacy & Security Card */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--ink)', marginBottom: '16px' }}>Privacy & Security</h3>
            
            <button className="secondary-btn" style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.02)', color: 'var(--ink)', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', fontWeight: '500', marginBottom: '12px' }}>
              Change Password
            </button>
            <button className="secondary-btn" style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.02)', color: 'var(--ink)', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', fontWeight: '500', marginBottom: '12px' }}>
              Two-Factor Authentication
            </button>
            <button className="secondary-btn" style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.02)', color: 'var(--ink)', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', fontWeight: '500' }}>
              Manage Trusted Devices
            </button>
          </div>

          {/* App Preferences Card */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--ink)', marginBottom: '16px' }}>App Preferences</h3>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ fontSize: '14px', color: 'var(--ink)' }}>Dark Mode</span>
              <div style={{ width: '40px', height: '24px', background: 'rgba(0,0,0,0.1)', borderRadius: '12px', position: 'relative' }}>
                <div style={{ width: '20px', height: '20px', background: 'white', borderRadius: '50%', position: 'absolute', left: '2px', top: '2px' }}></div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ fontSize: '14px', color: 'var(--ink)' }}>Language</span>
              <select style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.1)', background: 'white' }}>
                <option>English</option>
                <option>Spanish</option>
              </select>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="glass-card" style={{ padding: '24px', border: '1px solid rgba(220, 38, 38, 0.2)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#dc2626', marginBottom: '16px' }}>Danger Zone</h3>
            
            <p style={{ fontSize: '13px', color: 'var(--ink)', marginBottom: '16px' }}>
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <button style={{ width: '100%', padding: '12px', background: '#fef2f2', color: '#dc2626', border: '1px solid rgba(220, 38, 38, 0.2)', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
              Delete Account
            </button>
          </div>

        </div>
      </Rise>
    </div>
  );
}
