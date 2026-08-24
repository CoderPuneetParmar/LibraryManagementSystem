import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { Users, Search, Mail, Phone, Calendar, BookOpen } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import formatDate from '../utils/formatDate';

const ManageMembers = () => {
  const [members, setMembers] = useState([]);
  const [issuedTransactions, setIssuedTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState({ message: '', type: 'success' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [memRes, txRes] = await Promise.all([
          API.get('/auth/members'),
          API.get('/transactions?status=issued')
        ]);
        setMembers(memRes.data);
        setIssuedTransactions(txRes.data);
      } catch (err) {
        setToast({ message: 'Failed to load members directory.', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getMemberIssuedCount = (userId) => {
    return issuedTransactions.filter(t => t.user_id === userId).length;
  };

  const filteredMembers = members.filter(m => {
    const term = search.toLowerCase();
    return (
      m.name.toLowerCase().includes(term) ||
      m.email.toLowerCase().includes(term) ||
      (m.membership_id && m.membership_id.toLowerCase().includes(term))
    );
  });

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy">Registered Members Directory</h1>
        <p className="text-slate-500 text-sm">View student & faculty membership profiles and active borrowed books count.</p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search member by name, email, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-navy focus:border-navy"
          />
        </div>
      </div>

      {/* Members Directory Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {filteredMembers.length === 0 ? (
          <p className="text-center text-slate-500 py-12 text-sm">No members registered in directory matching search.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 uppercase text-[11px] font-bold tracking-wider border-b">
                  <th className="p-3">Member Name</th>
                  <th className="p-3">Membership ID</th>
                  <th className="p-3">Email Address</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Join Date</th>
                  <th className="p-3 text-right">Active Borrowed Books</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredMembers.map((m) => {
                  const activeCount = getMemberIssuedCount(m.id);

                  return (
                    <tr key={m.id} className="hover:bg-slate-50">
                      <td className="p-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-full bg-navy text-amber-300 font-bold text-xs flex items-center justify-center flex-shrink-0">
                            {m.name.charAt(0)}
                          </div>
                          <span className="font-bold text-navy">{m.name}</span>
                        </div>
                      </td>
                      <td className="p-3 font-mono text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 w-fit">
                        {m.membership_id || 'MEM-REG'}
                      </td>
                      <td className="p-3 text-slate-600 font-mono text-xs">{m.email}</td>
                      <td className="p-3 text-slate-600 text-xs">{m.phone || '—'}</td>
                      <td className="p-3 text-slate-500 text-xs">{formatDate(m.join_date)}</td>
                      <td className="p-3 text-right">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          activeCount > 0 ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {activeCount} Books Borrowed
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default ManageMembers;
