import React from 'react';
import { Compass, ShieldCheck, Cpu, Mic, Database } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border-subtle)',
      background: 'rgba(7, 9, 14, 0.95)',
      padding: '3rem 0 2rem 0',
      marginTop: 'auto',
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '2.5rem',
          paddingBottom: '2.5rem',
          borderBottom: '1px solid var(--border-subtle)',
        }}>
          {/* Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Compass size={18} color="#FFFFFF" />
              </div>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 800 }}>
                DealPilot <span className="gradient-text">AI</span>
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem', lineHeight: 1.6 }}>
              Negotiate Smarter. Deal Better. Close with Confidence.
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: 1.5 }}>
              The full-stack commercial deal platform empowering buyers and sellers with real-time Agora voice calling, Gemini AI negotiation copilot, and certified bilateral agreements.
            </p>
          </div>

          {/* Core Capabilities */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
              Core Capabilities
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mic size={15} color="var(--accent-cyan)" />
                <span>Real-Time Agora RTC Voice Calling</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Cpu size={15} color="var(--accent-emerald)" />
                <span>Google Gemini AI Negotiation Copilot</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={15} color="var(--accent-sky)" />
                <span>Bilateral Contract Signatures & Certs</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Database size={15} color="var(--accent-indigo)" />
                <span>Persistent PostgreSQL Database</span>
              </li>
            </ul>
          </div>

          {/* Trust & Architecture */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
              Enterprise Standards
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
              <span className="badge badge-cyan">Agora RTC</span>
              <span className="badge badge-emerald">Gemini 2.5</span>
              <span className="badge badge-indigo">PostgreSQL</span>
              <span className="badge badge-amber">Socket.io</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              End-to-end audit logs, cryptographic contract hashing, and strict role segregation between buyer and seller positions.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          paddingTop: '1.5rem',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
        }}>
          <div>
            © {new Date().getFullYear()} DealPilot AI. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span>Privacy Policy</span>
            <span>Terms of Negotiation</span>
            <span>Security Specifications</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
