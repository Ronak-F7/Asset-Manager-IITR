import { useEffect, useState } from 'react';
import api from '../api/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const getColor = (rate) => {
  if (rate >= 80) return '#dc2626';
  if (rate >= 50) return '#d97706';
  return '#059669';
};

const tooltipStyle = { backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#f9fafb' };

export default function Analytics() {
  const [utilization, setUtilization] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/utilization').then(r => { setUtilization(r.data); setLoading(false); });
  }, []);

  if (loading) return <div className="text-center text-gray-500 py-16">Loading analytics...</div>;

  const sorted = [...utilization].sort((a, b) => b.utilizationRate - a.utilizationRate);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Analytics</h1>

      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h2 className="text-base font-semibold text-white mb-4">Asset Utilization Rates (%)</h2>
        <ResponsiveContainer width="100%" height={Math.max(300, sorted.length * 32)}>
          <BarChart data={sorted} layout="vertical" margin={{ left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12, fill: '#9ca3af' }} tickFormatter={v => `${v}%`} />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#9ca3af' }} width={160} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, 'Utilization']} />
            <Bar dataKey="utilizationRate" radius={[0, 4, 4, 0]}>
              {sorted.map((entry, i) => <Cell key={i} fill={getColor(Number(entry.utilizationRate))} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-4 text-xs text-gray-500">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-600 inline-block" /> Low (&lt;50%)</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-600 inline-block" /> Medium (50–80%)</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-600 inline-block" /> High (&gt;80%)</span>
        </div>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800">
          <h2 className="text-base font-semibold text-white">Asset Inventory Status</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-800">
              <tr>
                {['Asset', 'Category', 'Total', 'Available', 'In Use', 'Utilization'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {sorted.map(asset => (
                <tr key={asset.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-white">{asset.name}</td>
                  <td className="px-4 py-3 text-gray-400">{asset.category}</td>
                  <td className="px-4 py-3 text-gray-300">{asset.totalQuantity}</td>
                  <td className="px-4 py-3 text-emerald-400 font-medium">{asset.availableQuantity}</td>
                  <td className="px-4 py-3 text-violet-400 font-medium">{asset.totalQuantity - asset.availableQuantity}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-700 rounded-full h-2 w-20">
                        <div className="h-2 rounded-full" style={{ width: `${asset.utilizationRate}%`, backgroundColor: getColor(Number(asset.utilizationRate)) }} />
                      </div>
                      <span className="text-xs font-medium text-gray-300">{asset.utilizationRate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}