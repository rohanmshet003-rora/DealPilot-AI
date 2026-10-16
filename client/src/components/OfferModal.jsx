import React, { useState, useEffect } from 'react';
import { X, Send, Sparkles, DollarSign, CreditCard, Truck, ShieldCheck, FileText, HelpCircle } from 'lucide-react';
import { formatINR } from '../utils/formatters';

export default function OfferModal({
  isOpen,
  onClose,
  onSubmit,
  currency = 'INR',
  latestOffer = null,
  userRole = 'buyer',
  prefillValues = null,
}) {
  const [price, setPrice] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('50% Advance via UPI/NEFT, 50% on Delivery');
  const [paymentMethod, setPaymentMethod] = useState('NEFT / RTGS Bank Transfer');
  const [deliveryMethod, setDeliveryMethod] = useState('Surface Logistics / Transport');
  const [deliveryCostBearer, setDeliveryCostBearer] = useState('50/50 Split');
  const [deliveryDeadlineDays, setDeliveryDeadlineDays] = useState(7);
  const [inspectionWindowDays, setInspectionWindowDays] = useState(14);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (prefillValues) {
      if (prefillValues.proposedPrice) setPrice(prefillValues.proposedPrice);
      if (prefillValues.paymentTerms) setPaymentTerms(prefillValues.paymentTerms);
      if (prefillValues.paymentMethod) setPaymentMethod(prefillValues.paymentMethod);
      if (prefillValues.deliveryMethod) setDeliveryMethod(prefillValues.deliveryMethod);
      if (prefillValues.deliveryCostBearer) setDeliveryCostBearer(prefillValues.deliveryCostBearer);
      if (prefillValues.deliveryDeadlineDays) setDeliveryDeadlineDays(prefillValues.deliveryDeadlineDays);
      if (prefillValues.inspectionWindowDays) setInspectionWindowDays(prefillValues.inspectionWindowDays);
      if (prefillValues.summary) setNotes(`Adopting compromise: ${prefillValues.summary}`);
    } else if (latestOffer) {
      setPrice(latestOffer.price);
      setPaymentTerms(latestOffer.payment_terms || '50% Advance via UPI/NEFT, 50% on Delivery');
      setPaymentMethod(latestOffer.payment_method || 'NEFT / RTGS Bank Transfer');
      setDeliveryMethod(latestOffer.delivery_method || 'Surface Logistics / Transport');
      setDeliveryCostBearer(latestOffer.delivery_cost_bearer || '50/50 Split');
      setDeliveryDeadlineDays(latestOffer.delivery_deadline_days || 7);
      setInspectionWindowDays(latestOffer.inspection_window_days || 14);
      setNotes('');
    }
  }, [prefillValues, latestOffer, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!price || parseFloat(price) <= 0) return;
    setSubmitting(true);
    try {
      await onSubmit({
        price: parseFloat(price),
        paymentTerms,
        paymentMethod,
        deliveryMethod,
        deliveryCostBearer,
        deliveryDeadlineDays: parseInt(deliveryDeadlineDays, 10),
        inspectionWindowDays: parseInt(inspectionWindowDays, 10),
        notes,
      });
      onClose();
    } catch (err) {
      console.error('Submit offer error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.85rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
              {latestOffer ? 'Submit Counteroffer' : 'Submit Opening Offer'}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Propose terms in Indian Rupees (₹) as the {userRole.toUpperCase()}. Clear terms close deals faster.
            </p>
          </div>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: '0.4rem' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Price Input in INR (₹) */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.2rem' }}>
              <label className="form-label" style={{ fontWeight: 600 }}>Proposed Amount (INR - ₹)</label>
              {price && (
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-sky)' }}>
                  {formatINR(price)}
                </span>
              )}
            </div>
            <input
              type="number"
              step="any"
              required
              className="form-input"
              style={{ fontSize: '1.25rem', fontWeight: 700 }}
              placeholder="e.g. 685000"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {latestOffer ? `Previous offer was ${formatINR(latestOffer.price)}` : 'Enter net total before GST.'}
            </span>
          </div>

          <div className="grid-2">
            {/* Payment Terms */}
            <div className="form-group">
              <label className="form-label">Payment Schedule</label>
              <select
                className="form-select"
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
              >
                <option value="50% Advance via UPI/NEFT, 50% on Delivery">50% Advance, 50% on Delivery (Balanced)</option>
                <option value="100% Advance via RTGS (3% Cash Discount)">100% Advance via RTGS (Full Prepayment)</option>
                <option value="30% Advance, 70% Post-Inspection">30% Advance, 70% Post-Inspection (Safe)</option>
                <option value="Net 30 Days (GST Invoice with ITC)">Net 30 Days (Credit Terms with GST)</option>
                <option value="Third-Party Escrow Protected">Third-Party Escrow Protected</option>
              </select>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>How and when payment is released</span>
            </div>

            {/* Payment Method */}
            <div className="form-group">
              <label className="form-label">Payment Channel</label>
              <select
                className="form-select"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="NEFT / RTGS Bank Transfer">NEFT / RTGS Bank Transfer</option>
                <option value="UPI / QR Instant Transfer">UPI / QR Instant Transfer</option>
                <option value="Corporate Net Banking">Corporate Net Banking</option>
                <option value="Escrow Protection">Escrow Protection</option>
                <option value="Post-Dated Cheque (PDC)">Post-Dated Cheque (PDC)</option>
              </select>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Banking or digital payment mode</span>
            </div>
          </div>

          <div className="grid-2">
            {/* Delivery Method */}
            <div className="form-group">
              <label className="form-label">Fulfillment / Dispatch Method</label>
              <select
                className="form-select"
                value={deliveryMethod}
                onChange={(e) => setDeliveryMethod(e.target.value)}
              >
                <option value="Surface Logistics / Transport">Surface Logistics / Transport</option>
                <option value="Digital Instant Handover / VPC Provision">Digital Instant Handover / VPC</option>
                <option value="Express Air Cargo (Domestic Priority)">Express Air Cargo (Domestic Priority)</option>
                <option value="Dedicated Heavy Freight">Dedicated Heavy Freight</option>
                <option value="Local Warehouse Pickup & Inspection">Local Warehouse Pickup & Inspection</option>
              </select>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>How goods/services are handed over</span>
            </div>

            {/* Freight Cost Bearer */}
            <div className="form-group">
              <label className="form-label">Transport & Freight Charges</label>
              <select
                className="form-select"
                value={deliveryCostBearer}
                onChange={(e) => setDeliveryCostBearer(e.target.value)}
              >
                <option value="50/50 Split">50/50 Split (Shared equally)</option>
                <option value="Seller Pays">Seller Pays (100% absorbed)</option>
                <option value="Buyer Pays">Buyer Pays (100% borne by buyer)</option>
              </select>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Who covers shipping/transport costs</span>
            </div>
          </div>

          <div className="grid-2">
            {/* Delivery SLA */}
            <div className="form-group">
              <label className="form-label">Delivery Timeline (Days)</label>
              <input
                type="number"
                min="1"
                max="90"
                className="form-input"
                value={deliveryDeadlineDays}
                onChange={(e) => setDeliveryDeadlineDays(e.target.value)}
              />
              <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Expected delivery turnaround</span>
            </div>

            {/* Inspection Window */}
            <div className="form-group">
              <label className="form-label">Inspection & Testing Period (Days)</label>
              <input
                type="number"
                min="1"
                max="60"
                className="form-input"
                value={inspectionWindowDays}
                onChange={(e) => setInspectionWindowDays(e.target.value)}
              />
              <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Days to verify quality before sign-off</span>
            </div>
          </div>

          {/* Strategic Notes */}
          <div className="form-group">
            <label className="form-label">Explanation / Message to Counterpart (Optional)</label>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="e.g. We agreed to your price target on the condition of a 50/50 advance milestone schedule."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              <Send size={15} />
              <span>{submitting ? 'Submitting...' : 'Submit Proposal (₹)'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
