import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Compass,
  PlusCircle,
  ArrowLeft,
  Tag,
  CreditCard,
  Truck,
  ShieldCheck,
  FileText,
  AlertCircle,
  HelpCircle,
  IndianRupee,
} from 'lucide-react';
import api from '../services/api';
import { formatINR } from '../utils/formatters';

export default function CreateRoomPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Software & SaaS');
  const [currency, setCurrency] = useState('INR');
  const [creatorRole, setCreatorRole] = useState(user?.role_preference === 'buyer' ? 'buyer' : 'seller');
  const [initialPrice, setInitialPrice] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [description, setDescription] = useState('');

  // Initial Baseline Terms (Accessible plain-English defaults)
  const [initialPaymentTerms, setInitialPaymentTerms] = useState('50% Upfront, 50% on Delivery');
  const [initialPaymentMethod, setInitialPaymentMethod] = useState('UPI / Instant IMPS Transfer');
  const [initialDeliveryMethod, setDeliveryMethod] = useState('Digital Instant Handover');
  const [initialDeliveryCostBearer, setDeliveryCostBearer] = useState('Seller Pays');
  const [initialDeliveryDeadlineDays, setDeliveryDeadlineDays] = useState(7);
  const [initialInspectionWindowDays, setInspectionWindowDays] = useState(14);
  const [initialNotes, setInitialNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !initialPrice) return;
    setError('');
    setSubmitting(true);

    try {
      const res = await api.createRoom({
        title: title.trim(),
        category,
        currency,
        creatorRole,
        initialPrice: parseFloat(initialPrice),
        targetPrice: targetPrice ? parseFloat(targetPrice) : null,
        description: description.trim(),
        initialPaymentTerms,
        initialPaymentMethod,
        initialDeliveryMethod,
        initialDeliveryCostBearer,
        initialDeliveryDeadlineDays: parseInt(initialDeliveryDeadlineDays, 10),
        initialInspectionWindowDays: parseInt(initialInspectionWindowDays, 10),
        initialNotes: initialNotes.trim(),
      });

      if (res.success && res.room) {
        navigate(`/room/${res.room.id}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to create negotiation room.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '820px' }}>
      <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
        <ArrowLeft size={16} />
        <span>Back to Dashboard</span>
      </Link>

      <div className="glass-panel" style={{ padding: '2.5rem' }}>
        <div style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <PlusCircle size={18} color="#FFFFFF" />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
              Launch New Deal Room
            </h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Initialize a multi-round commercial negotiation space in Indian Rupees (₹) with real-time Agora voice calling and systematic Gemini Copilot.
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem',
            color: '#F87171',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1.5rem',
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Section 1: Deal Scope */}
          <div style={{ marginBottom: '1.75rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--accent-sky)' }}>
              1. Deal Identification & Subject Matter
            </h3>

            <div className="form-group">
              <label className="form-label">Deal / Asset Title</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Enterprise Cloud Compute GPU Cluster (Annual SLA)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Plain-English title identifying the product, machinery, service, or contract.
              </span>
            </div>

            <div className="grid-3">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="Software & SaaS">Software & SaaS</option>
                  <option value="Equipment & Machinery">Equipment & Machinery</option>
                  <option value="Real Estate">Real Estate & Office Lease</option>
                  <option value="Professional Services">Professional Services</option>
                  <option value="Wholesale Goods">Wholesale Goods</option>
                  <option value="Vehicles & Fleet">Vehicles & Fleet</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Transaction Currency</label>
                <select className="form-select" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                  <option value="INR">INR (₹ - Indian Rupees)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Your Negotiation Role</label>
                <select className="form-select" value={creatorRole} onChange={(e) => setCreatorRole(e.target.value)}>
                  <option value="seller">Seller (Offering Item / Service)</option>
                  <option value="buyer">Buyer (Procuring / Budgeting)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Asset Specifications / Description</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Detail key deliverables, SLA parameters, equipment model, warranty or lease scope."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          {/* Section 2: Valuation & Pricing Parameters */}
          <div style={{ marginBottom: '1.75rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--accent-sky)' }}>
              2. Baseline Valuation & Pricing (Indian Rupees ₹)
            </h3>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">
                  {creatorRole === 'seller' ? 'Initial Asking Price' : 'Initial Target Budget'} ({currency})
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  className="form-input"
                  style={{ fontSize: '1.15rem', fontWeight: 700 }}
                  placeholder="e.g. 750000"
                  value={initialPrice}
                  onChange={(e) => setInitialPrice(e.target.value)}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-sky)' }}>
                  {initialPrice ? `Formatted: ${formatINR(initialPrice)}` : 'e.g. ₹7,50,000'}
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Confidential Walkaway Price (Floor / Ceiling)
                </label>
                <input
                  type="number"
                  step="any"
                  className="form-input"
                  placeholder="e.g. 680000"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {targetPrice ? `Formatted: ${formatINR(targetPrice)} (Kept private for AI ZOPA calculations)` : 'Strictly confidential. Gemini uses this to protect your margin.'}
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Baseline Terms */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--accent-sky)' }}>
              3. Baseline Payment & Delivery Terms (Accessible Options)
            </h3>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Payment Terms</label>
                <select
                  className="form-select"
                  value={initialPaymentTerms}
                  onChange={(e) => setInitialPaymentTerms(e.target.value)}
                >
                  <option value="50% Upfront, 50% on Delivery">50% Advance, 50% on Delivery (Balanced)</option>
                  <option value="100% Upfront Wire">100% Upfront Payment (Immediate)</option>
                  <option value="30% Deposit, 70% Upon Acceptance">30% Token Deposit, 70% on Inspection</option>
                  <option value="Net 30 Days (Invoiced)">Net 30 Days (GST Tax Invoiced)</option>
                  <option value="Third-Party Escrow Protected">Bank Escrow Protected (Funds locked until verified)</option>
                </select>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  When money is transferred between buyer and seller.
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Payment Transfer Method</label>
                <select
                  className="form-select"
                  value={initialPaymentMethod}
                  onChange={(e) => setInitialPaymentMethod(e.target.value)}
                >
                  <option value="UPI / Instant IMPS Transfer">UPI / Instant IMPS Transfer (Zero fees, immediate)</option>
                  <option value="NEFT / RTGS Corporate Bank Transfer">NEFT / RTGS Corporate Bank Transfer</option>
                  <option value="Third-Party Escrow Protected">ICICI / HDFC Corporate Escrow Account</option>
                  <option value="Letter of Credit (LC)">Letter of Credit (LC) / Bank Guarantee</option>
                  <option value="Credit / Debit Corporate Card">Corporate Debit / Credit Card</option>
                </select>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Preferred domestic banking channel for this transaction.
                </span>
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Delivery / Fulfillment Method</label>
                <select
                  className="form-select"
                  value={initialDeliveryMethod}
                  onChange={(e) => setDeliveryMethod(e.target.value)}
                >
                  <option value="Digital Instant Handover">Digital Instant Handover / VPC Provision</option>
                  <option value="Express Priority Air Logistics">Express Priority Air Courier (BlueDart / DTDC Air)</option>
                  <option value="Standard Ground Logistics">Standard Surface Ground Logistics (Road Cargo)</option>
                  <option value="Dedicated Heavy Freight">Dedicated Heavy Freight Transport & Rigging</option>
                  <option value="Local Depot Inspection & Pickup">Local Depot Inspection & Self Pickup</option>
                </select>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  How the service or physical assets will be delivered.
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Delivery Cost Responsibility</label>
                <select
                  className="form-select"
                  value={initialDeliveryCostBearer}
                  onChange={(e) => setDeliveryCostBearer(e.target.value)}
                >
                  <option value="Seller Pays">Seller Pays (Included in deal price)</option>
                  <option value="Buyer Pays">Buyer Pays (Added to final invoice)</option>
                  <option value="50/50 Split">50/50 Split (Shared equally)</option>
                </select>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Which party pays for courier/freight logistics.
                </span>
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Delivery Deadline (Days)</label>
                <input
                  type="number"
                  min="1"
                  className="form-input"
                  value={initialDeliveryDeadlineDays}
                  onChange={(e) => setDeliveryDeadlineDays(e.target.value)}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Target days from agreement to full handover.
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Quality Inspection Window (Days)</label>
                <input
                  type="number"
                  min="1"
                  className="form-input"
                  value={initialInspectionWindowDays}
                  onChange={(e) => setInspectionWindowDays(e.target.value)}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Days allowed to inspect and test goods before payout is final.
                </span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Opening Position Statement (Optional)</label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="Add opening context or special requirements for the opening round."
                value={initialNotes}
                onChange={(e) => setInitialNotes(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem' }}>
            <Link to="/dashboard" className="btn btn-secondary">
              Cancel
            </Link>
            <button type="submit" disabled={submitting} className="btn btn-primary btn-lg">
              <PlusCircle size={18} />
              <span>{submitting ? 'Launching Room...' : 'Launch Negotiation Room'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
