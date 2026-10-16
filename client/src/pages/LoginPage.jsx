import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Compass, LogIn, Sparkles, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (role) => {
    setError('');
    setLoading(true);
    try {
      await demoLogin(role);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ minHeight: 'calc(100vh - 180px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem' }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto',
            boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)',
          }}>
            <Compass size={26} color="#FFFFFF" />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.35rem' }}>
            Welcome to DealPilot <span className="gradient-text">AI</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Negotiate Smarter. Deal Better. Close with Confidence.
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem',
            color: '#F87171',
            fontSize: '0.825rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1.25rem',
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Corporate Email Address</label>
            <input
              type="email"
              required
              className="form-input"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              required
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem', marginBottom: '1.5rem' }}
          >
            <LogIn size={16} />
            <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
          </button>
        </form>

        {/* One-Click Demo Credentials */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
          marginBottom: '1.5rem',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
            <Sparkles size={13} color="var(--accent-cyan)" />
            <span>Instant Demo Access</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <button
              onClick={() => handleDemo('buyer')}
              type="button"
              className="btn btn-secondary btn-sm"
            >
              Demo Buyer
            </button>
            <button
              onClick={() => handleDemo('seller')}
              type="button"
              className="btn btn-secondary btn-sm"
            >
              Demo Seller
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--accent-sky)', fontWeight: 600 }}>
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
