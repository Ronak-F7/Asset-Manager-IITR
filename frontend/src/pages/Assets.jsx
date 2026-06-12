import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Package } from 'lucide-react';
import AssetModal from '../components/AssetModal';

const statusColors = {
  AVAILABLE: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  PARTIALLY_AVAILABLE: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  UNAVAILABLE: 'bg-red-500/20 text-red-400 border border-red-500/30',
  MAINTENANCE: 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
};

export default function Assets() {
  const { user } = useAuth();
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editAsset, setEditAsset] = useState(null);

  const fetchAssets = async () => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (category) params.category = category;
    const { data } = await api.get('/assets', { params });
    setAssets(data); setLoading(false);
  };

  useEffect(() => { api.get('/assets/categories').then(r => setCategories(r.data)); }, []);
  useEffect(() => { const t = setTimeout(fetchAssets, 300); return () => clearTimeout(t); }, [search, category]);

  const handleSaved = () => { setShowModal(false); setEditAsset(null); fetchAssets(); };
  const handleDelete = async (id) => {
    if (!confirm('Delete this asset?')) return;
    await api.delete(`/assets/${id}`); fetchAssets();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Assets</h1>
        {user.role === 'ADMIN' && (
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-violet-500/20">
            <Plus size={16} /> Add Asset
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search assets..."
            className="w-full pl-9 pr-4 py-2.5 bg-gray-900 border border-gray-700 focus:border-violet-500 text-white placeholder-gray-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all" />
        </div>
        <select value={category} onChange={e => setCategory(e.target.value)}
          className="bg-gray-900 border border-gray-700 text-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all">
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="text-center text-gray-500 py-16">Loading assets...</div>
      ) : assets.length === 0 ? (
        <div className="text-center text-gray-500 py-16">
          <Package size={48} className="mx-auto mb-3 opacity-20" />
          <p>No assets found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {assets.map(asset => (
            <div key={asset.id} className="bg-gray-900 rounded-xl border border-gray-800 hover:border-gray-700 overflow-hidden hover:shadow-xl transition-all">
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs font-medium text-gray-500 bg-gray-800 px-2 py-1 rounded">{asset.category}</span>
                  <span className={`text-xs font-medium px-2 py-1 rounded ${statusColors[asset.status]}`}>{asset.status?.replace(/_/g, ' ')}</span>
                </div>
                <h3 className="font-semibold text-white mb-1 line-clamp-1">{asset.name}</h3>
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">{asset.description || 'No description'}</p>
                <div className="text-sm text-gray-400">
                  Available: <span className="font-semibold text-white">{asset.availableQuantity}</span>/{asset.totalQuantity}
                </div>
              </div>
              <div className="px-5 pb-4 flex gap-2">
                <Link to={`/assets/${asset.id}`} className="flex-1 text-center text-xs font-medium text-violet-400 border border-violet-500/30 hover:bg-violet-500/10 py-1.5 rounded-lg transition-colors">
                  View
                </Link>
                {user.role === 'ADMIN' && (
                  <>
                    <button onClick={() => { setEditAsset(asset); setShowModal(true); }} className="flex-1 text-xs font-medium text-gray-400 border border-gray-700 hover:bg-gray-800 py-1.5 rounded-lg transition-colors">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(asset.id)} className="text-xs font-medium text-red-400 border border-red-500/30 hover:bg-red-500/10 px-2 py-1.5 rounded-lg transition-colors">
                      Del
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {showModal && <AssetModal asset={editAsset} onClose={() => { setShowModal(false); setEditAsset(null); }} onSaved={handleSaved} />}
    </div>
  );
}
