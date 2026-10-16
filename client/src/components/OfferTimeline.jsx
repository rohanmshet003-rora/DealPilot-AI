import React from 'react';
import { CheckCircle2, XCircle, ArrowRightLeft, Clock, ShieldCheck, Truck, CreditCard, Sparkles, AlertCircle, FileText } from 'lucide-react';
import { formatINR } from '../utils/formatters';

export default function OfferTimeline({
  offers = [],
  currency = 'INR',
  currentUserId,
  currentUserRole,
  onAcceptOffer,
  onOpenCounterModal,
  onRejectOffer,
  onConsultAi,
  onOpenQuotation,
}) {
  if (offers.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center' }}>
        <Clock size={36} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto' }} />
        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No Offers Submitted Yet</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
          Open the negotiation by presenting your baseline proposal in Indian Rupees (₹).
        </p>
        <button onClick={onOpenCounterModal} className="btn btn-primary btn-sm">
          Submit Opening Offer
        </button>
      </div>
    );
  }

  const latestOffer = offers[offers.length - 1];
  const canActOnLatest = latestOffer && latestOffer.status === 'submitted' && latestOffer.sender_id !== currentUserId;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Timeline Action Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>Offer Rounds & Negotiation Trail</span>
          <span className="badge badge-cyan" style={{ fontSize: '0.75rem' }}>
            Round {offers.length}
          </span>
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button onClick={onOpenQuotation} className="btn btn-secondary btn-sm" title="View Official Commercial Quotation">
            <FileText size={14} color="var(--accent-sky)" />
            <span>Official Quotation</span>
          </button>
          <button onClick={onOpenCounterModal} className="btn btn-primary btn-sm">
            <ArrowRightLeft size={14} />
            <span>Counteroffer</span>
          </button>
        </div>
      </div>

      {offers.map((offer, idx) => {
        const isLatest = idx === offers.length - 1;
        const prevOffer = idx > 0 ? offers[idx - 1] : null;
        const priceDiff = prevOffer ? offer.price - prevOffer.price : null;
        const isBuyer = offer.sender_role === 'buyer';

        return (
          <div
            key={offer.id || idx}
            className="glass-panel"
            style={{
              padding: '1.4rem',
              position: 'relative',
              borderColor: isLatest ? 'var(--border-active)' : 'var(--border-subtle)',
              boxShadow: isLatest ? 'var(--border-glow)' : 'none',
              background: isLatest ? 'rgba(20, 28, 48, 0.9)' : 'var(--bg-card)',
            }}
          >
            {/* Header: Round & Sender info */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: isBuyer ? 'rgba(59, 130, 246, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                  color: isBuyer ? '#60A5FA' : '#34D399',
                  border: `1px solid ${isBuyer ? 'rgba(59, 130, 246, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                }}>
                  R{offer.round_number}
                </span>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.925rem' }}>
                      {offer.sender_name || (isBuyer ? 'Buyer' : 'Seller')}
                    </span>
                    <span className={`badge ${isBuyer ? 'badge-cyan' : 'badge-emerald'}`} style={{ fontSize: '0.65rem' }}>
                      {offer.sender_role}
                    </span>
                    {offer.sender_id === currentUserId && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>(You)</span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {offer.created_at ? new Date(offer.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div>
                {offer.status === 'accepted' && (
                  <span className="badge badge-emerald" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <CheckCircle2 size={13} />
                    <span>Accepted</span>
                  </span>
                )}
                {offer.status === 'rejected' && (
                  <span className="badge badge-rose" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <XCircle size={13} />
                    <span>Declined</span>
                  </span>
                )}
                {offer.status === 'countered' && (
                  <span className="badge badge-amber">
                    Countered
                  </span>
                )}
                {offer.status === 'submitted' && (
                  <span className="badge badge-cyan">
                    Active Proposal
                  </span>
                )}
              </div>
            </div>

            {/* Price Presentation in INR (₹) */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.3)',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '0.85rem',
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Proposed Price (INR)
                </span>
                <span style={{ fontSize: '1.65rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
                  {formatINR(offer.price)}
                </span>
              </div>

              {priceDiff !== null && (
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>
                    Delta from R{prevOffer.round_number}
                  </span>
                  <span style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: priceDiff < 0 ? '#34D399' : priceDiff > 0 ? '#F87171' : 'var(--text-muted)',
                  }}>
                    {priceDiff > 0 ? `+${formatINR(priceDiff)}` : priceDiff < 0 ? `-${formatINR(Math.abs(priceDiff))}` : 'Unchanged'}
                  </span>
                </div>
              )}
            </div>

            {/* Terms Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '0.75rem',
              marginBottom: '0.85rem',
              fontSize: '0.825rem',
            }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.7rem', marginBottom: '0.2rem' }}>
                  <CreditCard size={13} color="var(--accent-sky)" />
                  <span>Payment Terms</span>
                </div>
                <div style={{ fontWeight: 600 }}>{offer.payment_terms}</div>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Via {offer.payment_method}</div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.7rem', marginBottom: '0.2rem' }}>
                  <Truck size={13} color="var(--accent-cyan)" />
                  <span>Delivery & Freight</span>
                </div>
                <div style={{ fontWeight: 600 }}>{offer.delivery_method}</div>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Freight: {offer.delivery_cost_bearer} ({offer.delivery_deadline_days} days)</div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.7rem', marginBottom: '0.2rem' }}>
                  <ShieldCheck size={13} color="var(--accent-emerald)" />
                  <span>Inspection SLA</span>
                </div>
                <div style={{ fontWeight: 600 }}>{offer.inspection_window_days}-Day Inspection</div>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Full acceptance warranty</div>
              </div>
            </div>

            {/* Strategic Notes */}
            {offer.notes && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                borderLeft: '3px solid var(--accent-sky)',
                padding: '0.55rem 0.75rem',
                borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                marginBottom: isLatest && canActOnLatest ? '1rem' : 0,
              }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', marginRight: '0.35rem' }}>Note:</span>
                "{offer.notes}"
              </div>
            )}

            {/* Decision Actions on Latest Offer */}
            {isLatest && canActOnLatest && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem',
                paddingTop: '0.85rem',
                borderTop: '1px solid var(--border-subtle)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--accent-amber)' }}>
                  <AlertCircle size={15} />
                  <span>Awaiting your decision on Round {offer.round_number}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button onClick={() => onRejectOffer(offer.id)} className="btn btn-secondary btn-sm">
                    Decline
                  </button>
                  <button onClick={onConsultAi} className="btn btn-secondary btn-sm" style={{ color: '#A5B4FC' }}>
                    <Sparkles size={13} />
                    <span>Gemini Plan</span>
                  </button>
                  <button onClick={onOpenCounterModal} className="btn btn-secondary btn-sm">
                    Counteroffer
                  </button>
                  <button onClick={() => onAcceptOffer(offer.id)} className="btn btn-success btn-sm">
                    <CheckCircle2 size={15} />
                    <span>Accept Offer</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
