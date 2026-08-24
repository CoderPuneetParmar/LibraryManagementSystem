import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { ArrowRightLeft, CheckCircle, AlertTriangle, Search, Calendar, User, BookOpen, Clock } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import formatDate from '../utils/formatDate';

const IssueReturn = () => {
  const [members, setMembers] = useState([]);
  const [books, setBooks] = useState([]);
  const [issuedTransactions, setIssuedTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [selectedBookId, setSelectedBookId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Table Filter
  const [tableSearch, setTableSearch] = useState('');
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const loadData = async () => {
    try {
      setLoading(true);
      const [membersRes, booksRes, txRes] = await Promise.all([
        API.get('/auth/members'),
        API.get('/books'),
        API.get('/transactions?status=issued')
      ]);

      setMembers(membersRes.data);
      setBooks(booksRes.data);
      setIssuedTransactions(txRes.data);

      // Default due date: +14 days from today
      const d = new Date();
      d.setDate(d.getDate() + 14);
      setDueDate(d.toISOString().split('T')[0]);
    } catch (err) {
      setToast({ message: 'Failed to load issue/return desk data.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleIssueBook = async (e) => {
    e.preventDefault();
    if (!selectedMemberId || !selectedBookId) {
      setToast({ message: 'Please select both a member and a book.', type: 'error' });
      return;
    }

    setSubmitting(true);
    try {
      await API.post('/transactions/issue', {
        userId: selectedMemberId,
        bookId: selectedBookId,
        dueDate
      });
      setToast({ message: 'Book issued successfully to member!', type: 'success' });
      setSelectedMemberId('');
      setSelectedBookId('');
      loadData();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to issue book.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReturnBook = async (transactionId) => {
    try {
      const res = await API.put(`/transactions/${transactionId}/return`);
      const fine = res.data.transaction?.fine_amount;
      const promoted = res.data.reservation_promoted;

      let msg = `Book returned successfully! Final fine: ₹${fine}`;
      if (promoted) {
        msg += ` | Next reservation in queue promoted to READY hold!`;
      }

      setToast({ message: msg, type: 'success' });
      loadData();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to return book.', type: 'error' });
    }
  };

  const filteredTransactions = issuedTransactions.filter(tx => {
    const term = tableSearch.toLowerCase();
    return (
      tx.user?.name.toLowerCase().includes(term) ||
      tx.user?.membership_id.toLowerCase().includes(term) ||
      tx.book?.title.toLowerCase().includes(term)
    );
  });

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy">Offline Issue & Return Counter</h1>
        <p className="text-slate-500 text-sm">Issue physical books to walk-in members and process returns with instant fine lock.</p>
      </div>

      {/* Issue Book Form Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
        <div className="flex items-center space-x-2 mb-4 pb-3 border-b text-navy">
          <ArrowRightLeft className="w-5 h-5 text-amber-600" />
          <h2 className="text-lg font-bold">Issue Book to Walk-in Member</h2>
        </div>

        <form onSubmit={handleIssueBook} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          
          {/* Select Member */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Walk-in Member</label>
            <div className="relative">
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                required
                className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:ring-navy focus:border-navy"
              >
                <option value="">-- Choose Member --</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.membership_id})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Select Book */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Book Title</label>
            <select
              value={selectedBookId}
              onChange={(e) => setSelectedBookId(e.target.value)}
              required
              className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:ring-navy focus:border-navy"
            >
              <option value="">-- Choose Book --</option>
              {books.map(b => (
                <option key={b.id} value={b.id} disabled={b.available_copies <= 0}>
                  {b.title} ({b.available_copies > 0 ? `${b.available_copies} available` : 'OUT OF STOCK'})
                </option>
              ))}
            </select>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
              className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-navy focus:border-navy"
            />
          </div>

          {/* Submit Action */}
          <div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-navy hover:bg-navy-dark text-white font-semibold text-sm rounded-lg transition-colors shadow-sm flex items-center justify-center space-x-2"
            >
              <CheckCircle className="w-4 h-4 text-amber-400" />
              <span>{submitting ? 'Processing...' : 'Confirm Issue'}</span>
            </button>
          </div>

        </form>
      </div>

      {/* Currently Issued Books Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 pb-3 border-b gap-3">
          <div className="flex items-center space-x-2 text-navy">
            <BookOpen className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-bold">Currently Issued Books Counter ({issuedTransactions.length})</h2>
          </div>

          {/* Search Filter */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by member or book..."
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-navy focus:border-navy"
            />
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <p className="text-center text-slate-500 py-8 text-sm">No currently active issues matching search filter.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 uppercase text-[11px] font-bold tracking-wider border-b">
                  <th className="p-3">Member Info</th>
                  <th className="p-3">Book Title</th>
                  <th className="p-3">Issue Date</th>
                  <th className="p-3">Due Date</th>
                  <th className="p-3">Live Fine Preview</th>
                  <th className="p-3 text-right">Return Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className={`hover:bg-slate-50 ${tx.is_overdue ? 'bg-rose-50/50' : ''}`}>
                    <td className="p-3">
                      <p className="font-bold text-navy">{tx.user?.name}</p>
                      <p className="text-xs text-slate-500 font-mono">{tx.user?.membership_id}</p>
                    </td>
                    <td className="p-3">
                      <p className="font-medium text-slate-800">{tx.book?.title}</p>
                      <p className="text-xs text-slate-500">{tx.book?.author}</p>
                    </td>
                    <td className="p-3 text-slate-600">{formatDate(tx.issue_date)}</td>
                    <td className={`p-3 font-semibold ${tx.is_overdue ? 'text-rose-700 font-bold' : 'text-slate-700'}`}>
                      {formatDate(tx.due_date)}
                    </td>
                    <td className="p-3">
                      {tx.is_overdue ? (
                        <span className="font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded text-xs">
                          Overdue (₹{tx.live_fine})
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">₹0 (On Time)</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleReturnBook(tx.id)}
                        className="px-3 py-1.5 bg-amber-accent hover:bg-amber-600 text-navy font-bold text-xs rounded-lg transition-colors shadow-sm"
                      >
                        Return Book
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

export default IssueReturn;
