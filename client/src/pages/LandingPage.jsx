import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Compass,
  ArrowRight,
  Mic,
  Cpu,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  Layers,
  CheckCircle2,
  Lock,
  Building2,
  Server,
  Wrench,
  Users,
  Check,
  Zap,
  IndianRupee,
  HelpCircle,
  FileText,
} from 'lucide-react';
import { formatINR } from '../utils/formatters';
import SubscriptionModal from '../components/SubscriptionModal';

export default function LandingPage() {
  const { isAuthenticated, demoLogin } = useAuth();
  const navigate = useNavigate();
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);

  // Interactive Live Simulator State in Indian Rupees (₹)
  const [askingPrice, setAskingPrice] = useState(850000);
  const [buyerOffer, setBuyerOffer] = useState(720000);

  const priceGap = Math.max(0, askingPrice - buyerOffer);
  const midPoint = Math.round((askingPrice + buyerOffer) / 2);
  const buyerLeverage = Math.round(50 + ((askingPrice - buyerOffer) / askingPrice) * 30);

  const handleDemoAccess = async (role) => {
    try {
      await demoLogin(role);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5rem', paddingBottom: '4rem' }}>
      {/* Hero Section */}
      <section style={{
        padding: '5rem 0 3rem 0',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div className="container" style={{ maxWidth: '960px', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(6, 182, 212, 0.1)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            borderRadius: 'var(--radius-full)',
            padding: '0.4rem 1rem',
            fontSize: '0.85rem',
            color: 'var(--accent-sky)',
            fontWeight: 600,
            marginBottom: '1.75rem',
            boxShadow: '0 0 20px rgba(6, 182, 212, 0.2)',
          }}>
            <Sparkles size={16} />
            <span>Next-Generation Commercial Negotiation Platform</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.5rem, 5.5vw, 4.25rem)',
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: '1.5rem',
            letterSpacing: '-0.03em',
          }}>
            Negotiate Smarter. Deal Better.{' '}
            <span className="gradient-text">Close with Confidence.</span>
          </h1>

          <p style={{
            fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            marginBottom: '2.5rem',
            maxWidth: '780px',
            margin: '0 auto 2.5rem auto',
          }}>
            DealPilot AI is the professional full-stack platform empowering buyers and sellers to discover win-win terms, execute real-time Agora voice negotiations, and leverage Google Gemini to bridge multi-thousand-dollar valuation gaps.
          </p>

          {/* Action CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '3rem' }}>
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn btn-primary btn-lg">
                <span>Enter Negotiation Dashboard</span>
                <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-lg">
                  <span>Create Free Account</span>
                  <ArrowRight size={18} />
                </Link>
                <button onClick={() => handleDemoAccess('buyer')} className="btn btn-secondary btn-lg">
                  <span>Explore as Demo Buyer</span>
                </button>
                <button onClick={() => handleDemoAccess('seller')} className="btn btn-secondary btn-lg">
                  <span>Explore as Demo Seller</span>
                </button>
              </>
            )}
          </div>

          {/* Trust Metrics Pill Strip */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '2rem',
            padding: '1.25rem 2rem',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
            maxWidth: '740px',
            margin: '0 auto',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-sky)' }}>&lt; 50ms</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Agora Voice Latency</div>
            </div>
            <div style={{ width: '1px', height: '30px', background: 'var(--border-subtle)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>94.2%</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Win-Win Compromise Rate</div>
            </div>
            <div style={{ width: '1px', height: '30px', background: 'var(--border-subtle)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-indigo)' }}>SHA-256</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Certified Contract Signatures</div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Negotiation Simulator Preview */}
      <section className="container">
        <div className="glass-panel" style={{ padding: '2.5rem', border: '1px solid rgba(56, 189, 248, 0.3)', boxShadow: '0 0 35px rgba(6, 182, 212, 0.15)' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span className="badge badge-cyan" style={{ marginBottom: '0.5rem' }}>Interactive Simulator</span>
            <h2 style={{ fontSize: '1.85rem', marginBottom: '0.5rem' }}>Experience the DealPilot AI Calculus</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '650px', margin: '0 auto' }}>
              Adjust the buyer and seller position sliders below to watch Gemini evaluate leverage and formulate non-monetary compromise packages in real time.
            </p>
          </div>

          <div className="grid-2" style={{ gap: '2rem', alignItems: 'center' }}>
            {/* Slider Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#34D399' }}>Seller Asking Price</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>{formatINR(askingPrice)}</span>
                </div>
                <input
                  type="range"
                  min="300000"
                  max="1500000"
                  step="10000"
                  value={askingPrice}
                  onChange={(e) => setAskingPrice(parseInt(e.target.value, 10))}
                  style={{ width: '100%', accentColor: '#10B981', cursor: 'pointer' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#60A5FA' }}>Buyer Counter Offer</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>{formatINR(buyerOffer)}</span>
                </div>
                <input
                  type="range"
                  min="300000"
                  max="1500000"
                  step="10000"
                  value={buyerOffer}
                  onChange={(e) => setBuyerOffer(parseInt(e.target.value, 10))}
                  style={{ width: '100%', accentColor: '#3B82F6', cursor: 'pointer' }}
                />
              </div>

              <div style={{
                background: 'rgba(0, 0, 0, 0.3)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                justifyContent: 'space-between',
              }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Valuation Gap</span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#F87171' }}>
                    {formatINR(priceGap)}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Equilibrium Midpoint</span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-sky)' }}>
                    {formatINR(midPoint)}
                  </div>
                </div>
              </div>
            </div>

            {/* AI Real-Time Output Simulation Card */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.85)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Cpu size={18} color="var(--accent-cyan)" />
                  <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Gemini Systematic Analysis</span>
                </div>
                <span className="badge badge-emerald">Live Preview</span>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Buyer Leverage Score</span>
                  <span style={{ fontWeight: 700, color: 'var(--accent-sky)' }}>{buyerLeverage}/100</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(95, Math.max(10, buyerLeverage))}%`, height: '100%', background: 'linear-gradient(90deg, #38BDF8, #10B981)' }} />
                </div>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '0.85rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.825rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
                borderLeft: '3px solid var(--accent-cyan)',
              }}>
                <strong style={{ color: 'var(--text-primary)' }}>Recommended Trade-Off: </strong>
                Instead of arguing over the {formatINR(priceGap)} gap, offer to settle at <strong>{formatINR(midPoint)}</strong> by exchanging 50% UPI advance milestone and having the seller absorb air priority freight.
              </div>

              <div style={{ marginTop: '1.25rem', textAlign: 'right' }}>
                <Link to="/register" className="btn btn-primary btn-sm">
                  <span>Start Real Negotiation</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Core Pillars Grid */}
      <section className="container">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>Engineered for High-Stakes Dealmaking</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '640px', margin: '0 auto' }}>
            Every component of DealPilot AI is architected to eliminate ambiguity and build mutual commercial consensus.
          </p>
        </div>

        <div className="grid-4">
          {/* Feature 1: Agora Voice */}
          <div className="glass-card">
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'rgba(6, 182, 212, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem',
            }}>
              <Mic size={24} color="var(--accent-cyan)" />
            </div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Agora Real-Time Voice</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Low-latency RTC audio calls directly inside negotiation rooms with live speaking meters and mute toggles.
            </p>
          </div>

          {/* Feature 2: Gemini Copilot */}
          <div className="glass-card">
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem',
            }}>
              <Cpu size={24} color="var(--accent-emerald)" />
            </div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Gemini AI Copilot</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Objective bargaining leverage scoring, tactical advice, and custom conversational guidance powered by official Google Gen AI.
            </p>
          </div>

          {/* Feature 3: Win-Win Compromises */}
          <div className="glass-card">
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'rgba(99, 102, 241, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem',
            }}>
              <Sparkles size={24} color="var(--accent-indigo)" />
            </div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Intelligent Compromises</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Generate 3 balanced multi-attribute proposals exchanging payment velocity and delivery conditions for price concessions.
            </p>
          </div>

          {/* Feature 4: Bilateral Agreement */}
          <div className="glass-card">
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'rgba(245, 158, 11, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem',
            }}>
              <ShieldCheck size={24} color="var(--accent-amber)" />
            </div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Certified Digital Signatures</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Dual-party execution locks finalized deal parameters with tamper-proof cryptographic audit hashes and exportable sheets.
            </p>
          </div>
        </div>
      </section>

      {/* Accessible & Understandable by Everyone: 3-Step Guide */}
      <section className="container">
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span className="badge badge-cyan" style={{ marginBottom: '0.5rem' }}>Accessible to Everyone</span>
          <h2 style={{ fontSize: '1.85rem', marginBottom: '0.5rem' }}>Commercial Negotiation Made Simple</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '640px', margin: '0 auto' }}>
            No legal jargon, no hidden clauses. Clear terms, Indian Rupees (₹), and step-by-step AI guidance anyone can use.
          </p>
        </div>

        <div className="grid-3" style={{ gap: '1.5rem' }}>
          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(6, 182, 212, 0.2)',
              color: 'var(--accent-sky)',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
            }}>
              1
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Create Room & Share Code</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Enter your item, state your price in Indian Rupees (₹), and send the short 6-character room code to the other party to join instantly.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.2)',
              color: 'var(--accent-emerald)',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
            }}>
              2
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Talk Live & Counteroffer</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Talk in real time with built-in Agora voice. Submit counteroffers with straightforward payment terms (UPI, NEFT, Advance milestones).
            </p>
          </div>

          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(99, 102, 241, 0.2)',
              color: 'var(--accent-indigo)',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
            }}>
              3
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Gemini Plan & Official Quotation</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Gemini AI provides a systematic 6-step negotiation plan with word-for-word scripts and generates an official GST quotation sheet.
            </p>
          </div>
        </div>
      </section>

      {/* Minimal Subscription Pricing Section */}
      <section className="container">
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span className="badge badge-emerald" style={{ marginBottom: '0.5rem' }}>Minimal & Fair Subscription</span>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Zero Bloat. Transparent Indian Pricing.</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '620px', margin: '0 auto' }}>
            Start completely free or upgrade to Pro for the price of a single business lunch. Cancel anytime with a single click.
          </p>
        </div>

        <div className="grid-3" style={{ gap: '1.5rem', alignItems: 'stretch' }}>
          {/* Free Tier */}
          <div className="glass-card" style={{
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            border: '1px solid var(--border-subtle)',
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Free Starter</h3>
                <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>Free Forever</span>
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Ideal for individuals, small vendors, and occasional buyers testing deal rooms.
              </p>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, fontFamily: 'var(--font-heading)', marginBottom: '1.5rem' }}>
                ₹0 <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ month</span>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Check size={16} color="#10B981" /> <span>Up to 3 active negotiation rooms</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Check size={16} color="#10B981" /> <span>Agora live crystal-clear voice audio</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Check size={16} color="#10B981" /> <span>Structured counteroffers in Indian Rupees</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Check size={16} color="#10B981" /> <span>Official commercial quotation viewer</span>
                </li>
              </ul>
            </div>

            <div style={{ marginTop: '2rem' }}>
              <Link to="/register" className="btn btn-secondary" style={{ width: '100%' }}>
                <span>Get Started Free</span>
              </Link>
            </div>
          </div>

          {/* Pro Tier (Recommended) */}
          <div className="glass-card" style={{
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: 'linear-gradient(180deg, rgba(6, 182, 212, 0.08) 0%, rgba(15, 23, 42, 0.95) 100%)',
            border: '2px solid var(--accent-cyan)',
            boxShadow: 'var(--border-glow)',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute',
              top: '-12px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'linear-gradient(135deg, #06B6D4 0%, #10B981 100%)',
              color: '#000000',
              fontWeight: 800,
              fontSize: '0.7rem',
              padding: '0.2rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Most Popular
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-sky)' }}>DealPilot Pro</h3>
                <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>Best Value</span>
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                For active commercial negotiators, procurement teams, and business owners.
              </p>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#FFFFFF', marginBottom: '1.5rem' }}>
                ₹499 <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ month</span>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Check size={16} color="#10B981" /> <strong>Unlimited negotiation rooms</strong>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Check size={16} color="#10B981" /> <strong>Systematic 6-Step Gemini AI Copilot</strong>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Check size={16} color="#10B981" /> <strong>Official GST 18% Commercial Quotation & Print/PDF</strong>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Check size={16} color="#10B981" /> <strong>Bilateral certified signatures with SHA-256 hash</strong>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Check size={16} color="#10B981" /> <strong>3 AI Win-Win multi-attribute compromise cards</strong>
                </li>
              </ul>
            </div>

            <div style={{ marginTop: '2rem' }}>
              <button onClick={() => setIsSubModalOpen(true)} className="btn btn-primary" style={{ width: '100%' }}>
                <Zap size={16} />
                <span>Upgrade to Pro (₹499)</span>
              </button>
            </div>
          </div>

          {/* Pay-As-You-Go */}
          <div className="glass-card" style={{
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            border: '1px solid var(--border-subtle)',
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Single Deal Pass</h3>
                <span className="badge badge-amber" style={{ fontSize: '0.7rem' }}>Pay-As-You-Go</span>
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Close one high-stakes transaction without recurring monthly commitments.
              </p>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, fontFamily: 'var(--font-heading)', marginBottom: '1.5rem' }}>
                ₹99 <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ single deal</span>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Check size={16} color="#10B981" /> <span>Full Gemini Copilot for 1 room</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Check size={16} color="#10B981" /> <span>Formal GST quotation sheet generator</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Check size={16} color="#10B981" /> <span>Unlimited voice call duration</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Check size={16} color="#10B981" /> <span>Permanent deal archive & export</span>
                </li>
              </ul>
            </div>

            <div style={{ marginTop: '2rem' }}>
              <button onClick={() => setIsSubModalOpen(true)} className="btn btn-secondary" style={{ width: '100%' }}>
                <span>Activate Single Deal (₹99)</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Commercial Categories Showcase */}
      <section className="container">
        <div className="glass-panel" style={{ padding: '3rem 2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.85rem', marginBottom: '0.5rem' }}>Tailored Across High-Value Deal Types</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              From multi-year software licensing to precision industrial machinery and commercial leasing.
            </p>
          </div>

          <div className="grid-3" style={{ gap: '1.5rem' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                <Server size={20} color="var(--accent-cyan)" />
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Software & SaaS Infrastructure</h4>
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Negotiate annual SLA tiers, compute GPU reservations, dedicated solution engineering, and milestone billing.
              </p>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                <Wrench size={20} color="var(--accent-emerald)" />
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Equipment & Machinery</h4>
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Structure heavy freight handling, calibration warranties, testing inspection windows, and staged deposits.
              </p>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                <Building2 size={20} color="var(--accent-sky)" />
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Commercial Real Estate</h4>
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Align on tenant improvement allowances, multi-year term lock-ins, reserved parking stalls, and security escrow.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="container">
        <div style={{
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)',
          border: '1px solid var(--border-active)',
          borderRadius: 'var(--radius-xl)',
          padding: '4rem 2rem',
          textAlign: 'center',
          boxShadow: 'var(--shadow-glow)',
        }}>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '1rem' }}>
            Ready to Close Better Deals Today?
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '620px', margin: '0 auto 2rem auto' }}>
            Join forward-thinking enterprise buyers and sellers on DealPilot AI. Launch a room in 30 seconds.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary btn-lg">
              <span>Get Started Now</span>
              <ArrowRight size={18} />
            </Link>
            <button onClick={() => handleDemoAccess('buyer')} className="btn btn-secondary btn-lg">
              <span>Instant Demo Portal</span>
            </button>
          </div>
        </div>
      </section>

      {/* Subscription Modal */}
      <SubscriptionModal isOpen={isSubModalOpen} onClose={() => setIsSubModalOpen(false)} />
    </div>
  );
}
