import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  PlusCircle,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Trash2,
  LayoutDashboard,
  ChevronRight,
  RefreshCw,
  TrendingUp
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area
} from 'recharts';

const Dashboard = () => {
  const { token, logout } = React.useContext(AuthContext);
  const [analytics, setAnalytics] = useState({
    total_balance: 0,
    total_received_income: 0,
    total_pending_income: 0,
    total_expenses: 0
  });

  const [recentTransactions, setRecentTransactions] = useState([]);
  const [trendData, setTrendData] = useState(null);
  const [barData, setBarData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        const [analyticsRes, incomeRes, expensesRes, trendsRes] = await Promise.all([
          axios.get('/api/analytics', { headers }),
          axios.get('/api/income', { headers }),
          axios.get('/api/expenses', { headers }),
          axios.get('/api/ai-periodic-analysis', { headers })
        ]);

        setAnalytics(analyticsRes.data);
        setTrendData(trendsRes.data);

        // --- Process Recent Transactions ---
        const incomes = incomeRes.data.map(i => ({ ...i, type: 'Income', amount: parseFloat(i.amount) }));
        const expenses = expensesRes.data.map(e => ({ ...e, type: 'Expense', amount: parseFloat(e.amount), status: 'cleared' }));

        const combined = [...incomes, ...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
        setRecentTransactions(combined.slice(0, 5));

        // --- Process Bar Data (Cash Flow) ---
        setBarData(incomeRes.data.map(i => ({ date: i.date, income: i.amount, expense: 0 }))); // Simplified for display
        const last7Days = {};
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          last7Days[dateStr] = { name: d.toLocaleDateString("en-US", { weekday: 'short' }), income: 0, expense: 0, fullDate: dateStr };
        }

        Array.from([...incomes, ...expenses]).forEach(item => {
          if (last7Days[item.date]) {
            if (item.type === 'Income' && item.status === 'received') last7Days[item.date].income += item.amount;
            if (item.type === 'Expense') last7Days[item.date].expense += item.amount;
          }
        });
        setBarData(Object.values(last7Days));

        // --- Process Pie Data (Spending Trends) ---
        const catMap = {};
        expenses.forEach(e => {
          catMap[e.category] = (catMap[e.category] || 0) + e.amount;
        });
        const generatedPieData = Object.keys(catMap).map(key => ({
          name: key,
          value: catMap[key]
        }));
        setPieData(generatedPieData);

      } catch (err) {
        if (err.response?.status === 401) logout();
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const stats = [
    { label: 'Total Balance', value: `₹${analytics.total_balance.toLocaleString()}`, icon: <Activity size={24} />, color: '#81A6C6', trend: '' },
    { label: 'Total Received Income', value: `₹${analytics.total_received_income.toLocaleString()}`, icon: <ArrowUpRight size={24} />, color: '#81B29A', trend: '' },
    { label: 'Total Pending Income', value: `₹${analytics.total_pending_income.toLocaleString()}`, icon: <TrendingUp size={24} />, color: '#D2C4B4', trend: '' },
    { label: 'Total Expenses', value: `₹${analytics.total_expenses.toLocaleString()}`, icon: <ArrowDownRight size={24} />, color: '#E07A5F', trend: '' },
  ];

  const COLORS = ['#81A6C6', '#AACDDC', '#D2C4B4', '#F3E3D0', '#E07A5F', '#9A8C98'];

  return (
    <div className="animate-fade-in">
      <div className="section-title">
        <LayoutDashboard size={36} color="#81A6C6" />
        <h1>Financial Studio  </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '32px', marginBottom: '48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
          {stats.map((stat, idx) => (
            <div key={idx} className="premium-card shadow-sm" style={{ borderLeft: `5px solid ${stat.color}`, padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                <div style={{ background: `${stat.color}15`, padding: '10px', borderRadius: '12px' }}>
                  <div style={{ color: stat.color }}>{stat.icon}</div>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '600', margin: 0 }}>{stat.label}</p>
              </div>
              <h3 style={{ fontSize: '1.6rem', fontWeight: '850', margin: 0 }}>{stat.value}</h3>
            </div>
          ))}
        </div>

        {/* RECENT INTELLIGENCE: The "Since Last Week" Feature */}
        <div className="premium-card shadow-md" style={{ background: 'white', padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <RefreshCw size={24} color="#81A6C6" className="animate-spin-slow" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0 }}>Since Last Week</h3>
              </div>
              <span className={`badge badge-${trendData?.total_change > 0 ? 'pending' : 'cleared'}`} style={{ fontSize: '0.9rem', padding: '6px 12px' }}>
                {trendData?.total_change > 0 ? '↑' : '↓'} {Math.abs(trendData?.total_change) || 0}%
              </span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {trendData?.categories.slice(0, 3).map((cat, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#F8F9FA', borderRadius: '14px' }}>
                  <span style={{ fontWeight: '600', color: '#4A4E69' }}>{cat.category}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                     {cat.change > 0 ? <ArrowUpRight size={18} color="#E07A5F" /> : <ArrowDownRight size={18} color="#81B29A" />}
                     <span style={{ fontWeight: '800', color: cat.change > 0 ? '#E07A5F' : '#81B29A', fontSize: '1.05rem' }}>
                        {Math.abs(cat.change).toFixed(0)}%
                     </span>
                  </div>
                </div>
            ))}
            {!trendData?.categories.length && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', marginTop: '40px' }}>
                Continue tracking expenses to unlock intelligence.
              </p>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px', marginBottom: '48px' }}>
        <div className="premium-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>Cash Flow</h3>
            <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', fontWeight: '600' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#81A6C6' }}></div> Income</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#9D8BB4' }}></div> Expense</div>
            </div>
          </div>
          <div style={{ height: '350px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9A8C98', fontSize: 13 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9A8C98', fontSize: 13 }} dx={-10} />
                <Tooltip
                  cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                  contentStyle={{ background: 'white', border: 'none', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                  itemStyle={{ fontWeight: '600' }}
                />
                <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '20px', paddingTop: '-20px' }} />
                <Bar dataKey="income" name="Income (Blue)" fill="#81A6C6" radius={[8, 8, 0, 0]} />
                <Bar dataKey="expense" name="Expense (Violet)" fill="#9D8BB4" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="premium-card">
          <h3 style={{ marginBottom: '32px', fontSize: '1.25rem', fontWeight: '700' }}>Spending Trends</h3>
          <div style={{ height: '350px', width: '100%' }}>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={80}
                    outerRadius={105}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: 'white', border: 'none', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                  />
                  <Legend verticalAlign="bottom" align="center" iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                No expenses logged yet.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="premium-card">
        <table className="table-glass">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Type</th>
              <th>Status</th>
              <th>Amount</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {recentTransactions.map((tx) => (
              <tr key={tx.id}>
                <td style={{ color: 'var(--text-muted)' }}>{tx.date}</td>
                <td style={{ fontWeight: '600' }}>{tx.description || (tx.type === 'Income' ? 'Income' : 'Expense')}</td>
                <td>
                  <span style={{ fontSize: '0.85rem', fontWeight: '600', color: tx.type === 'Income' ? '#81A6C6' : '#9A8C98', padding: '4px 10px', background: tx.type === 'Income' ? '#81A6C615' : '#D2C4B433', borderRadius: '8px' }}>
                    {tx.category || tx.source}
                  </span>
                </td>
                <td>
                  <span className={`badge badge-${tx.status === 'received' ? 'cleared' : tx.status}`}>
                    {tx.status}
                  </span>
                </td>
                <td style={{ color: tx.type === 'Income' ? '#81B29A' : '#E07A5F', fontWeight: '800', fontSize: '1.05rem' }}>
                  {tx.type === 'Income' ? '+' : '-'} ₹{tx.amount.toLocaleString()}
                </td>
                {/* <td>
                  <button className="btn-icon">
                    <Trash2 size={18} />
                  </button>
                </td> */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
