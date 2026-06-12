import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, QrCode, Calendar, Package } from 'lucide-react';

const statusColors = {
  PENDING: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  APPROVED: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  REJECTED: 'bg-red-500/20 text-red-400 border border-red-500/30',
  ISSUED: 'bg-violet-500/20 text-violet-400 border border-violet-500/30',
  RETURNED: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
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

  if (!asset) return <div className="text-center text-gray-500 py-16">Loading...</div>;

  const today = new Date().toISOString().split('T')[0];
  const inputClass = "w-full bg-gray-800 border border-gray-700 focus:border-violet-500 text-white placeholder-gray-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all";

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-900 rounded-xl border border-gray-800 p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-medium text-gray-500 bg-gray-800 px-2 py-1 rounded">{asset.category}</span>
              <h1 className="text-2xl font-bold text-white mt-2">{asset.name}</h1>
            </div>
            {asset.qrCode && (
              <button onClick={() => setShowQR(!showQR)} className="flex items-center gap-1 text-xs text-violet-400 border border-violet-500/30 px-3 py-1.5 rounded-lg hover:bg-violet-500/10 transition-colors">
                <QrCode size={14} /> QR Code
              </button>
            )}
          </div>

          {showQR && asset.qrCode && (
            <div className="flex justify-center p-4 bg-gray-800 rounded-xl">
              <img src={asset.qrCode} alt="QR Code" className="w-40 h-40" />
            </div>
          )}

          <p className="text-gray-400">{asset.description || 'No description provided.'}</p>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-800 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-xl font-bold text-white">{asset.totalQuantity}</p>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500">Available</p>
              <p className="text-xl font-bold text-emerald-400">{asset.availableQuantity}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500">Condition</p>
              <p className="text-sm font-semibold text-white">{asset.condition}</p>
            </div>
          </div>

          {user.role === 'ADMIN' && asset.bookings?.length > 0 && (
            <div>
              <h3 className="font-semibold text-white mb-3">Recent Bookings</h3>
              <div className="space-y-2">
                {asset.bookings.slice(0, 5).map(b => (
                  <div key={b.id} className="flex items-center justify-between text-sm bg-gray-800 px-3 py-2 rounded-lg">
                    <span className="text-gray-300">{b.user?.name}</span>
                    <span className="text-gray-500">Qty: {b.quantity}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${statusColors[b.status]}`}>{b.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-violet-400" /> Book Asset
          </h2>

          {success && <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm rounded-lg px-4 py-3 mb-4">{success}</div>}
          {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">{error}</div>}

          {asset.availableQuantity === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <Package size={40} className="mx-auto mb-2 opacity-20" />
              <p className="text-sm">No units available</p>
            </div>
          ) : (
            <form onSubmit={handleBook} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Quantity</label>
                <input type="number" min={1} max={asset.availableQuantity} required
                  value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                  className={inputClass} />
                <p className="text-xs text-gray-500 mt-1">Max: {asset.availableQuantity}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Start Date</label>
                <input type="date" required min={today}
                  value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                  className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">End Date</label>
                <input type="date" required min={form.startDate || today}
                  value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                  className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Purpose</label>
                <textarea rows={3} value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))}
                  placeholder="Describe why you need this asset..."
                  className={`${inputClass} resize-none`} />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-60">
                {loading ? 'Submitting...' : 'Request Booking'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}