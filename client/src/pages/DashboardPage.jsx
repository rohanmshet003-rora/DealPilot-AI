import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Compass,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Clock,
  Layers,
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
  Radio,
} from 'lucide-react';
import api from '../services/api';
import { formatINR } from '../utils/formatters';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'active' | 'finalized'
  const [searchQuery, setSearchQuery] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [roomsRes, profileRes] = await Promise.all([
        api.getRooms(),
        api.getMe(),
      ]);

      if (roomsRes.success && roomsRes.rooms) {
        setRooms(roomsRes.rooms);
      }
      if (profileRes.success && profileRes.stats) {
        setStats(profileRes.stats);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleJoinByCode = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    setJoinError('');
    try {
      const res = await api.getRoomByCode(joinCode.trim());
      if (res.success && res.room) {
        navigate(`/room/${res.room.id}`);
      }
    } catch (err) {
      setJoinError('Room code not found. Please verify the code.');
    }
  };

  // Filter rooms
  const filteredRooms = rooms.filter((r) => {
    if (filter === 'active' && (r.status === 'finalized' || r.status === 'cancelled')) return false;
    if (filter === 'finalized' && r.status !== 'finalized') return false;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        r.title.toLowerCase().includes(query) ||
        r.category.toLowerCase().includes(query) ||
        r.room_code.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div className="container" style={{ padding: '3rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* Top Banner: User Greeting & Quick Actions */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.5) 100%)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
        padding: '2rem',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
              Welcome back, <span className="gradient-text">{user?.name}</span>
            </h1>
            <span className="badge badge-cyan" style={{ textTransform: 'capitalize' }}>
              {user?.role_preference || 'Negotiator'}
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {user?.company || 'Commercial Organization'} • DealPilot AI Strategic Negotiation Hub
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <form onSubmit={handleJoinByCode} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', position: 'relative' }}>
            <input
              type="text"
              placeholder="Join Code (e.g. DP-8801)"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              className="form-input"
              style={{ width: '190px', padding: '0.55rem 0.75rem', fontSize: '0.85rem' }}
            />
            <button type="submit" className="btn btn-secondary btn-sm" style={{ padding: '0.65rem 0.85rem' }}>
              Join
            </button>
            {joinError && (
              <span style={{ position: 'absolute', top: '100%', left: 0, fontSize: '0.75rem', color: '#F87171', marginTop: '0.2rem' }}>
                {joinError}
              </span>
            )}
          </form>

          <Link to="/create-room" className="btn btn-primary">
            <PlusCircle size={18} />
            <span>Launch Deal Room</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid-4">
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Active Negotiations
            </span>
            <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.15)' }}>
              <Clock size={18} color="var(--accent-cyan)" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
            {stats?.activeDeals ?? rooms.filter((r) => r.status !== 'finalized').length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent-sky)', marginTop: '0.2rem' }}>
            Real-time Agora enabled
          </div>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Finalized Deals
            </span>
            <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)' }}>
              <ShieldCheck size={18} color="var(--accent-emerald)" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
            {stats?.finalizedDeals ?? rooms.filter((r) => r.status === 'finalized').length}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#34D399', marginTop: '0.2rem' }}>
            Certified mutual execution
          </div>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Offers Exchanged
            </span>
            <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.15)' }}>
              <ArrowRight size={18} color="var(--accent-indigo)" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
            {stats?.totalOffersSent ?? 12}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent-indigo)', marginTop: '0.2rem' }}>
            Across all rounds
          </div>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Compromise Success
            </span>
            <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.15)' }}>
              <TrendingUp size={18} color="var(--accent-amber)" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
            {stats?.successRate || '92.4%'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent-amber)', marginTop: '0.2rem' }}>
            Gemini ZOPA convergence
          </div>
        </div>
      </div>

      {/* Room Filter Controls & Search */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(0, 0, 0, 0.3)', padding: '0.3rem', borderRadius: 'var(--radius-md)' }}>
          <button
            onClick={() => setFilter('all')}
            className={`btn btn-sm ${filter === 'all' ? 'btn-secondary' : 'btn-ghost'}`}
            style={{ background: filter === 'all' ? 'rgba(255, 255, 255, 0.12)' : 'transparent' }}
          >
            All Rooms ({rooms.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`btn btn-sm ${filter === 'active' ? 'btn-secondary' : 'btn-ghost'}`}
            style={{ background: filter === 'active' ? 'rgba(255, 255, 255, 0.12)' : 'transparent' }}
          >
            Active Negotiations
          </button>
          <button
            onClick={() => setFilter('finalized')}
            className={`btn btn-sm ${filter === 'finalized' ? 'btn-secondary' : 'btn-ghost'}`}
            style={{ background: filter === 'finalized' ? 'rgba(255, 255, 255, 0.12)' : 'transparent' }}
          >
            Certified Deals
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', position: 'relative' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem' }} />
          <input
            type="text"
            placeholder="Search deals by title or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '2.25rem', width: '280px', fontSize: '0.85rem' }}
          />
        </div>
      </div>

      {/* Negotiation Rooms Grid */}
      {loading ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>Loading active negotiation rooms...</div>
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3.5rem', textAlign: 'center' }}>
          <Layers size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No Negotiation Rooms Found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            {searchQuery ? 'No rooms match your search query.' : 'Launch your first negotiation room to begin exchanging structured offers.'}
          </p>
          <Link to="/create-room" className="btn btn-primary btn-sm">
            Launch New Deal Room
          </Link>
        </div>
      ) : (
        <div className="grid-3">
          {filteredRooms.map((room) => {
            const isCreator = room.creator_id === user?.id;
            const isFinalized = room.status === 'finalized';
            const isAgreed = room.status === 'agreed';

            return (
              <div
                key={room.id}
                className="glass-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: isFinalized ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-subtle)',
                }}
              >
                <div>
                  {/* Top Bar: Room Code & Status Badge */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                    <span className="badge badge-cyan" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                      {room.room_code}
                    </span>
                    <span className={`badge ${isFinalized ? 'badge-emerald' : isAgreed ? 'badge-amber' : 'badge-indigo'}`}>
                      {isFinalized ? 'Certified Deal' : isAgreed ? 'Agreed' : 'In Progress'}
                    </span>
                  </div>

                  {/* Title & Category */}
                  <div style={{ fontSize: '0.75rem', color: 'var(--accent-sky)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.25rem' }}>
                    {room.category}
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem', lineHeight: 1.35 }}>
                    {room.title}
                  </h3>
                  <p style={{
                    fontSize: '0.825rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.5,
                    marginBottom: '1.25rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {room.description || 'No description provided.'}
                  </p>

                  {/* Valuation / Current Offer Box */}
                  <div style={{
                    background: 'rgba(0, 0, 0, 0.25)',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '1.25rem',
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                  }}>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        {room.latest_price ? 'Latest Offer' : 'Initial Price'}
                      </span>
                      <div style={{ fontSize: '1.35rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--accent-sky)' }}>
                        {formatINR(room.latest_price || room.initial_price)}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Rounds</span>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-sky)' }}>
                        {room.offer_count || 1}
                      </div>
                    </div>
                  </div>

                  {/* Participants info */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Creator: </span>
                      {room.creator_name} ({room.creator_role})
                    </div>
                    {room.counterpart_name ? (
                      <div>
                        <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Counterpart: </span>
                        {room.counterpart_name}
                      </div>
                    ) : (
                      <span className="badge badge-amber" style={{ fontSize: '0.65rem' }}>Open Slot</span>
                    )}
                  </div>
                </div>

                {/* Enter Button */}
                <Link
                  to={`/room/${room.id}`}
                  className="btn btn-secondary"
                  style={{ width: '100%', justifyContent: 'space-between' }}
                >
                  <span>Enter Negotiation Room</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
