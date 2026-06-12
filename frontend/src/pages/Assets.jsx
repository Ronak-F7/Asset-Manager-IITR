import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Package, Filter } from 'lucide-react';
import AssetModal from '../components/AssetModal';

const statusColors = {
  AVAILABLE: 'bg-green-100 text-green-700',
  PARTIALLY_AVAILABLE: 'bg-yellow-100 text-yellow-700',
  UNAVAILABLE: 'bg-red-100 text-red-700',
  MAINTENANCE: 'bg-gray-100 text-gray-700',
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
    setAssets(data);
    setLoading(false);
  };

  useEffect(() => {
    api.get('/assets/categories').then(r => setCategories(r.data));
  }, []);

  useEffect(() => {
    const t = setTimeout(fetchAssets, 300);
    return () => clearTimeout(t);
  }, [search, category]);

  const handleSaved = () => { setShowModal(false); setEditAsset(null); fetchAssets(); };

  const handleDelete = async (id) => {
    if (!confirm('Delete this asset?')) return;
    await api.delete(`/assets/${id}`);
    fetchAssets();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Assets</h1>
        {user.role === 'ADMIN' && (
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus size={16} /> Add Asset
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search assets..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <select
          value={category} onChange={e => setCategory(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
        >
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center text-gray-400 py-16">Loading assets...</div>
      ) : assets.length === 0 ? (
        <div className="text-center text-gray-400 py-16">
          <Package size={48} className="mx-auto mb-3 opacity-30" />
          <p>No assets found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {assets.map(asset => (
            <div key={asset.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded">{asset.category}</span>
                  <span className={`text-xs font-medium px-2 py-1 rounded ${statusColors[asset.status] || 'bg-gray-100'}`}>{asset.status?.replace(/_/g, ' ')}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{asset.name}</h3>
                <p className="text-xs text-gray-400 mb-3 line-clamp-2">{asset.description || 'No description'}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Available: <span className="font-semibold text-gray-900">{asset.availableQuantity}</span>/{asset.totalQuantity}</span>
                </div>
              </div>
              <div className="px-5 pb-4 flex gap-2">
                <Link to={`/assets/${asset.id}`} className="flex-1 text-center text-xs font-medium text-brand-500 border border-brand-500 hover:bg-brand-50 py-1.5 rounded-lg transition-colors">
                  View
                </Link>
                {user.role === 'ADMIN' && (
                  <>
                    <button onClick={() => { setEditAsset(asset); setShowModal(true); }} className="flex-1 text-xs font-medium text-gray-600 border border-gray-300 hover:bg-gray-50 py-1.5 rounded-lg transition-colors">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(asset.id)} className="text-xs font-medium text-red-500 border border-red-200 hover:bg-red-50 px-2 py-1.5 rounded-lg transition-colors">
                      Del
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <AssetModal asset={editAsset} onClose={() => { setShowModal(false); setEditAsset(null); }} onSaved={handleSaved} />
      )}
    </div>
  );
}
