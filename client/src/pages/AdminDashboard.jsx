import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await API.get('/analytics/dashboard');
        setAnalytics(res.data);
      } catch (err) {
        setToast({ message: 'Failed to load analytics dashboard data.', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) return <LoadingSpinner fullScreen />;

  const { totals, most_issued_books } = analytics || {};

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy">Librarian Operational Dashboard</h1>
        <p className="text-slate-500 text-sm">Real-time stats and top borrowed catalog items.</p>
      </div>

      {/* Top 5 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Total Books</span>
          <p className="text-2xl font-extrabold text-navy mt-1">{totals?.total_books || 0}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Total Members</span>
          <p className="text-2xl font-extrabold text-navy mt-1">{totals?.total_members || 0}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Issued Out</span>
          <p className="text-2xl font-extrabold text-navy mt-1">{totals?.currently_issued || 0}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Overdue Issues</span>
          <p className="text-2xl font-extrabold text-rose-600 mt-1">{totals?.overdue_count || 0}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Fines Collected</span>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">₹{totals?.total_fines_collected || 0}</p>
        </div>

      </div>

      {/* Top 5 Most-Issued Books */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="mb-4 pb-2 border-b text-navy">
          <h2 className="text-lg font-bold">Top 5 Most-Issued Titles</h2>
        </div>

        {(!most_issued_books || most_issued_books.length === 0) ? (
          <p className="text-slate-400 text-sm text-center py-8">No transaction history yet.</p>
        ) : (
          <div className="space-y-4">
            {most_issued_books.map((b, idx) => (
              <div key={b.book_id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <span className="font-bold font-mono text-sm text-navy bg-amber-accent/30 w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0">
                    {idx + 1}
                  </span>
                  <div className="truncate">
                    <p className="font-bold text-navy text-sm truncate">{b.title}</p>
                    <p className="text-xs text-slate-500 truncate">{b.author}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-navy bg-white px-2.5 py-1 rounded-full border border-slate-300 flex-shrink-0 ml-2">
                  {b.issue_count} issues
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
