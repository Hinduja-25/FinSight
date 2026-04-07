import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Wallet, UserPlus } from 'lucide-react';

const Signup = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      await axios.post('/api/signup', formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account. Please try again.');
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)' }} className="animate-fade-in">
      <div className="premium-card shadow-xl" style={{ width: '100%', maxWidth: '450px', padding: '48px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ 
            background: '#81A6C6', 
            padding: '16px', 
            borderRadius: '20px',
            boxShadow: '0 8px 24px -4px rgba(129, 166, 198, 0.5)'
          }}>
            <Wallet color="white" size={32} />
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', textAlign: 'center' }}>Create Account</h1>
          <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Start managing your finances intelligence.</p>
        </div>

        {error && (
          <div style={{ background: '#E07A5F15', color: '#E07A5F', padding: '12px 16px', borderRadius: '12px', fontSize: '0.9rem', fontWeight: '600' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-main)', fontWeight: '600' }}>Full Name</label>
            <input 
              type="text" 
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              placeholder="John Doe"
              required
              style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1.5px solid var(--card-border)' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-main)', fontWeight: '600' }}>Email Address</label>
            <input 
              type="email" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="you@example.com"
              required
              style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1.5px solid var(--card-border)' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-main)', fontWeight: '600' }}>Password</label>
            <input 
              type="password" 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              placeholder="••••••••"
              required
              minLength="6"
              style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1.5px solid var(--card-border)' }}
            />
          </div>
          
          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '12px', padding: '14px' }}>
            <UserPlus size={20} />
            Sign Up
          </button>
        </form>

        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: '500' }}>
          Already have an account? <Link to="/login" style={{ color: '#81A6C6', fontWeight: '700', textDecoration: 'none' }}>Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
