import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import {
  Compass,
  ArrowLeft,
  Copy,
  Check,
  Radio,
  Sparkles,
  MessageSquare,
  FileCheck,
  FileText,
  Layers,
  ArrowRightLeft,
  Clock,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { formatINR } from '../utils/formatters';
import api from '../services/api';
import AgoraVoiceBar from '../components/AgoraVoiceBar';
import OfferTimeline from '../components/OfferTimeline';
import OfferModal from '../components/OfferModal';
import GeminiCopilotDrawer from '../components/GeminiCopilotDrawer';
import CompromiseCards from '../components/CompromiseCards';
import FinalDealContract from '../components/FinalDealContract';
import RoomChat from '../components/RoomChat';
import QuotationModal from '../components/QuotationModal';

export default function NegotiationRoomPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();

  const [room, setRoom] = useState(null);
  const [offers, setOffers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [dealAgreement, setDealAgreement] = useState(null);
  const [userRole, setUserRole] = useState('buyer');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('timeline'); // 'timeline' | 'compromises' | 'contract'
  const [rightPanelTab, setRightPanelTab] = useState('copilot'); // 'copilot' | 'chat'

  // Modal State
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [prefillCompromise, setPrefillCompromise] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [notification, setNotification] = useState('');

  const loadRoomData = async () => {
    try {
      const res = await api.getRoom(id);
      if (res.success && res.room) {
        setRoom(res.room);
        setOffers(res.offers || []);
        setMessages(res.messages || []);
        setDealAgreement(res.dealAgreement || null);
        setUserRole(res.userRole || 'buyer');
      }
    } catch (err) {
      console.error('Error fetching room details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoomData();
  }, [id]);

  // Socket.io Real-time subscription
  useEffect(() => {
    if (!socket || !room) return;

    socket.emit('join_room', {
      roomId: room.id,
      user: {
        id: user?.id,
        name: user?.name,
        role: userRole,
      },
    });

    socket.on('new_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on('offer_received', ({ offer }) => {
      setOffers((prev) => [...prev.filter((o) => o.id !== offer.id), offer]);
      setNotification(`New Round ${offer.round_number} offer received: ${formatINR(offer.price)}`);
      setTimeout(() => setNotification(''), 5000);
      loadRoomData();
    });

    socket.on('offer_accepted_broadcast', ({ agreement }) => {
      setDealAgreement(agreement);
      setActiveTab('contract');
      setNotification('Offer accepted! Final Deal Agreement initiated for mutual signing.');
      setTimeout(() => setNotification(''), 6000);
      loadRoomData();
    });

    socket.on('deal_signed_broadcast', ({ signerRole, bothSigned, certificateHash }) => {
      if (bothSigned) {
        setNotification(`🎉 DEAL FULLY CERTIFIED! Both parties have signed (${certificateHash}).`);
      } else {
        setNotification(`Digital signature recorded by ${signerRole}.`);
      }
      setTimeout(() => setNotification(''), 6000);
      loadRoomData();
    });

    return () => {
      socket.emit('leave_room', { roomId: room.id, user });
      socket.off('new_message');
      socket.off('offer_received');
      socket.off('offer_accepted_broadcast');
      socket.off('deal_signed_broadcast');
    };
  }, [socket, room?.id, userRole]);

  const handleCopyCode = () => {
    if (!room?.room_code) return;
    navigator.clipboard.writeText(room.room_code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleAcceptOffer = async (offerId) => {
    try {
      const res = await api.acceptOffer(room.id, offerId);
      if (res.success) {
        setDealAgreement(res.dealAgreement);
        setActiveTab('contract');
        if (socket) {
          socket.emit('offer_accepted', {
            roomId: room.id,
            offerId,
            agreement: res.dealAgreement,
          });
        }
      }
    } catch (err) {
      alert(err.message || 'Error accepting offer');
    }
  };

  const handleRejectOffer = async (offerId) => {
    try {
      await api.rejectOffer(room.id, offerId);
      loadRoomData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSubmitOffer = async (offerData) => {
    const res = await api.submitOffer(room.id, offerData);
    if (res.success && res.offer) {
      setOffers((prev) => [...prev, res.offer]);
      if (socket) {
        socket.emit('offer_submitted', {
          roomId: room.id,
          offer: res.offer,
        });
      }
      loadRoomData();
    }
  };

  const handleAdoptCompromise = (pkg) => {
    setPrefillCompromise(pkg);
    setIsOfferModalOpen(true);
  };

  const handleAdoptCounterPrice = (price) => {
    setPrefillCompromise({ proposedPrice: price });
    setIsOfferModalOpen(true);
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>
          Loading DealPilot negotiation chamber...
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <AlertCircle size={40} color="#F87171" style={{ margin: '0 auto 1rem auto' }} />
        <h2>Negotiation Room Not Found</h2>
        <Link to="/dashboard" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const counterpartName = userRole === 'seller' ? room.counterpart_name : room.creator_name;
  const isFinalized = room.status === 'finalized';

  return (
    <div className="container-wide" style={{ padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Banner Alert (if notification present) */}
      {notification && (
        <div style={{
          background: 'rgba(6, 182, 212, 0.15)',
          border: '1px solid rgba(6, 182, 212, 0.4)',
          borderRadius: 'var(--radius-md)',
          padding: '0.75rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          color: 'var(--accent-sky)',
          fontSize: '0.9rem',
          fontWeight: 600,
          animation: 'modalEnter 0.2s ease',
        }}>
          <Sparkles size={18} />
          <span>{notification}</span>
        </div>
      )}

      {/* Room Header Toolbar */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <Link to="/dashboard" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }} title="Back to dashboard">
                <ArrowLeft size={16} />
              </Link>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 800 }}>{room.title}</h1>
              <span className="badge badge-cyan">{room.category}</span>
              <span className={`badge ${isFinalized ? 'badge-emerald' : 'badge-amber'}`}>
                {isFinalized ? 'Finalized' : room.status.replace('_', ' ')}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
              <span>Initial Quote: <strong>{formatINR(room.initial_price)}</strong></span>
              <span>•</span>
              <span>Your Role: <strong style={{ color: userRole === 'buyer' ? 'var(--accent-sky)' : 'var(--accent-emerald)', textTransform: 'uppercase' }}>{userRole}</strong></span>
              <span>•</span>
              <span>Counterpart: <strong>{counterpartName || 'Awaiting Partner'}</strong></span>
            </div>
          </div>

          {/* Quick Room Code Share Box & Quotation Trigger */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <div style={{
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0.4rem 0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
            }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Code:</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, letterSpacing: '0.05em', color: 'var(--accent-cyan)' }}>
                {room.room_code}
              </span>
              <button
                onClick={handleCopyCode}
                className="btn btn-ghost btn-sm"
                style={{ padding: '0.2rem' }}
                title="Copy Room Code to share with counterpart"
              >
                {copiedCode ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
              </button>
            </div>

            <button
              onClick={() => setShowQuotationModal(true)}
              className="btn btn-secondary btn-sm"
              title="View Official Commercial Quotation"
            >
              <FileText size={15} color="var(--accent-sky)" />
              <span>Commercial Quotation</span>
            </button>

            <button
              onClick={() => { setPrefillCompromise(null); setIsOfferModalOpen(true); }}
              className="btn btn-primary btn-sm"
            >
              <ArrowRightLeft size={15} />
              <span>Counteroffer (₹)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Agora Real-Time Voice Calling Bar */}
      <AgoraVoiceBar
        roomId={room.id}
        roomTitle={room.title}
        user={user}
        counterpart={counterpartName}
      />

      {/* Main Negotiation Workspace (2 Column Grid) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.35fr) minmax(360px, 0.95fr)',
        gap: '1.5rem',
        alignItems: 'start',
      }}>
        {/* Left Column: Offers, Compromises, and Agreement */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Main Tab Controls */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(0, 0, 0, 0.3)',
            padding: '0.35rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
          }}>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`btn btn-sm ${activeTab === 'timeline' ? 'btn-secondary' : 'btn-ghost'}`}
              style={{ flex: 1, background: activeTab === 'timeline' ? 'rgba(255, 255, 255, 0.12)' : 'transparent' }}
            >
              <Layers size={15} />
              <span>Offer History ({offers.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('compromises')}
              className={`btn btn-sm ${activeTab === 'compromises' ? 'btn-secondary' : 'btn-ghost'}`}
              style={{ flex: 1, background: activeTab === 'compromises' ? 'rgba(255, 255, 255, 0.12)' : 'transparent', color: activeTab === 'compromises' ? 'var(--accent-sky)' : 'inherit' }}
            >
              <Sparkles size={15} />
              <span>AI Compromises (3)</span>
            </button>

            <button
              onClick={() => setActiveTab('contract')}
              className={`btn btn-sm ${activeTab === 'contract' ? 'btn-secondary' : 'btn-ghost'}`}
              style={{ flex: 1, background: activeTab === 'contract' ? 'rgba(255, 255, 255, 0.12)' : 'transparent', color: isFinalized ? '#34D399' : 'inherit' }}
            >
              <FileCheck size={15} />
              <span>Bilateral Contract</span>
            </button>
          </div>

          {/* Active Tab View */}
          {activeTab === 'timeline' && (
            <OfferTimeline
              offers={offers}
              currency="INR"
              currentUserId={user?.id}
              currentUserRole={userRole}
              onAcceptOffer={handleAcceptOffer}
              onOpenCounterModal={() => { setPrefillCompromise(null); setIsOfferModalOpen(true); }}
              onRejectOffer={handleRejectOffer}
              onConsultAi={() => setRightPanelTab('copilot')}
              onOpenQuotation={() => setShowQuotationModal(true)}
            />
          )}

          {activeTab === 'compromises' && (
            <CompromiseCards
              roomId={room.id}
              currency="INR"
              onAdoptCompromise={handleAdoptCompromise}
            />
          )}

          {activeTab === 'contract' && (
            <FinalDealContract
              dealAgreement={dealAgreement}
              room={room}
              currentUser={user}
              onRefresh={loadRoomData}
              onOpenQuotation={() => setShowQuotationModal(true)}
            />
          )}
        </div>

        {/* Right Column: Systematic Gemini Copilot & In-Room Chat */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'sticky', top: '5rem' }}>
          {/* Right Panel Sub-tab selector */}
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', padding: '0.25rem', borderRadius: 'var(--radius-md)' }}>
            <button
              onClick={() => setRightPanelTab('copilot')}
              style={{
                flex: 1,
                padding: '0.45rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
                background: rightPanelTab === 'copilot' ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                color: rightPanelTab === 'copilot' ? 'var(--accent-sky)' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
              }}
            >
              <Sparkles size={15} />
              <span>Gemini AI Copilot</span>
            </button>

            <button
              onClick={() => setRightPanelTab('chat')}
              style={{
                flex: 1,
                padding: '0.45rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
                background: rightPanelTab === 'chat' ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                color: rightPanelTab === 'chat' ? 'var(--accent-sky)' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
              }}
            >
              <MessageSquare size={15} />
              <span>Room Chat ({messages.length})</span>
            </button>
          </div>

          {rightPanelTab === 'copilot' ? (
            <GeminiCopilotDrawer
              roomId={room.id}
              userRole={userRole}
              onAdoptCounterPrice={handleAdoptCounterPrice}
              onOpenCompromises={() => setActiveTab('compromises')}
              onOpenQuotation={() => setShowQuotationModal(true)}
            />
          ) : (
            <RoomChat
              roomId={room.id}
              messages={messages}
              currentUser={user}
              userRole={userRole}
            />
          )}
        </div>
      </div>

      {/* Offer / Counteroffer Submission Modal */}
      <OfferModal
        isOpen={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
        onSubmit={handleSubmitOffer}
        currency="INR"
        latestOffer={offers[offers.length - 1]}
        userRole={userRole}
        prefillValues={prefillCompromise}
      />

      {/* Official Commercial Quotation Modal */}
      <QuotationModal
        isOpen={showQuotationModal}
        onClose={() => setShowQuotationModal(false)}
        roomId={room.id}
      />
    </div>
  );
}
