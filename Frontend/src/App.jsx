import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Income from './pages/Income';
import Expenses from './pages/Expenses';
import AIInsights from './pages/AIInsights';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ChatBot from './components/ChatBot';
import { AuthContext, AuthProvider } from './context/AuthContext';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const { token } = useContext(AuthContext);
  return token ? children : <Navigate to="/login" replace />;
};

// Main App Content that uses the Router hooks
const AppContent = () => {
  const { token } = useContext(AuthContext);
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  // --- 1. If it's the root path, always go to login ---
  if (location.pathname === '/') {
    return <Navigate to="/login" replace />;
  }

  // --- 2. If not logged in and not on login/signup, redirect to login ---
  if (!token && !isAuthPage) {
    return <Navigate to="/login" replace />;
  }

  // --- 3. If it's an Auth Page, show it directly (no auto-redirect to dashboard) ---
  if (isAuthPage) {
    return (
      <div className="auth-page-container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    );
  }

  // --- 3. Otherwise show the Dashboard Layout ---
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)' }}>
      <Sidebar />
      <main className="main-content" style={{ flex: 1 }}>
        <div className="page-container">
          <Routes>
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/income" element={<ProtectedRoute><Income /></ProtectedRoute>} />
            <Route path="/expenses" element={<ProtectedRoute><Expenses /></ProtectedRoute>} />
            <Route path="/ai-insights" element={<ProtectedRoute><AIInsights /></ProtectedRoute>} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </main>
      <ChatBot />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
