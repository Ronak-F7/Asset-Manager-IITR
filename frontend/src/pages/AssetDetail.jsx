import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, QrCode, Calendar, Package } from 'lucide-react';

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-blue-100 text-blue-700',
  REJECTED: 'bg-red-100 text-red-700',
  ISSUED: 'bg-purple-100 text-purple-700',
  RETURNED: 'bg-green-100 text-green-700',
  OVERDUE: 'bg-red-200 text-red-800',
};

export default function AssetDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [asset, setAsset] = useState(null);
  const [form, setForm] = useState({ quantity: 1, startDate: '', endDate: '', purpose: '' });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    api.get(`/assets/${id}`).then(r => setAsset(r.data));
  }, [id]);

  const handleBook = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await api.post('/bookings', { assetId: id, ...form });
      setSuccess('Booking request submitted successfully!');
      setForm({ quantity: 1, startDate: '', endDate: '', purpose: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  if (!asset) return <div className="text-center text-gray-400 py-16">Loading...</div>;

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Asset info */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded">{asset.category}</span>
              <h1 className="text-2xl font-bold text-gray-900 mt-2">{asset.name}</h1>
            </div>
            {asset.qrCode && (
              <button onClick={() => setShowQR(!showQR)} className="flex items-center gap-1 text-xs text-brand-500 border border-brand-200 px-3 py-1.5 rounded-lg hover:bg-brand-50">
                <QrCode size={14} /> QR Code
              </button>
            )}
          </div>

          {showQR && asset.qrCode && (
            <div className="flex justify-center p-4 bg-gray-50 rounded-xl">
              <img src={asset.qrCode} alt="QR Code" className="w-40 h-40" />
            </div>
          )}

          <p className="text-gray-600">{asset.description || 'No description provided.'}</p>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-400">Total</p>
              <p className="text-xl font-bold text-gray-900">{asset.totalQuantity}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-400">Available</p>
              <p className="text-xl font-bold text-green-700">{asset.availableQuantity}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-400">Condition</p>
              <p className="text-sm font-semibold text-gray-900">{asset.condition}</p>
            </div>
          </div>

          {/* Recent bookings (admin view) */}
          {user.role === 'ADMIN' && asset.bookings?.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Recent Bookings</h3>
              <div className="space-y-2">
                {asset.bookings.slice(0, 5).map(b => (
                  <div key={b.id} className="flex items-center justify-between text-sm bg-gray-50 px-3 py-2 rounded-lg">
                    <span className="text-gray-700">{b.user?.name}</span>
                    <span className="text-gray-400">Qty: {b.quantity}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${statusColors[b.status]}`}>{b.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Booking form */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-brand-500" /> Book Asset
          </h2>

          {success && <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 mb-4">{success}</div>}
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">{error}</div>}

          {asset.availableQuantity === 0 ? (
            <div className="text-center py-6 text-gray-400">
              <Package size={40} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No units available</p>
            </div>
          ) : (
            <form onSubmit={handleBook} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number" min={1} max={asset.availableQuantity} required
                  value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <p className="text-xs text-gray-400 mt-1">Max: {asset.availableQuantity}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date" required min={today}
                  value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date" required min={form.startDate || today}
                  value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                <textarea
                  rows={3}
                  value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))}
                  placeholder="Describe why you need this asset..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                />
              </div>
              <button
                type="submit" disabled={loading}
                className="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-60"
              >
                {loading ? 'Submitting...' : 'Request Booking'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
