import { useEffect, useState } from 'react';
import api from '../api/client';
import { BookOpen, Calendar } from 'lucide-react';

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-blue-100 text-blue-700',
  REJECTED: 'bg-red-100 text-red-700',
  ISSUED: 'bg-purple-100 text-purple-700',
  RETURNED: 'bg-green-100 text-green-700',
  OVERDUE: 'bg-red-200 text-red-800',
};

const tabs = ['ALL', 'PENDING', 'APPROVED', 'ISSUED', 'RETURNED', 'REJECTED'];

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('ALL');

  useEffect(() => {
    setLoading(true);
    const params = tab !== 'ALL' ? { status: tab } : {};
    api.get('/bookings', { params }).then(r => { setBookings(r.data); setLoading(false); });
  }, [tab]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit overflow-x-auto">
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

      {loading ? (
        <div className="text-center text-gray-400 py-16">Loading...</div>
      ) : bookings.length === 0 ? (
        <div className="text-center text-gray-400 py-16">
          <BookOpen size={48} className="mx-auto mb-3 opacity-30" />
          <p>No bookings found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map(booking => (
            <div key={booking.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{booking.asset?.name}</h3>
                    <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded">{booking.asset?.category}</span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span>Qty: <strong className="text-gray-900">{booking.quantity}</strong></span>
                    <span className="flex items-center gap-1">
                      <Calendar size={13} />
                      {new Date(booking.startDate).toLocaleDateString()} – {new Date(booking.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  {booking.purpose && <p className="text-sm text-gray-400 mt-1 line-clamp-1">Purpose: {booking.purpose}</p>}
                  {booking.adminNote && (
                    <p className="text-sm text-blue-600 mt-1">Admin note: {booking.adminNote}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusColors[booking.status]}`}>{booking.status}</span>
                  <span className="text-xs text-gray-400">{new Date(booking.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
