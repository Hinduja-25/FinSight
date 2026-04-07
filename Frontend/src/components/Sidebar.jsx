import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  Sparkles,
  LogOut,
  Wallet
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={22} />, path: '/dashboard' },
    { name: 'Income', icon: <TrendingUp size={22} />, path: '/income' },
    { name: 'Expenses', icon: <TrendingDown size={22} />, path: '/expenses' },
    { name: 'AI Insights', icon: <Sparkles size={22} />, path: '/ai-insights' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="sidebar animate-fade-in shadow-xl">
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '64px', padding: '0 8px' }}>
        <div style={{
          background: '#81A6C6',
          padding: '12px',
          borderRadius: '14px',
          boxShadow: '0 8px 16px -4px rgba(129, 166, 198, 0.4)'
        }}>
          <Wallet color="white" size={24} />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#22223B' }}>Fin<span className="gradient-text">Sight</span></h2>
      </div>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => `nav-link ${isActive ? 'active shadow-sm' : ''}`}
          >
            <div style={{ opacity: 0.9 }}>{item.icon}</div>
            <span style={{ fontSize: '0.95rem' }}>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div style={{ marginTop: 'auto', borderTop: '2px solid #F1F2F6', paddingTop: '32px' }}>
        <button className="nav-link" onClick={handleLogout} style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', color: '#E07A5F' }}>
          <LogOut size={22} />
          <span style={{ fontSize: '0.95rem' }}>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
