import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Truck, CreditCard } from 'lucide-react';
import { formatINR } from '../utils/formatters';
import api from '../services/api';

export default function CompromiseCards({ roomId, currency = 'INR', onAdoptCompromise }) {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCompromises() {
      setLoading(true);
      try {
        const res = await api.getAiCompromises(roomId);
        if (res.success && res.packages) {
          setPackages(res.packages);
        }
      } catch (err) {
        console.warn('Compromise load error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCompromises();
  }, [roomId]);

  if (loading) {
    return (
      <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center' }}>
        <Sparkles size={32} color="var(--accent-cyan)" style={{ margin: '0 auto 1rem auto', animation: 'spin 2s linear infinite' }} />
        <h4 style={{ fontSize: '1.1rem', marginBottom: '0.4rem' }}>Formulating Win-Win Trade-Offs in INR (₹)...</h4>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Gemini AI is balancing payment milestones, transport freight, and warranty terms.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={18} color="var(--accent-cyan)" />
            <span>3 Win-Win Compromise Packages</span>
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.825rem' }}>
            Creative solutions exchanging non-cash value (payment speed, freight, warranty) for price concessions.
          </p>
        </div>
        <span className="badge badge-indigo">Gemini Calculus</span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.25rem',
      }}>
        {packages.map((pkg, idx) => {
          const isBalanced = pkg.packageType === 'balanced';
          const isSeller = pkg.packageType === 'seller_favorable';
          const badgeClass = isBalanced ? 'badge-emerald' : isSeller ? 'badge-amber' : 'badge-cyan';
          const borderColor = isBalanced ? 'rgba(16, 185, 129, 0.4)' : isSeller ? 'rgba(245, 158, 11, 0.4)' : 'rgba(6, 182, 212, 0.4)';

          return (
            <div
              key={idx}
              className="glass-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                border: `1px solid ${borderColor}`,
                background: 'rgba(15, 23, 42, 0.85)',
                position: 'relative',
                padding: '1.25rem',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                <span className={`badge ${badgeClass}`}>{pkg.badge || pkg.packageType}</span>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Option #{idx + 1}</span>
              </div>

              <h4 style={{ fontSize: '1.05rem', marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                {pkg.title}
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.45 }}>
                {pkg.summary}
              </p>

              {/* Price Tag in INR (₹) */}
              <div style={{
                background: 'rgba(0, 0, 0, 0.35)',
                padding: '0.75rem 0.95rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '0.85rem',
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Proposed Price (INR)
                </span>
                <span style={{ fontSize: '1.45rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
                  {pkg.formattedPrice || formatINR(pkg.proposedPrice)}
                </span>
              </div>

              {/* Terms */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.45rem' }}>
                  <CreditCard size={14} color="var(--accent-sky)" style={{ marginTop: '0.15rem', flexShrink: 0 }} />
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Payment: </span>
                    <span style={{ fontWeight: 600 }}>{pkg.paymentTerms}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.45rem' }}>
                  <Truck size={14} color="var(--accent-cyan)" style={{ marginTop: '0.15rem', flexShrink: 0 }} />
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Freight: </span>
                    <span style={{ fontWeight: 600 }}>{pkg.deliveryMethod} ({pkg.deliveryCostBearer})</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.45rem' }}>
                  <ShieldCheck size={14} color="var(--accent-emerald)" style={{ marginTop: '0.15rem', flexShrink: 0 }} />
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Inspection: </span>
                    <span style={{ fontWeight: 600 }}>{pkg.inspectionWindowDays || 14} Days Warranty Window</span>
                  </div>
                </div>
              </div>

              {/* Concessions */}
              {pkg.concessions && pkg.concessions.length > 0 && (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.65rem 0.85rem',
                  marginBottom: '1rem',
                }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                    Mutual Trade-Offs
                  </div>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.775rem' }}>
                    {pkg.concessions.map((c, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.35rem', color: 'var(--text-secondary)' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)', minWidth: '40px' }}>{c.party}:</span>
                        <span>{c.tradeOff}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Button */}
              <div style={{ marginTop: 'auto', paddingTop: '0.4rem' }}>
                <button
                  onClick={() => onAdoptCompromise && onAdoptCompromise(pkg)}
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', justifyContent: 'space-between' }}
                >
                  <span>Adopt as Counteroffer (₹)</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
