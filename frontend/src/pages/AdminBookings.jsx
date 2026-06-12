import { useEffect, useState } from 'react';
import api from '../api/client';
import { CheckCircle, XCircle, Package, RotateCcw, Calendar, Search } from 'lucide-react';

const statusColors = {
  PENDING: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  APPROVED: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  REJECTED: 'bg-red-500/20 text-red-400 border border-red-500/30',
  ISSUED: 'bg-violet-500/20 text-violet-400 border border-violet-500/30',
  RETURNED: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
};

const tabs = ['ALL', 'PENDING', 'APPROVED', 'ISSUED', 'RETURNED', 'REJECTED'];

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('PENDING');
  const [noteModal, setNoteModal] = useState(null);
  const [note, setNote] = useState('');
  const [search, setSearch] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    const params = tab !== 'ALL' ? { status: tab } : {};
    const { data } = await api.get('/bookings', { params });
    setBookings(data); setLoading(false);
  };

  useEffect(() => { fetchBookings(); }, [tab]);

  const doAction = async (id, action, adminNote = '') => {
    await api.patch(`/bookings/${id}/${action}`, { adminNote });
    setNoteModal(null); setNote(''); fetchBookings();
  };

  const filtered = bookings.filter(b =>
    !search || b.asset?.name.toLowerCase().includes(search.toLowerCase()) || b.user?.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Manage Bookings</h1>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1 bg-gray-900 border border-gray-800 p-1 rounded-xl overflow-x-auto">
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${tab === t ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white'}`}>
              {t}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
            className="pl-8 pr-3 py-1.5 bg-gray-900 border border-gray-700 text-white placeholder-gray-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all" />
        </div>
      </div>

      {loading ? <div className="text-center text-gray-500 py-16">Loading...</div>
        : filtered.length === 0 ? <div className="text-center text-gray-500 py-16">No bookings found</div>
        : (
          <div className="space-y-3">
            {filtered.map(booking => (
              <div key={booking.id} className="bg-gray-900 rounded-xl border border-gray-800 p-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-white">{booking.asset?.name}</h3>
                      <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded">{booking.asset?.category}</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${statusColors[booking.status]}`}>{booking.status}</span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                      <span>By: <strong className="text-white">{booking.user?.name}</strong> ({booking.user?.email})</span>
                      <span>Qty: <strong className="text-white">{booking.quantity}</strong></span>
                      <span className="flex items-center gap-1"><Calendar size={13} />{new Date(booking.startDate).toLocaleDateString()} – {new Date(booking.endDate).toLocaleDateString()}</span>
                    </div>
                    {booking.purpose && <p className="text-sm text-gray-500">Purpose: {booking.purpose}</p>}
                    {booking.adminNote && <p className="text-sm text-blue-400">Note: {booking.adminNote}</p>}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {booking.status === 'PENDING' && (
                      <>
                        <button onClick={() => setNoteModal({ id: booking.id, action: 'approve' })}
                          className="flex items-center gap-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg transition-colors">
                          <CheckCircle size={13} /> Approve
                        </button>
                        <button onClick={() => setNoteModal({ id: booking.id, action: 'reject' })}
                          className="flex items-center gap-1 text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg transition-colors">
                          <XCircle size={13} /> Reject
                        </button>
                      </>
                    )}
                    {booking.status === 'APPROVED' && (
                      <button onClick={() => doAction(booking.id, 'issue')}
                        className="flex items-center gap-1 text-xs bg-violet-600 hover:bg-violet-700 text-white px-3 py-1.5 rounded-lg transition-colors">
                        <Package size={13} /> Issue
                      </button>
                    )}
                    {booking.status === 'ISSUED' && (
                      <button onClick={() => doAction(booking.id, 'return')}
                        className="flex items-center gap-1 text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors">
                        <RotateCcw size={13} /> Return
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      {noteModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-4 capitalize">{noteModal.action} Booking</h3>
            <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Add a note (optional)..." rows={3}
              className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 resize-none mb-4" />
            <div className="flex gap-3">
              <button onClick={() => doAction(noteModal.id, noteModal.action, note)}
                className={`flex-1 text-white font-medium py-2 rounded-lg transition-colors ${noteModal.action === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}>
                Confirm
              </button>
              <button onClick={() => { setNoteModal(null); setNote(''); }}
                className="flex-1 border border-gray-700 text-gray-300 font-medium py-2 rounded-lg hover:bg-gray-800 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
