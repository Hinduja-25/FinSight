import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Wallet, LogIn } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await axios.post('/api/login', formData);
      localStorage.setItem('username', response.data.username);
      login(response.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login. Please try again.');
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
          <h1 style={{ fontSize: '2rem', fontWeight: '800', textAlign: 'center' }}>Welcome Back</h1>
          <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Enter your details to access your account.</p>
        </div>

        {error && (
          <div style={{ background: '#E07A5F15', color: '#E07A5F', padding: '12px 16px', borderRadius: '12px', fontSize: '0.9rem', fontWeight: '600' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
              style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1.5px solid var(--card-border)' }}
            />
          </div>
          
          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '12px', padding: '14px' }}>
            <LogIn size={20} />
            Sign In
          </button>
        </form>

        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: '500' }}>
          Don't have an account? <Link to="/signup" style={{ color: '#81A6C6', fontWeight: '700', textDecoration: 'none' }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
