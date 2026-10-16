import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Cpu,
  Send,
  RefreshCw,
  Copy,
  Check,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  FileText,
  Volume2,
  Layers,
} from 'lucide-react';
import { formatINR } from '../utils/formatters';
import api from '../services/api';

export default function GeminiCopilotDrawer({
  roomId,
  userRole = 'buyer',
  onAdoptCounterPrice,
  onOpenCompromises,
  onOpenQuotation,
}) {
  const [activeTab, setActiveTab] = useState('systematic'); // 'systematic' | 'chat'
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedVoiceScript, setCopiedVoiceScript] = useState(false);

  // Copilot interactive chat
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'ai',
      text: `Namaste! I am your DealPilot AI Copilot powered by Google Gemini. I analyze your negotiation leverage as the ${userRole.toUpperCase()} in Indian Rupees (₹) and formulate systematic step-by-step strategies. Ask me anything or review your systematic plan.`,
    },
  ]);
  const [query, setQuery] = useState('');
  const [sendingChat, setSendingChat] = useState(false);

  const fetchAnalysis = async () => {
    setLoading(true);
    try {
      const res = await api.getAiAnalysis(roomId);
      if (res.success && res.analysis) {
        setAnalysis(res.analysis);
      }
    } catch (err) {
      console.warn('Fetch AI analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, [roomId, userRole]);

  const handleCopyChatScript = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  const handleCopyVoiceScript = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedVoiceScript(true);
    setTimeout(() => setCopiedVoiceScript(false), 2500);
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!query.trim() || sendingChat) return;

    const userText = query.trim();
    setChatMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setQuery('');
    setSendingChat(true);

    try {
      const res = await api.chatAiCopilot(roomId, userText);
      if (res.success && res.reply) {
        setChatMessages((prev) => [...prev, { sender: 'ai', text: res.reply }]);
      }
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'Trade non-cash value (e.g. 50/50 payment milestone protection or GST input tax credit) rather than conceding solely on price in ₹.',
        },
      ]);
    } finally {
      setSendingChat(false);
    }
  };

  const health = analysis?.step1_health;
  const gapData = analysis?.step2_gap;
  const strategy = analysis?.step3_strategy;
  const recommendation = analysis?.step4_recommendation;
  const scripts = analysis?.step5_scripts;
  const checklist = analysis?.step6_checklist;

  const leverage = health?.leverageScore || analysis?.leverageScore || 55;
  const leverageColor = leverage >= 65 ? '#10B981' : leverage >= 50 ? '#38BDF8' : '#F59E0B';

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%', minHeight: '560px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 12px rgba(6, 182, 212, 0.4)',
          }}>
            <Cpu size={18} color="#FFFFFF" />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>Gemini AI Copilot</span>
              <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>Systematic</span>
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Strategist for {userRole.toUpperCase()} • Values in INR (₹)
            </span>
          </div>
        </div>

        {/* Tab Switcher & Refresh Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.2rem', borderRadius: 'var(--radius-md)', display: 'flex', gap: '0.2rem' }}>
            <button
              onClick={() => setActiveTab('systematic')}
              style={{
                padding: '0.35rem 0.65rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
                background: activeTab === 'systematic' ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                color: activeTab === 'systematic' ? 'var(--text-primary)' : 'var(--text-muted)',
              }}
            >
              Systematic Plan
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              style={{
                padding: '0.35rem 0.65rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
                background: activeTab === 'chat' ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                color: activeTab === 'chat' ? 'var(--text-primary)' : 'var(--text-muted)',
              }}
            >
              Copilot Chat
            </button>
          </div>
          <button
            onClick={fetchAnalysis}
            disabled={loading}
            className="btn btn-ghost"
            style={{ padding: '0.4rem' }}
            title="Refresh Systematic Analysis"
          >
            <RefreshCw size={15} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          </button>
        </div>
      </div>

      {/* Tab 1: Systematic Step-by-Step Plan */}
      {activeTab === 'systematic' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', overflowY: 'auto', flex: 1, paddingRight: '0.25rem' }}>
          {/* STEP 1: Deal Health & Leverage Position */}
          <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-sky)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Step 1: Leverage & Position Health
              </span>
              <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: leverageColor, border: `1px solid ${leverageColor}` }}>
                {health?.leverageStatus || 'Balanced Position'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Bargaining Power</span>
              <span style={{ fontSize: '1.35rem', fontWeight: 800, color: leverageColor, fontFamily: 'var(--font-heading)' }}>
                {leverage} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/ 100</span>
              </span>
            </div>

            <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden', marginBottom: '0.75rem' }}>
              <div style={{ width: `${leverage}%`, height: '100%', background: `linear-gradient(90deg, #38BDF8, ${leverageColor})`, transition: 'width 0.4s ease' }} />
            </div>

            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
              {health?.summary || analysis?.leverageAssessment || 'Evaluating offer timeline...'}
            </p>
          </div>

          {/* STEP 2: Systematic Price Gap Breakdown */}
          {gapData && (
            <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.1rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-sky)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.75rem' }}>
                Step 2: Valuation Gap & Math Breakdown
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.65rem', marginBottom: '0.75rem' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Seller Current Quote</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#34D399' }}>{gapData.sellerPrice}</div>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Buyer Current Offer</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#60A5FA' }}>{gapData.buyerPrice}</div>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Valuation Difference</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#F87171' }}>{gapData.valuationGap}</div>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Fair Equilibrium</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent-sky)' }}>{gapData.equilibriumPrice}</div>
                </div>
              </div>

              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                {gapData.analysis}
              </p>
            </div>
          )}

          {/* STEP 3: 3-Phase Tactical Execution Plan */}
          {strategy && (
            <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.1rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-sky)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.75rem' }}>
                Step 3: 3-Phase Tactical Roadmap
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.825rem' }}>
                <div style={{ borderLeft: '3px solid var(--accent-blue)', paddingLeft: '0.65rem' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Phase 1 (Anchor): </strong>
                  <span style={{ color: 'var(--text-secondary)' }}>{strategy.phase1_anchor}</span>
                </div>
                <div style={{ borderLeft: '3px solid var(--accent-emerald)', paddingLeft: '0.65rem' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Phase 2 (Trade-Off): </strong>
                  <span style={{ color: 'var(--text-secondary)' }}>{strategy.phase2_concession}</span>
                </div>
                <div style={{ borderLeft: '3px solid var(--accent-amber)', paddingLeft: '0.65rem' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Phase 3 (Close): </strong>
                  <span style={{ color: 'var(--text-secondary)' }}>{strategy.phase3_close}</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Recommended Counteroffer Package */}
          {recommendation && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.12) 0%, rgba(59, 130, 246, 0.12) 100%)',
              border: '1px solid rgba(6, 182, 212, 0.35)',
              borderRadius: 'var(--radius-md)',
              padding: '1.1rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>
                  Step 4: Recommended Counteroffer
                </span>
                <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>Target Package</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Suggested Price</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF', fontFamily: 'var(--font-heading)' }}>
                    {recommendation.formattedCounterPrice || formatINR(recommendation.counterPrice)}
                  </div>
                </div>
                <button
                  onClick={() => onAdoptCounterPrice && onAdoptCounterPrice(recommendation.counterPrice)}
                  className="btn btn-primary btn-sm"
                >
                  <span>Use This Price</span>
                  <ArrowUpRight size={14} />
                </button>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div>• <strong>Payment:</strong> {recommendation.paymentTerms}</div>
                <div>• <strong>Fulfillment:</strong> {recommendation.deliveryTerms} ({recommendation.inspectionDays} Days Inspection)</div>
                <div style={{ marginTop: '0.25rem', color: 'var(--text-muted)' }}>{recommendation.rationale}</div>
              </div>
            </div>
          )}

          {/* STEP 5: Ready-to-Send Dialogue Scripts */}
          {scripts && (
            <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.1rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-sky)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.75rem' }}>
                Step 5: Ready-to-Send Negotiation Scripts
              </div>

              {/* Chat Message Script */}
              <div style={{ marginBottom: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Room Chat Message Script</span>
                  <button
                    onClick={() => handleCopyChatScript(scripts.chatScript)}
                    className="btn btn-ghost btn-sm"
                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                  >
                    {copiedScript ? <Check size={13} color="#10B981" /> : <Copy size={13} />}
                    <span>{copiedScript ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div style={{
                  background: 'rgba(0,0,0,0.3)',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  lineHeight: 1.45,
                  color: 'var(--text-secondary)',
                  fontStyle: 'italic',
                }}>
                  "{scripts.chatScript}"
                </div>
              </div>

              {/* Agora Voice Call Speaking Script */}
              {scripts.voiceCallScript && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Volume2 size={13} color="var(--accent-cyan)" />
                      <span>Speaking Script for Agora Call</span>
                    </span>
                    <button
                      onClick={() => handleCopyVoiceScript(scripts.voiceCallScript)}
                      className="btn btn-ghost btn-sm"
                      style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                    >
                      {copiedVoiceScript ? <Check size={13} color="#10B981" /> : <Copy size={13} />}
                      <span>{copiedVoiceScript ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div style={{
                    background: 'rgba(0,0,0,0.3)',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    lineHeight: 1.45,
                    color: 'var(--text-secondary)',
                    fontStyle: 'italic',
                  }}>
                    {scripts.voiceCallScript}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 6: Pre-Signing Safety Checklist */}
          {checklist && checklist.length > 0 && (
            <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.1rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-sky)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.75rem' }}>
                Step 6: Pre-Signing Safety Checklist
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {checklist.map((item, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.45rem' }}>
                    <CheckCircle2 size={15} color="#10B981" style={{ marginTop: '0.15rem', flexShrink: 0 }} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action CTAs: Quotation and Compromises */}
          <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
            <button
              onClick={onOpenQuotation}
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'center' }}
            >
              <FileText size={15} color="var(--accent-sky)" />
              <span>View Quotation</span>
            </button>
            <button
              onClick={onOpenCompromises}
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'center', borderColor: 'rgba(16, 185, 129, 0.4)', color: '#34D399' }}
            >
              <Sparkles size={15} />
              <span>Win-Win Trade-Offs</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Interactive Copilot Chat */}
      {activeTab === 'chat' && (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', flex: 1 }}>
          <div style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            paddingRight: '0.25rem',
            marginBottom: '1rem',
            maxHeight: '400px',
          }}>
            {chatMessages.map((msg, i) => {
              const isAi = msg.sender === 'ai';
              return (
                <div
                  key={i}
                  style={{
                    alignSelf: isAi ? 'flex-start' : 'flex-end',
                    maxWidth: '88%',
                    background: isAi ? 'rgba(30, 41, 59, 0.85)' : 'linear-gradient(135deg, #0284C7 0%, #2563EB 100%)',
                    border: isAi ? '1px solid var(--border-subtle)' : 'none',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.75rem 0.95rem',
                    fontSize: '0.85rem',
                    lineHeight: 1.5,
                    color: '#FFFFFF',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {isAi && (
                    <div style={{ fontSize: '0.7rem', color: 'var(--accent-sky)', fontWeight: 700, marginBottom: '0.25rem' }}>
                      DealPilot AI Copilot
                    </div>
                  )}
                  {msg.text}
                </div>
              );
            })}
            {sendingChat && (
              <div style={{ alignSelf: 'flex-start', background: 'rgba(30, 41, 59, 0.85)', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Gemini is formulating strategy in ₹...
              </div>
            )}
          </div>

          {/* Chat input */}
          <form onSubmit={handleSendChat} style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
            <input
              type="text"
              placeholder="Ask Copilot (e.g. 'How do I counter their ₹7 Lakh offer?')"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="form-input"
              style={{ flex: 1, fontSize: '0.85rem' }}
            />
            <button type="submit" disabled={sendingChat || !query.trim()} className="btn btn-primary btn-sm">
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
