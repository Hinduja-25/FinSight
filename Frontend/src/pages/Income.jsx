import React, { useState, useEffect } from 'react';
import { TrendingUp, Plus, Trash2, Download, Edit2, X } from 'lucide-react';
import axios from 'axios';

const Income = () => {
  const [incomes, setIncomes] = useState([]);
  const [formData, setFormData] = useState({ amount: '', source: '', date: '', description: '', expected_date: '', status: 'received' });
  const [timeframe, setTimeframe] = useState('all');
  const [maxAmount, setMaxAmount] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [sortOrder, setSortOrder] = useState('date_desc');

  // Fetch from Flask Backend
  const fetchIncomes = async () => {
    try {
      const token = localStorage.getItem('token');
      let url = '/api/income?';
      if (timeframe !== 'all') {
        url += `timeframe=${timeframe}&`;
      }
      if (maxAmount) {
        url += `max_amount=${maxAmount}&`;
      }
      url += `sort_order=${sortOrder}`;
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIncomes(res.data);
    } catch (err) {
      console.error('Error fetching incomes:', err);
    }
  };

  useEffect(() => {
    fetchIncomes();
  }, [timeframe, maxAmount, sortOrder]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.source) return;
    
    try {
      const token = localStorage.getItem('token');
      if (editingId) {
        await axios.put(`/api/income/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIncomes(incomes.map(inc => inc.id === editingId ? { ...inc, ...formData, amount: parseFloat(formData.amount) } : inc));
        setEditingId(null);
      } else {
        const res = await axios.post('/api/income', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIncomes([...incomes, { ...formData, id: res.data.id, amount: parseFloat(formData.amount) }]);
      }
      setFormData({ amount: '', source: '', date: '', description: '', expected_date: '', status: 'received' });
    } catch (err) {
      console.error('Error saving income', err);
    }
  };

  const handleEditClick = (inc) => {
    setFormData({ 
      amount: inc.amount, 
      source: inc.source, 
      date: inc.date || '', 
      description: inc.description || '', 
      expected_date: inc.expected_date || '', 
      status: inc.status 
    });
    setEditingId(inc.id);
  };

  const handleCancelEdit = () => {
    setFormData({ amount: '', source: '', date: '', description: '', expected_date: '', status: 'received' });
    setEditingId(null);
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
          <h3 style={{ marginBottom: '32px', color: '#22223B' }}>{editingId ? 'Edit Transaction' : 'New Transaction'}</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                {editingId ? <Edit2 size={20} /> : <Plus size={20} />}
                {editingId ? 'Update Income' : 'Log Income'}
              </button>
              {editingId && (
                <button type="button" onClick={handleCancelEdit} style={{ background: '#f5f5f5', borderRadius: '12px', padding: '0 16px', display: 'flex', alignItems: 'center' }}>
                  <X size={20} color="#666" />
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="premium-card shadow-sm">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Income Logs</h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <select 
                value={sortOrder} 
                onChange={e => setSortOrder(e.target.value)}
                style={{ padding: '8px', borderRadius: '10px', border: '1px solid #E0E0E0', fontSize: '0.9rem' }}
              >
                <option value="date_desc">Newest to Oldest</option>
                <option value="date_asc">Oldest to Newest</option>
                <option value="amount_desc">Highest to Lowest</option>
                <option value="amount_asc">Lowest to Highest</option>
              </select>
              <select 
                value={timeframe} 
                onChange={e => setTimeframe(e.target.value)}
                style={{ padding: '8px', borderRadius: '10px', border: '1px solid #E0E0E0', fontSize: '0.9rem' }}
              >
                <option value="all">No filter</option>
                <option value="weekly">Last 7 Days</option>
                <option value="monthly">Last 30 Days</option>
                <option value="yearly">Last 365 Days</option>
              </select>
              <input 
                type="number" 
                placeholder="Max Amount"
                value={maxAmount}
                onChange={e => setMaxAmount(e.target.value)}
                style={{ padding: '8px', borderRadius: '10px', border: '1px solid #E0E0E0', width: '120px', fontSize: '0.9rem' }}
              />
              <button className="btn-icon" title="Export to Excel" onClick={() => {
                  const token = localStorage.getItem('token');
                  window.open(`http://127.0.0.1:5000/api/export?token=${token}`);
              }}>
                <Download size={22} />
              </button>
            </div>
          </div>
          <div style={{ overflowY: 'auto', maxHeight: '500px' }}>
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
                      <button className="btn-icon" onClick={() => handleEditClick(inc)}>
                        <Edit2 size={16} />
                      </button>
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
    </div>
  );
};

export default Income;
