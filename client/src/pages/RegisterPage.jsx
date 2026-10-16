import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Compass, UserPlus, AlertCircle, ShoppingCart, Tag, ArrowRightLeft } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [rolePreference, setRolePreference] = useState('both');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({ name, email, password, company, rolePreference });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your information.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ minHeight: 'calc(100vh - 180px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '480px', padding: '2.5rem' }}>
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
            Join DealPilot <span className="gradient-text">AI</span>
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

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Alex Morgan"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Corporate Email Address</label>
            <input
              type="email"
              required
              className="form-input"
              placeholder="alex@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="grid-2">
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

            <div className="form-group">
              <label className="form-label">Company / Entity</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Apex Global"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>
          </div>

          {/* Role Preference Selector */}
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Primary Negotiation Role</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setRolePreference('buyer')}
                style={{
                  padding: '0.65rem 0.5rem',
                  borderRadius: 'var(--radius-md)',
                  background: rolePreference === 'buyer' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${rolePreference === 'buyer' ? 'var(--accent-blue)' : 'var(--border-subtle)'}`,
                  color: rolePreference === 'buyer' ? 'var(--accent-sky)' : 'var(--text-secondary)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                <ShoppingCart size={16} />
                <span>Buyer</span>
              </button>

              <button
                type="button"
                onClick={() => setRolePreference('seller')}
                style={{
                  padding: '0.65rem 0.5rem',
                  borderRadius: 'var(--radius-md)',
                  background: rolePreference === 'seller' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${rolePreference === 'seller' ? 'var(--accent-emerald)' : 'var(--border-subtle)'}`,
                  color: rolePreference === 'seller' ? 'var(--accent-emerald)' : 'var(--text-secondary)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                <Tag size={16} />
                <span>Seller</span>
              </button>

              <button
                type="button"
                onClick={() => setRolePreference('both')}
                style={{
                  padding: '0.65rem 0.5rem',
                  borderRadius: 'var(--radius-md)',
                  background: rolePreference === 'both' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${rolePreference === 'both' ? 'var(--accent-indigo)' : 'var(--border-subtle)'}`,
                  color: rolePreference === 'both' ? 'var(--accent-indigo)' : 'var(--text-secondary)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                <ArrowRightLeft size={16} />
                <span>Both</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginBottom: '1.25rem' }}
          >
            <UserPlus size={16} />
            <span>{loading ? 'Creating Profile...' : 'Complete Registration'}</span>
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent-sky)', fontWeight: 600 }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
