import { useEffect, useState } from 'react';
import api from '../api/client';
import { CheckCircle, XCircle, Package, RotateCcw, Calendar, Search } from 'lucide-react';

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-blue-100 text-blue-700',
  REJECTED: 'bg-red-100 text-red-700',
  ISSUED: 'bg-purple-100 text-purple-700',
  RETURNED: 'bg-green-100 text-green-700',
  OVERDUE: 'bg-red-200 text-red-800',
};

const tabs = ['ALL', 'PENDING', 'APPROVED', 'ISSUED', 'RETURNED', 'REJECTED'];

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('PENDING');
  const [noteModal, setNoteModal] = useState(null); // { id, action }
  const [note, setNote] = useState('');
  const [search, setSearch] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    const params = tab !== 'ALL' ? { status: tab } : {};
    const { data } = await api.get('/bookings', { params });
    setBookings(data);
    setLoading(false);
  };

  useEffect(() => { fetchBookings(); }, [tab]);

  const doAction = async (id, action, adminNote = '') => {
    await api.patch(`/bookings/${id}/${action}`, { adminNote });
    setNoteModal(null); setNote('');
    fetchBookings();
  };

  const filtered = bookings.filter(b =>
    !search ||
    b.asset?.name.toLowerCase().includes(search.toLowerCase()) ||
    b.user?.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Manage Bookings</h1>

      <div className="flex flex-col sm:flex-row gap-3">
        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto">
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by asset or user..."
            className="pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-16">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-gray-400 py-16">No bookings found</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(booking => (
            <div key={booking.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900">{booking.asset?.name}</h3>
                    <span className="text-xs bg-gray-50 text-gray-500 px-2 py-0.5 rounded">{booking.asset?.category}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${statusColors[booking.status]}`}>{booking.status}</span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span>By: <strong className="text-gray-900">{booking.user?.name}</strong> ({booking.user?.email})</span>
                    <span>Qty: <strong className="text-gray-900">{booking.quantity}</strong></span>
                    <span className="flex items-center gap-1">
                      <Calendar size={13} />
                      {new Date(booking.startDate).toLocaleDateString()} – {new Date(booking.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  {booking.purpose && <p className="text-sm text-gray-400">Purpose: {booking.purpose}</p>}
                  {booking.adminNote && <p className="text-sm text-blue-600">Note: {booking.adminNote}</p>}
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 flex-wrap">
                  {booking.status === 'PENDING' && (
                    <>
                      <button onClick={() => setNoteModal({ id: booking.id, action: 'approve' })}
                        className="flex items-center gap-1 text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg transition-colors">
                        <CheckCircle size={13} /> Approve
                      </button>
                      <button onClick={() => setNoteModal({ id: booking.id, action: 'reject' })}
                        className="flex items-center gap-1 text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg transition-colors">
                        <XCircle size={13} /> Reject
                      </button>
                    </>
                  )}
                  {booking.status === 'APPROVED' && (
                    <button onClick={() => doAction(booking.id, 'issue')}
                      className="flex items-center gap-1 text-xs bg-purple-500 hover:bg-purple-600 text-white px-3 py-1.5 rounded-lg transition-colors">
                      <Package size={13} /> Issue
                    </button>
                  )}
                  {booking.status === 'ISSUED' && (
                    <button onClick={() => doAction(booking.id, 'return')}
                      className="flex items-center gap-1 text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg transition-colors">
                      <RotateCcw size={13} /> Return
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Note modal */}
      {noteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize">
              {noteModal.action} Booking
            </h3>
            <textarea
              value={note} onChange={e => setNote(e.target.value)}
              placeholder="Add a note (optional)..."
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => doAction(noteModal.id, noteModal.action, note)}
                className={`flex-1 text-white font-medium py-2 rounded-lg transition-colors ${noteModal.action === 'approve' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}>
                Confirm
              </button>
              <button onClick={() => { setNoteModal(null); setNote(''); }}
                className="flex-1 border border-gray-300 text-gray-700 font-medium py-2 rounded-lg hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
