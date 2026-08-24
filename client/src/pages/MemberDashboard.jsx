import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Clock, AlertTriangle, CheckCircle, XCircle, DollarSign, Calendar } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import formatDate from '../utils/formatDate';

const MemberDashboard = () => {
  const { user } = useAuth();
  const [issuedBooks, setIssuedBooks] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [txRes, resvRes] = await Promise.all([
        API.get('/transactions/my'),
        API.get('/reservations/my')
      ]);
      setIssuedBooks(txRes.data);
      setReservations(resvRes.data);
    } catch (err) {
      setToast({ message: 'Failed to load member dashboard data.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCancelReservation = async (id) => {
    try {
      await API.put(`/reservations/${id}/cancel`);
      setToast({ message: 'Reservation cancelled successfully.', type: 'success' });
      fetchData();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to cancel reservation.', type: 'error' });
    }
  };

  const handlePayFine = async (transactionId) => {
    try {
      await API.put(`/fines/${transactionId}/pay`);
      setToast({ message: 'Fine payment recorded successfully!', type: 'success' });
      fetchData();
    } catch (err) {
      setToast({ message: 'Payment error. Please try again.', type: 'error' });
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  const activeIssued = issuedBooks.filter(t => t.status === 'issued');
  const pastReturned = issuedBooks.filter(t => t.status === 'returned');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center bg-gradient-to-r from-slate-900 to-navy text-white">
        <div>
          <span className="text-amber-400 font-mono text-xs uppercase tracking-widest font-semibold">MEMBER DASHBOARD</span>
          <h1 className="text-2xl font-bold mt-1">Welcome back, {user?.name}!</h1>
          <p className="text-slate-300 text-sm mt-0.5">Membership ID: <span className="font-mono text-amber-300">{user?.membership_id}</span></p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-6 text-sm">
          <div className="text-center bg-slate-800/80 px-4 py-2 rounded-lg border border-slate-700">
            <span className="block text-2xl font-bold text-amber-400">{activeIssued.length}</span>
            <span className="text-xs text-slate-300">Books Borrowed</span>
          </div>
          <div className="text-center bg-slate-800/80 px-4 py-2 rounded-lg border border-slate-700">
            <span className="block text-2xl font-bold text-amber-400">{reservations.filter(r => ['waiting', 'ready'].includes(r.status)).length}</span>
            <span className="text-xs text-slate-300">Active Holds</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Section 1: My Currently Borrowed / Issued Books */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4 border-b pb-3">
            <div className="flex items-center space-x-2 text-navy">
              <BookOpen className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg font-bold">My Borrowed Books</h2>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full">{activeIssued.length} Active</span>
          </div>

          {activeIssued.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              You have no books currently borrowed from the physical library.
            </div>
          ) : (
            <div className="space-y-4">
              {activeIssued.map((tx) => (
                <div key={tx.id} className={`p-4 rounded-lg border transition-all ${
                  tx.is_overdue ? 'bg-rose-50/70 border-rose-200' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-navy text-base">{tx.book?.title}</h3>
                      <p className="text-xs text-slate-600">Author: {tx.book?.author}</p>
                    </div>
                    {tx.is_overdue ? (
                      <span className="flex items-center space-x-1 px-2.5 py-1 bg-rose-600 text-white font-bold text-xs rounded-full shadow-sm">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Overdue (₹{tx.live_fine})</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-semibold text-xs rounded-full">
                        Issued
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-600 border-t pt-2 border-slate-200">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Issued: {formatDate(tx.issue_date)}</span>
                    </div>
                    <div className={`flex items-center space-x-1 font-semibold ${tx.is_overdue ? 'text-rose-700 font-bold' : 'text-slate-700'}`}>
                      <Clock className="w-3.5 h-3.5" />
                      <span>Due Date: {formatDate(tx.due_date)}</span>
                    </div>
                  </div>

                  {/* Overdue Live Fine Notice & Pay Action */}
                  {tx.is_overdue && (
                    <div className="mt-3 bg-white p-3 rounded-lg border border-rose-200 flex items-center justify-between">
                      <div className="text-xs">
                        <span className="text-rose-800 font-semibold">Late fine accumulating: ₹5/day</span>
                        <p className="text-[11px] text-slate-500">Live preview fine: <strong className="text-rose-600">₹{tx.live_fine}</strong></p>
                      </div>
                      <button
                        onClick={() => handlePayFine(tx.id)}
                        className="px-3 py-1.5 bg-amber-accent hover:bg-amber-600 text-navy font-bold text-xs rounded-lg transition-colors flex items-center space-x-1"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>Pay Fine Now</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: My Reservations */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4 border-b pb-3">
            <div className="flex items-center space-x-2 text-navy">
              <Clock className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg font-bold">My Reservations & Holds</h2>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full">{reservations.length} Total</span>
          </div>

          {reservations.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              You have no active or past book reservations.
            </div>
          ) : (
            <div className="space-y-4">
              {reservations.map((resv) => {
                const isReady = resv.status === 'ready';
                const isWaiting = resv.status === 'waiting';
                const isExpired = resv.status === 'expired';
                const isCancelled = resv.status === 'cancelled';
                const isFulfilled = resv.status === 'fulfilled';

                return (
                  <div key={resv.id} className="p-4 rounded-lg border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-navy text-base">{resv.book?.title}</h3>
                        <p className="text-xs text-slate-600">Reserved on: {formatDate(resv.reservation_date)}</p>
                      </div>

                      {/* Status Badges */}
                      {isReady && (
                        <span className="px-2.5 py-1 bg-emerald-600 text-white font-bold text-xs rounded-full shadow-sm animate-pulse">
                          Ready for Pickup!
                        </span>
                      )}
                      {isWaiting && (
                        <span className="px-2.5 py-1 bg-amber-100 text-amber-900 font-bold text-xs rounded-full border border-amber-300">
                          Waiting in Queue (#{resv.queue_position})
                        </span>
                      )}
                      {isExpired && (
                        <span className="px-2.5 py-1 bg-slate-200 text-slate-600 font-semibold text-xs rounded-full">
                          Expired
                        </span>
                      )}
                      {isCancelled && (
                        <span className="px-2.5 py-1 bg-slate-200 text-slate-500 line-through text-xs rounded-full">
                          Cancelled
                        </span>
                      )}
                      {isFulfilled && (
                        <span className="px-2.5 py-1 bg-blue-100 text-blue-800 font-semibold text-xs rounded-full">
                          Fulfilled (Issued)
                        </span>
                      )}
                    </div>

                    {/* Ready Hold Notice with Expiry Window */}
                    {isReady && resv.expiry_date && (
                      <div className="bg-emerald-50 border border-emerald-300 p-3 rounded-lg text-xs text-emerald-900">
                        <p className="font-bold flex items-center">
                          <CheckCircle className="w-4 h-4 text-emerald-600 mr-1.5" />
                          A copy is currently held for you at the library desk!
                        </p>
                        <p className="mt-1 font-mono text-emerald-800">
                          Hold Expiry: <strong>{formatDate(resv.expiry_date, true)}</strong>
                        </p>
                        <span className="text-[11px] text-slate-500 block mt-0.5">Show your Membership ID at the counter to collect your book within 3 days.</span>
                      </div>
                    )}

                    {/* Cancel Button */}
                    {(isWaiting || isReady) && (
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => handleCancelReservation(resv.id)}
                          className="text-xs text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-2.5 py-1 rounded border border-rose-200 font-medium transition-colors flex items-center space-x-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Cancel Hold</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default MemberDashboard;
