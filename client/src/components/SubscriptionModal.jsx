import React, { useState } from 'react';
import { X, Check, Sparkles, ShieldCheck, Zap } from 'lucide-react';

export default function SubscriptionModal({ isOpen, onClose }) {
  const [selectedPlan, setSelectedPlan] = useState('monthly'); // 'monthly' | 'payg'
  const [activated, setActivated] = useState(false);

  if (!isOpen) return null;

  const handleActivate = () => {
    setActivated(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '580px',
          padding: '2rem',
          textAlign: 'center',
          background: '#0B0F19',
          border: '1px solid var(--border-medium)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: '0.4rem' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1rem auto',
          boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)',
        }}>
          <Zap size={22} color="#FFFFFF" />
        </div>

        <h3 style={{ fontSize: '1.45rem', fontWeight: 800, marginBottom: '0.35rem' }}>
          Minimal, Transparent Pricing
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.75rem' }}>
          Zero hidden fees. Fair commercial pricing in Indian Rupees (₹).
        </p>

        {activated ? (
          <div style={{ padding: '2rem 1rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 'var(--radius-md)' }}>
            <Check size={32} color="#10B981" style={{ margin: '0 auto 0.5rem auto' }} />
            <h4 style={{ fontSize: '1.15rem', color: '#34D399', fontWeight: 700 }}>DealPilot Pro Active</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Unlimited AI negotiation rounds and certified quotations unlocked.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="grid-2" style={{ gap: '1rem', textAlign: 'left' }}>
              {/* Free Tier */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Free Starter</span>
                    <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>Active</span>
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-heading)', marginBottom: '0.75rem' }}>
                    ₹0 <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ forever</span>
                  </div>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Check size={14} color="#10B981" /> Up to 3 active deals</li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Check size={14} color="#10B981" /> Live Agora voice calls</li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Check size={14} color="#10B981" /> In-room messaging</li>
                  </ul>
                </div>
                <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Current Default Plan
                </div>
              </div>

              {/* Pro Tier (Minimal ₹499/mo) */}
              <div style={{
                background: 'rgba(6, 182, 212, 0.06)',
                border: '1px solid var(--border-active)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: 'var(--border-glow)',
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--accent-sky)' }}>DealPilot Pro</span>
                    <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>Recommended</span>
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#FFFFFF', marginBottom: '0.75rem' }}>
                    ₹499 <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ month</span>
                  </div>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Check size={14} color="#10B981" /> Unlimited deal rooms</li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Check size={14} color="#10B981" /> Full Gemini Copilot Advisor</li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Check size={14} color="#10B981" /> GST Commercial Quotations</li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Check size={14} color="#10B981" /> Bilateral Certified Signatures</li>
                  </ul>
                </div>

                <div style={{ marginTop: '1rem' }}>
                  <button onClick={handleActivate} className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                    <span>Upgrade to Pro (₹499)</span>
                  </button>
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Or choose Pay-As-You-Go: <strong>₹99 per deal</strong> without any monthly commitment. Cancel anytime.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
