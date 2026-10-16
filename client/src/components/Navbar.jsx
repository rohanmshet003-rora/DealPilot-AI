import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Compass, PlusCircle, LayoutDashboard, LogIn, LogOut, ArrowRight, Zap } from 'lucide-react';
import api from '../services/api';
import SubscriptionModal from './SubscriptionModal';

export default function Navbar() {
  const { user, isAuthenticated, logout, demoLogin } = useAuth();
  const navigate = useNavigate();
  const [quickCode, setQuickCode] = useState('');
  const [quickError, setQuickError] = useState('');
  const [showSubscription, setShowSubscription] = useState(false);

  const handleQuickJoin = async (e) => {
    e.preventDefault();
    if (!quickCode.trim()) return;
    setQuickError('');
    try {
      const res = await api.getRoomByCode(quickCode.trim());
      if (res.success && res.room) {
        navigate(`/room/${res.room.id}`);
        setQuickCode('');
      }
    } catch (err) {
      setQuickError('Room not found');
      setTimeout(() => setQuickError(''), 3000);
    }
  };

  return (
    <>
      <nav style={{
        borderBottom: '1px solid var(--border-subtle)',
        background: 'rgba(11, 15, 25, 0.92)',
        backdropFilter: 'blur(16px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        padding: '0.85rem 0',
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          {/* Brand Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '9px',
              background: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 14px rgba(6, 182, 212, 0.35)',
            }}>
              <Compass size={20} color="#FFFFFF" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 800 }}>
                  DealPilot <span className="gradient-text">AI</span>
                </span>
                <span className="badge badge-cyan" style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem' }}>
                  ₹ INR
                </span>
              </div>
            </div>
          </Link>

          {/* Quick Room Code Join Form */}
          <form onSubmit={handleQuickJoin} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', position: 'relative' }}>
            <input
              type="text"
              placeholder="Room Code (e.g. DP-8801)"
              value={quickCode}
              onChange={(e) => setQuickCode(e.target.value.toUpperCase())}
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '0.45rem 0.75rem',
                color: 'var(--text-primary)',
                fontSize: '0.825rem',
                width: '180px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            />
            <button type="submit" className="btn btn-secondary btn-sm" title="Join Deal Room">
              <ArrowRight size={14} />
            </button>
            {quickError && (
              <div style={{ position: 'absolute', top: '100%', left: 0, fontSize: '0.75rem', color: '#F87171', marginTop: '0.2rem' }}>
                {quickError}
              </div>
            )}
          </form>

          {/* Right Links & Minimal Subscription Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button
              onClick={() => setShowSubscription(true)}
              className="btn btn-ghost btn-sm"
              style={{ color: 'var(--accent-sky)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Zap size={14} />
              <span>Plans (₹0 / ₹499)</span>
            </button>

            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="btn btn-ghost btn-sm">
                  <LayoutDashboard size={15} />
                  <span>Dashboard</span>
                </Link>
                <Link to="/create-room" className="btn btn-primary btn-sm">
                  <PlusCircle size={15} />
                  <span>New Deal</span>
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '0.4rem', borderLeft: '1px solid var(--border-subtle)', paddingLeft: '0.65rem' }}>
                  <div style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    backgroundColor: user?.avatar_color || '#3B82F6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: '#FFFFFF',
                  }}>
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <span style={{ fontSize: '0.825rem', fontWeight: 600 }}>{user?.name?.split(' ')[0]}</span>
                  <button onClick={logout} className="btn btn-ghost btn-sm" title="Logout" style={{ padding: '0.35rem' }}>
                    <LogOut size={15} color="var(--text-muted)" />
                  </button>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <button onClick={() => demoLogin('buyer')} className="btn btn-secondary btn-sm">
                  Buyer Demo
                </button>
                <button onClick={() => demoLogin('seller')} className="btn btn-secondary btn-sm">
                  Seller Demo
                </button>
                <Link to="/login" className="btn btn-primary btn-sm">
                  <LogIn size={14} />
                  <span>Sign In</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      <SubscriptionModal
        isOpen={showSubscription}
        onClose={() => setShowSubscription(false)}
      />
    </>
  );
}
