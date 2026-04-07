import React, { useState, useEffect } from 'react';
import { TrendingUp, Plus, Trash2, Download } from 'lucide-react';
import axios from 'axios';

const Income = () => {
  const [incomes, setIncomes] = useState([]);
  const [formData, setFormData] = useState({ amount: '', source: '', date: '', description: '', expected_date: '', status: 'received' });

  // Fetch from Flask Backend
  useEffect(() => {
    const fetchIncomes = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/income', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIncomes(res.data);
      } catch (err) {
        console.error('Error fetching incomes:', err);
      }
    };
    fetchIncomes();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.source) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/income', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setIncomes([...incomes, { ...formData, id: res.data.id, amount: parseFloat(formData.amount) }]);
      setFormData({ amount: '', source: '', date: '', description: '', expected_date: '', status: 'received' });
    } catch (err) {
      console.error('Error adding income', err);
    }
  };

  const markAsReceived = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/income/${id}`, { status: 'received' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIncomes(incomes.map(inc => 
        inc.id === id ? { ...inc, status: 'received', expected_date: null } : inc
      ));
    } catch (err) {
      console.error('Error updating status', err);
    }
  };

  const handleDelete = async (id) => {
    try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/income/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setIncomes(incomes.filter(i => i.id !== id));
    } catch (err) {
        console.error('Error deleting income', err);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="section-title">
        <TrendingUp size={36} color="#81B29A" />
        <h1>Income Studio</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '40px' }}>
        <div className="premium-card shadow-lg" style={{ height: 'fit-content' }}>
          <h3 style={{ marginBottom: '32px', color: '#22223B' }}>New Transaction</h3>
          <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '10px', color: 'var(--text-muted)', fontWeight: '600' }}>Amount (₹)</label>
              <input 
                type="number" 
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                placeholder="0.00"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '10px', color: 'var(--text-muted)', fontWeight: '600' }}>Source</label>
              <input 
                type="text" 
                value={formData.source}
                onChange={(e) => setFormData({...formData, source: e.target.value})}
                placeholder="e.g. Salary, Projects"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '10px', color: 'var(--text-muted)', fontWeight: '600' }}>Date</label>
              <input 
                type="date" 
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '10px', color: 'var(--text-muted)', fontWeight: '600' }}>Description</label>
              <input 
                type="text" 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Optional description"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '10px', color: 'var(--text-muted)', fontWeight: '600' }}>Status</label>
              <select 
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="received">Received</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            {formData.status === 'pending' && (
              <div className="animate-fade-in">
                <label style={{ display: 'block', marginBottom: '10px', color: 'var(--text-muted)', fontWeight: '600' }}>Expected Date</label>
                <input 
                  type="date" 
                  value={formData.expected_date}
                  onChange={(e) => setFormData({...formData, expected_date: e.target.value})}
                />
              </div>
            )}
            <button type="submit" className="btn-primary" style={{ marginTop: '12px', width: '100%', justifyContent: 'center' }}>
              <Plus size={20} />
              Log Income
            </button>
          </form>
        </div>

        <div className="premium-card shadow-sm">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Income Logs</h3>
            <button className="btn-icon" title="Export to Excel" onClick={() => {
                const token = localStorage.getItem('token');
                window.open(`http://127.0.0.1:5000/api/export?token=${token}`);
            }}>
              <Download size={22} />
            </button>
          </div>
          <table className="table-glass">
            <thead>
              <tr>
                <th>Source</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {incomes.map((inc) => (
                <tr key={inc.id}>
                  <td>
                     <div style={{ fontWeight: '700', color: '#4A4E69' }}>{inc.source}</div>
                     <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {inc.description || 'No description'} • {inc.date || 'No date'}
                     </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span className={`badge badge-${inc.status === 'received' ? 'cleared' : 'pending'}`}>
                        {inc.status}
                        </span>
                        {inc.status === 'pending' && inc.expected_date && (
                            <span style={{ fontSize: '0.75rem', color: '#E07A5F', fontWeight: '600' }}>
                                Expected: {inc.expected_date}
                            </span>
                        )}
                    </div>
                  </td>
                  <td style={{ color: inc.status === 'received' ? '#81B29A' : '#9A8C98', fontWeight: '800', fontSize: '1.1rem' }}>
                    + ₹{parseFloat(inc.amount).toLocaleString()}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {inc.status === 'pending' && (
                        <button 
                          className="btn-icon" 
                          onClick={() => markAsReceived(inc.id)}
                          title="Mark as Received"
                          style={{ color: '#81B29A', borderColor: '#81B29A44' }}
                        >
                          <TrendingUp size={16} />
                        </button>
                      )}
                      <button className="btn-icon" onClick={() => handleDelete(inc.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Income;
