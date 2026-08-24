import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { DollarSign, CheckCircle, Search, User, BookOpen } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import formatDate from '../utils/formatDate';

const ManageFines = () => {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const fetchFines = async () => {
    try {
      setLoading(true);
      const res = await API.get('/fines/overdue');
      setFines(res.data);
    } catch (err) {
      setToast({ message: 'Failed to load unpaid fines.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFines();
  }, []);

  const handleMarkPaid = async (transactionId) => {
    try {
      await API.put(`/fines/${transactionId}/pay`);
      setToast({ message: 'Fine payment recorded successfully!', type: 'success' });
      fetchFines();
    } catch (err) {
      setToast({ message: 'Failed to record fine payment.', type: 'error' });
    }
  };

  const filteredFines = fines.filter(f => {
    const term = search.toLowerCase();
    return (
      f.user?.name.toLowerCase().includes(term) ||
      f.user?.membership_id.toLowerCase().includes(term) ||
      f.book?.title.toLowerCase().includes(term)
    );
  });

  const totalUnpaidAmount = filteredFines.reduce((sum, item) => sum + item.current_fine, 0);

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Overdue Fines & Payment Desk</h1>
          <p className="text-slate-500 text-sm">Track all pending library late fees (₹5/day late, capped at ₹200) and record counter cash payments.</p>
        </div>

        <div className="bg-amber-100 text-amber-900 border border-amber-300 px-4 py-2 rounded-xl text-sm font-bold flex items-center space-x-2">
          <DollarSign className="w-5 h-5 text-amber-700" />
          <span>Pending Fines Total: ₹{totalUnpaidAmount.toFixed(2)}</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by member name, ID, or book title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-navy focus:border-navy"
          />
        </div>
      </div>

      {/* Fines Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {filteredFines.length === 0 ? (
          <p className="text-center text-slate-500 py-12 text-sm">No unpaid fines currently pending matching your search.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 uppercase text-[11px] font-bold tracking-wider border-b">
                  <th className="p-3">Member Info</th>
                  <th className="p-3">Book Title</th>
                  <th className="p-3">Issue / Due Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Current Fine</th>
                  <th className="p-3 text-right">Counter Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredFines.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50">
                    <td className="p-3">
                      <p className="font-bold text-navy">{f.user?.name}</p>
                      <p className="text-xs text-slate-500 font-mono">{f.user?.membership_id}</p>
                    </td>
                    <td className="p-3">
                      <p className="font-medium text-slate-800">{f.book?.title}</p>
                      <p className="text-xs text-slate-500">{f.book?.author}</p>
                    </td>
                    <td className="p-3 text-xs text-slate-600">
                      <div>Issued: {formatDate(f.issue_date)}</div>
                      <div className="font-semibold text-rose-600">Due: {formatDate(f.due_date)}</div>
                    </td>
                    <td className="p-3">
                      {f.status === 'issued' ? (
                        <span className="px-2.5 py-1 bg-rose-100 text-rose-800 font-bold text-xs rounded-full">
                          Still Borrowed (Overdue)
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-amber-100 text-amber-800 font-bold text-xs rounded-full">
                          Returned (Fine Unpaid)
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="text-base font-extrabold text-rose-700 bg-rose-50 px-2.5 py-1 rounded border border-rose-200">
                        ₹{f.current_fine}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleMarkPaid(f.id)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors shadow flex items-center space-x-1 ml-auto"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Mark Paid</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default ManageFines;
