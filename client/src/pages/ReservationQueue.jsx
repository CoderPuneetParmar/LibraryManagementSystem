import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { Clock, CheckCircle, RefreshCw, AlertCircle, User, BookOpen } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import formatDate from '../utils/formatDate';

const ReservationQueue = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [runningExpiry, setRunningExpiry] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const res = await API.get('/reservations/queue');
      setReservations(res.data);
    } catch (err) {
      setToast({ message: 'Failed to load reservation queue.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleFulfill = async (id) => {
    try {
      await API.put(`/reservations/${id}/fulfill`);
      setToast({ message: 'Reservation fulfilled! Book formally issued to member.', type: 'success' });
      fetchQueue();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to fulfill reservation.', type: 'error' });
    }
  };

  const handleRunExpiryCheck = async () => {
    setRunningExpiry(true);
    try {
      const res = await API.post('/reservations/check-expiry');
      const { expired_count, promoted_count } = res.data.summary;
      setToast({
        message: `Expiry Check Complete: Expired ${expired_count} hold(s), Promoted ${promoted_count} next in queue!`,
        type: 'success'
      });
      fetchQueue();
    } catch (err) {
      setToast({ message: 'Error running expiry check.', type: 'error' });
    } finally {
      setRunningExpiry(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Reservation Queue Management</h1>
          <p className="text-slate-500 text-sm">Fulfill ready holds when walk-in members arrive or manually trigger auto-expiry checks.</p>
        </div>

        {/* Manual Trigger Button for Demo */}
        <button
          onClick={handleRunExpiryCheck}
          disabled={runningExpiry}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-amber-300 font-bold text-xs rounded-lg transition-colors shadow flex items-center space-x-2 border border-slate-700"
        >
          <RefreshCw className={`w-4 h-4 ${runningExpiry ? 'animate-spin' : ''}`} />
          <span>{runningExpiry ? 'Checking Expiries...' : 'Run Expiry Check (Demo Trigger)'}</span>
        </button>
      </div>

      {/* Queue Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
          <div className="flex items-center space-x-2 text-navy">
            <Clock className="w-5 h-5 text-amber-600" />
            <h2 className="text-base font-bold">Active & Past Reservations ({reservations.length})</h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">Sorted by Book & Queue Position</span>
        </div>

        {reservations.length === 0 ? (
          <p className="text-center text-slate-500 py-12 text-sm">No reservations in system queue.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 uppercase text-[11px] font-bold tracking-wider border-b">
                  <th className="p-3">Queue #</th>
                  <th className="p-3">Member Details</th>
                  <th className="p-3">Book Reserved</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Hold Expiry Date</th>
                  <th className="p-3 text-right">Fulfill Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {reservations.map((r) => {
                  const isReady = r.status === 'ready';
                  const isWaiting = r.status === 'waiting';

                  return (
                    <tr key={r.id} className={`hover:bg-slate-50 ${isReady ? 'bg-emerald-50/60' : ''}`}>
                      <td className="p-3">
                        <span className="font-bold text-navy font-mono bg-slate-200 px-2 py-1 rounded text-xs">
                          #{r.queue_position}
                        </span>
                      </td>
                      <td className="p-3">
                        <p className="font-bold text-navy">{r.user?.name}</p>
                        <p className="text-xs text-slate-500 font-mono">{r.user?.membership_id}</p>
                      </td>
                      <td className="p-3">
                        <p className="font-medium text-slate-800">{r.book?.title}</p>
                        <p className="text-xs text-slate-500 font-mono">ISBN: {r.book?.isbn || '—'}</p>
                      </td>
                      <td className="p-3">
                        {isReady && (
                          <span className="px-2.5 py-1 bg-emerald-600 text-white font-bold text-xs rounded-full shadow-sm animate-pulse">
                            READY FOR PICKUP
                          </span>
                        )}
                        {isWaiting && (
                          <span className="px-2.5 py-1 bg-amber-100 text-amber-900 font-bold text-xs rounded-full border border-amber-300">
                            WAITING IN QUEUE
                          </span>
                        )}
                        {r.status === 'expired' && (
                          <span className="px-2.5 py-1 bg-slate-200 text-slate-600 font-semibold text-xs rounded-full">
                            EXPIRED
                          </span>
                        )}
                        {r.status === 'fulfilled' && (
                          <span className="px-2.5 py-1 bg-blue-100 text-blue-800 font-semibold text-xs rounded-full">
                            FULFILLED
                          </span>
                        )}
                        {r.status === 'cancelled' && (
                          <span className="px-2.5 py-1 bg-slate-200 text-slate-500 line-through text-xs rounded-full">
                            CANCELLED
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        {r.expiry_date ? (
                          <span className={`text-xs font-mono font-semibold ${new Date() > new Date(r.expiry_date) ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>
                            {formatDate(r.expiry_date, true)}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        {isReady ? (
                          <button
                            onClick={() => handleFulfill(r.id)}
                            className="px-3.5 py-1.5 bg-amber-accent hover:bg-amber-600 text-navy font-bold text-xs rounded-lg transition-colors shadow flex items-center space-x-1 ml-auto"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Fulfill Issue</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 text-xs italic">
                            {isWaiting ? 'Waiting copy' : 'Completed'}
                          </span>
                        )}
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

export default ReservationQueue;
