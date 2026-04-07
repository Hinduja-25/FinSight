import React, { useState, useEffect } from 'react';
import { TrendingDown, Plus, Trash2, Download } from 'lucide-react';
import axios from 'axios';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [formData, setFormData] = useState({ amount: '', category: 'Food', date: '', description: '' });

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/expenses', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setExpenses(res.data);
      } catch (err) {
        console.error('Error fetching expenses:', err);
      }
    };
    fetchExpenses();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.category) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/expenses', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExpenses([...expenses, { ...formData, id: res.data.id, amount: parseFloat(formData.amount) }]);
      setFormData({ amount: '', category: 'Food', date: '', description: '' });
    } catch (err) {
      console.error('Error adding expense:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/expenses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExpenses(expenses.filter(e => e.id !== id));
    } catch (err) {
      console.error('Error deleting expense:', err);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="section-title">
        <TrendingDown size={36} color="#E07A5F" />
        <h1>Expense Studio</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '40px' }}>
        <div className="premium-card shadow-lg" style={{ height: 'fit-content' }}>
          <h3 style={{ marginBottom: '32px', color: '#22223B', fontWeight: '800' }}>Log Purchase</h3>
          <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '10px', color: 'var(--text-muted)', fontWeight: '600' }}>Amount (₹)</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '10px', color: 'var(--text-muted)', fontWeight: '600' }}>Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Food">Food</option>
                <option value="Bills">Bills</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Shopping">Shopping</option>
                <option value="Travel">Travel</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '10px', color: 'var(--text-muted)', fontWeight: '600' }}>Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '10px', color: 'var(--text-muted)', fontWeight: '600' }}>Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Where was this spent?"
              />
            </div>
            <button type="submit" className="btn-primary" style={{ marginTop: '12px', width: '100%', justifyContent: 'center' }}>
              <Plus size={20} />
              Add Expense
            </button>
          </form>
        </div>

        <div className="premium-card shadow-sm">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Expense History</h3>
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
                <th>Category</th>
                <th>Description</th>
                <th>Date</th>
                <th>Amount</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((exp) => (
                <tr key={exp.id}>
                  <td>
                    <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#81A6C6', padding: '6px 12px', background: '#81A6C615', borderRadius: '10px' }}>
                      {exp.category}
                    </span>
                  </td>
                  <td style={{ fontWeight: '700', color: '#4A4E69' }}>{exp.description}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{exp.date}</td>
                  <td style={{ color: '#E07A5F', fontWeight: '800', fontSize: '1.1rem' }}>
                    - ₹{parseFloat(exp.amount).toLocaleString()}
                  </td>
                  <td>
                    <button className="btn-icon" onClick={() => handleDelete(exp.id)}>
                      <Trash2 size={18} />
                    </button>
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

export default Expenses;
