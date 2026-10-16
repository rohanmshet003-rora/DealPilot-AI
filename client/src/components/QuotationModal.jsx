import React, { useState, useEffect } from 'react';
import { X, Printer, FileText, CheckCircle, ShieldCheck, Building2, User, CreditCard, Sparkles } from 'lucide-react';
import { formatINR } from '../utils/formatters';
import api from '../services/api';

export default function QuotationModal({ isOpen, onClose, roomId }) {
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !roomId) return;
    async function fetchQuote() {
      setLoading(true);
      try {
        const res = await api.getQuotation(roomId);
        if (res.success && res.quotation) {
          setQuotation(res.quotation);
        }
      } catch (err) {
        console.error('Failed to load quotation:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchQuote();
  }, [isOpen, roomId]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '820px',
          background: '#0B0F19',
          border: '1px solid var(--border-medium)',
          padding: '2.5rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75)',
        }}
      >
        {/* Modal Top Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(6, 182, 212, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <FileText size={20} color="var(--accent-cyan)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Commercial Deal Quotation</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Official Price Proposal • GST Compliant
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button onClick={handlePrint} className="btn btn-secondary btn-sm" title="Print Quotation">
              <Printer size={15} />
              <span>Print / Save PDF</span>
            </button>
            <button onClick={onClose} className="btn btn-ghost" style={{ padding: '0.4rem' }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '4rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Sparkles size={28} color="var(--accent-cyan)" style={{ margin: '0 auto 1rem auto', animation: 'spin 2s linear infinite' }} />
            <div>Generating itemized commercial quotation...</div>
          </div>
        ) : quotation ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Quotation Header Details */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: '1rem',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
            }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Quotation Number
                </span>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-sky)', fontFamily: 'monospace' }}>
                  {quotation.quoteNumber}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '2rem' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Issue Date</span>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{quotation.issueDate}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Valid Until</span>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#F59E0B' }}>{quotation.validUntil}</div>
                </div>
              </div>
            </div>

            {/* Vendor and Client Profile Blocks */}
            <div className="grid-2" style={{ gap: '1.25rem' }}>
              {/* Vendor */}
              <div style={{ background: 'rgba(15, 23, 42, 0.65)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.1rem' }}>
                <span className="badge badge-emerald" style={{ fontSize: '0.65rem', marginBottom: '0.5rem' }}>Quotation Issued By (Vendor)</span>
                <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: '0.2rem' }}>{quotation.vendor.company}</div>
                <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>Contact: {quotation.vendor.name} ({quotation.vendor.email})</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                  GSTIN: <strong>{quotation.vendor.gstin}</strong> • {quotation.vendor.state}
                </div>
              </div>

              {/* Client */}
              <div style={{ background: 'rgba(15, 23, 42, 0.65)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.1rem' }}>
                <span className="badge badge-cyan" style={{ fontSize: '0.65rem', marginBottom: '0.5rem' }}>Prepared For (Client)</span>
                <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: '0.2rem' }}>{quotation.client.company}</div>
                <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>Attn: {quotation.client.name} ({quotation.client.email})</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                  {quotation.client.billingAddress}
                </div>
              </div>
            </div>

            {/* Itemized Deliverables Table */}
            <div style={{ overflowX: 'auto', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(255, 255, 255, 0.04)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>#</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Deliverable Description</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Qty</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Unit Rate (INR)</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Base Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {quotation.lineItems.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{item.itemNumber}</td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.925rem' }}>{item.title}</div>
                        <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{item.description}</div>
                        <span className="badge badge-indigo" style={{ fontSize: '0.65rem', marginTop: '0.35rem' }}>{item.category}</span>
                      </td>
                      <td style={{ padding: '1rem' }}>{item.quantity}</td>
                      <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>{item.formattedRate}</td>
                      <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 700 }}>{item.formattedBaseTotal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary & GST Breakdown */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{
                width: '100%',
                maxWidth: '380px',
                background: 'rgba(0, 0, 0, 0.35)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.6rem',
                fontSize: '0.85rem',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>Base Subtotal:</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{quotation.financialSummary.formattedSubtotal}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>Applicable GST (18% IGST):</span>
                  <span style={{ fontWeight: 600, color: 'var(--accent-sky)' }}>{quotation.financialSummary.formattedGst}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>Freight & Logistics:</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {quotation.financialSummary.freightCharges > 0 ? quotation.financialSummary.formattedFreight : 'Included / Borne by Seller'}
                  </span>
                </div>

                <div style={{
                  borderTop: '1px solid var(--border-medium)',
                  paddingTop: '0.75rem',
                  marginTop: '0.35rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 800 }}>Grand Total (INR):</span>
                  <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34D399', fontFamily: 'var(--font-heading)' }}>
                    {quotation.financialSummary.formattedGrandTotal}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment & Banking Terms for India */}
            <div className="grid-2" style={{ gap: '1.25rem' }}>
              {/* Terms */}
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
                  Agreed Payment & Fulfillment Terms
                </h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <li>• <strong>Payment Terms:</strong> {quotation.termsAndConditions.paymentTerms}</li>
                  <li>• <strong>Payment Channel:</strong> {quotation.termsAndConditions.paymentMethod}</li>
                  <li>• <strong>Delivery SLA:</strong> {quotation.termsAndConditions.deliveryDeadline}</li>
                  <li>• <strong>Inspection Warranty:</strong> {quotation.termsAndConditions.inspectionWarranty}</li>
                  <li>• <strong>Tax Compliance:</strong> {quotation.termsAndConditions.taxCompliance}</li>
                </ul>
              </div>

              {/* Bank Details */}
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
                  Electronic Bank Transfer (NEFT / RTGS / UPI)
                </h4>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <div>Bank: <strong>{quotation.vendor.bankDetails.bankName}</strong> ({quotation.vendor.bankDetails.branch})</div>
                  <div>Account Name: <strong>{quotation.vendor.bankDetails.accountName}</strong></div>
                  <div>Account No: <strong>{quotation.vendor.bankDetails.accountNumber}</strong></div>
                  <div>IFSC Code: <strong>{quotation.vendor.bankDetails.ifscCode}</strong></div>
                  <div>Instant UPI VPA: <strong style={{ color: 'var(--accent-sky)' }}>{quotation.vendor.bankDetails.upiId}</strong></div>
                </div>
              </div>
            </div>

            {/* Signature & Cryptographic Seal */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '1.25rem',
              flexWrap: 'wrap',
              gap: '1rem',
            }}>
              <div>
                <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.35rem' }}>
                  <ShieldCheck size={14} /> Certified Commercial Quotation
                </span>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Verification Hash: {quotation.authorizedSignatory.verificationHash}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontStyle: 'italic', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                  {quotation.authorizedSignatory.signatoryName}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {quotation.authorizedSignatory.designation}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
