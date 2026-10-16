import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { ShieldCheck, CheckCircle, Clock, Printer, FileCheck, FileText } from 'lucide-react';
import { formatINR } from '../utils/formatters';
import api from '../services/api';

export default function FinalDealContract({
  dealAgreement,
  room,
  currentUser,
  onRefresh,
  onOpenQuotation,
}) {
  const [signing, setSigning] = useState(false);
  const [signatureName, setSignatureName] = useState(currentUser?.name || '');
  const [showSignModal, setShowSignModal] = useState(false);

  if (!dealAgreement) {
    return (
      <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center' }}>
        <Clock size={36} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto' }} />
        <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Bilateral Deal Agreement Pending</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          When either party accepts an offer in Indian Rupees (₹), the formal bilateral deal agreement will appear here for mutual digital signature.
        </p>
      </div>
    );
  }

  const terms = dealAgreement.terms || {};
  const isFullyExecuted = dealAgreement.isFullyExecuted || (dealAgreement.seller_signed && dealAgreement.buyer_signed);

  const isCreator = room.creator_id === currentUser?.id;
  const isSeller = (isCreator && room.creator_role === 'seller') || (!isCreator && room.creator_role === 'buyer');
  const userHasSigned = isSeller ? Boolean(dealAgreement.seller_signed) : Boolean(dealAgreement.buyer_signed);

  const handleSign = async () => {
    setSigning(true);
    try {
      const res = await api.signDeal(room.id, signatureName);
      if (res.success) {
        if (res.bothSigned) {
          confetti({
            particleCount: 120,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
        setShowSignModal(false);
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error('Sign error:', err);
    } finally {
      setSigning(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem', border: isFullyExecuted ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-subtle)', position: 'relative' }}>
      {/* Top Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '1.25rem',
        marginBottom: '1.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: isFullyExecuted ? 'rgba(16, 185, 129, 0.2)' : 'rgba(56, 189, 248, 0.15)',
            border: `1px solid ${isFullyExecuted ? 'rgba(16, 185, 129, 0.4)' : 'rgba(56, 189, 248, 0.4)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <FileCheck size={22} color={isFullyExecuted ? '#10B981' : '#38BDF8'} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Bilateral Transaction Agreement</h3>
              <span className={`badge ${isFullyExecuted ? 'badge-emerald' : 'badge-amber'}`}>
                {isFullyExecuted ? 'Fully Executed & Certified' : 'Awaiting Signatures'}
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Certificate ID: {dealAgreement.deal_certificate_hash || 'DP-CERT-PENDING'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <button onClick={onOpenQuotation} className="btn btn-secondary btn-sm" title="View Commercial Quotation">
            <FileText size={15} color="var(--accent-sky)" />
            <span>Quotation Sheet</span>
          </button>
          <button onClick={handlePrint} className="btn btn-secondary btn-sm" title="Print Agreement">
            <Printer size={15} />
            <span>Print PDF</span>
          </button>
          {!userHasSigned && !isFullyExecuted && (
            <button onClick={() => setShowSignModal(true)} className="btn btn-success btn-sm">
              <ShieldCheck size={16} />
              <span>Sign Agreement</span>
            </button>
          )}
        </div>
      </div>

      {/* Contract Terms Summary Sheet */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: 'var(--radius-md)',
        padding: '1.5rem',
        marginBottom: '1.75rem',
        border: '1px solid var(--border-subtle)',
      }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Commercial Transaction Subject
          </span>
          <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {room.title}
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            {room.description}
          </p>
        </div>

        <div className="grid-2" style={{ gap: '1.25rem' }}>
          {/* Price */}
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Final Agreed Price (INR)
            </span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-sky)', fontFamily: 'var(--font-heading)' }}>
              {terms.finalPrice ? formatINR(terms.finalPrice) : '---'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Exclusive of 18% GST (Subject to tax invoice)
            </div>
          </div>

          {/* Payment Terms */}
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Payment Structure & Channel
            </span>
            <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: '0.2rem' }}>
              {terms.paymentTerms || 'Standard Terms'}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Mode: {terms.paymentMethod || 'NEFT / RTGS Transfer'}
            </div>
          </div>

          {/* Delivery Terms */}
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Fulfillment & Freight Responsibility
            </span>
            <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: '0.2rem' }}>
              {terms.deliveryMethod || 'Surface Logistics / Transport'}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Freight: {terms.deliveryCostBearer} (Delivery SLA: {terms.deliveryDeadlineDays || 7} Days)
            </div>
          </div>

          {/* Inspection Window */}
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Verification & Warranty Period
            </span>
            <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: '0.2rem' }}>
              {terms.inspectionWindowDays || 14} Calendar Days
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Formal verification before final milestone release
            </div>
          </div>
        </div>

        {terms.notes && (
          <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Agreed Clauses: </span>
            {terms.notes}
          </div>
        )}
      </div>

      {/* Bilateral Signature Execution Blocks */}
      <div>
        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.85rem' }}>
          Bilateral Execution Sign-Off
        </h4>

        <div className="grid-2">
          {/* Seller Signature Block */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.65)',
            border: dealAgreement.seller_signed ? '1px solid rgba(16, 185, 129, 0.4)' : '1px dashed var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            position: 'relative',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span className="badge badge-emerald">Seller Sign-Off</span>
              {dealAgreement.seller_signed ? (
                <span style={{ color: '#34D399', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <CheckCircle size={14} /> Signed
                </span>
              ) : (
                <span style={{ color: '#F59E0B', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Clock size={14} /> Pending Signature
                </span>
              )}
            </div>

            <div style={{ minHeight: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {dealAgreement.seller_signed ? (
                <>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', fontStyle: 'italic' }}>
                    {dealAgreement.seller_signature_name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Signed at: {new Date(dealAgreement.seller_signed_at).toLocaleString('en-IN')}
                  </div>
                </>
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Awaiting digital signature from Seller
                </div>
              )}
            </div>
          </div>

          {/* Buyer Signature Block */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.65)',
            border: dealAgreement.buyer_signed ? '1px solid rgba(16, 185, 129, 0.4)' : '1px dashed var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            position: 'relative',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span className="badge badge-cyan">Buyer Sign-Off</span>
              {dealAgreement.buyer_signed ? (
                <span style={{ color: '#34D399', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <CheckCircle size={14} /> Signed
                </span>
              ) : (
                <span style={{ color: '#F59E0B', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Clock size={14} /> Pending Signature
                </span>
              )}
            </div>

            <div style={{ minHeight: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {dealAgreement.buyer_signed ? (
                <>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', fontStyle: 'italic' }}>
                    {dealAgreement.buyer_signature_name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Signed at: {new Date(dealAgreement.buyer_signed_at).toLocaleString('en-IN')}
                  </div>
                </>
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Awaiting digital signature from Buyer
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Signature Confirmation Modal */}
      {showSignModal && (
        <div className="modal-overlay" onClick={() => setShowSignModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Digital Signature Confirmation
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              By signing below, you formally accept the agreed price of {formatINR(terms.finalPrice)} and terms under DealPilot AI Bilateral Agreement.
            </p>

            <div className="form-group">
              <label className="form-label">Full Legal Signer Name</label>
              <input
                type="text"
                className="form-input"
                value={signatureName}
                onChange={(e) => setSignatureName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button onClick={() => setShowSignModal(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button
                onClick={handleSign}
                disabled={signing || !signatureName.trim()}
                className="btn btn-success"
              >
                <ShieldCheck size={16} />
                <span>{signing ? 'Signing...' : 'Execute Digital Signature'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
