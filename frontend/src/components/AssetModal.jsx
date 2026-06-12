import { useState, useEffect } from 'react';
import api from '../api/client';
import { X, Loader2 } from 'lucide-react';

const CATEGORIES = ['DSLR Cameras', 'Studio Lighting', 'Audio Systems', 'Costumes', 'Stage Props', 'Recording Equipment', 'Event Infrastructure', 'Other'];
const CONDITIONS = ['Excellent', 'Good', 'Fair', 'Poor'];
const STATUSES = ['AVAILABLE', 'PARTIALLY_AVAILABLE', 'UNAVAILABLE', 'MAINTENANCE'];

export default function AssetModal({ asset, onClose, onSaved }) {
  const [form, setForm] = useState({ name: '', category: CATEGORIES[0], description: '', totalQuantity: 1, condition: 'Good', status: 'AVAILABLE' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (asset) setForm({ name: asset.name, category: asset.category, description: asset.description || '', totalQuantity: asset.totalQuantity, condition: asset.condition || 'Good', status: asset.status });
  }, [asset]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      if (asset) await api.put(`/assets/${asset.id}`, form);
      else await api.post('/assets', form);
      onSaved();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save asset');
    } finally { setLoading(false); }
  };

  const inputClass = "w-full bg-gray-800 border border-gray-700 focus:border-violet-500 text-white placeholder-gray-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all";

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">{asset ? 'Edit Asset' : 'Add New Asset'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><X size={20} /></button>
        </div>
        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Asset Name *</label>
            <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Canon EOS 5D" className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Category *</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className={inputClass}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Quantity *</label>
              <input type="number" min={1} required value={form.totalQuantity} onChange={e => setForm(f => ({ ...f, totalQuantity: e.target.value }))} className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Condition</label>
              <select value={form.condition} onChange={e => setForm(f => ({ ...f, condition: e.target.value }))} className={inputClass}>
                {CONDITIONS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            {asset && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className={inputClass}>
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
            <textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description..." className={`${inputClass} resize-none`} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="flex-1 bg-violet-600 hover:bg-violet-700 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
              {loading && <Loader2 size={16} className="animate-spin" />}
              {asset ? 'Save Changes' : 'Create Asset'}
            </button>
            <button type="button" onClick={onClose} className="flex-1 border border-gray-700 text-gray-300 font-medium py-2.5 rounded-lg hover:bg-gray-800 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
