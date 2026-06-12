import { useEffect, useState } from 'react';
import api from '../api/client';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

const getColor = (rate) => {
  if (rate >= 80) return '#f03e3e';
  if (rate >= 50) return '#f59f00';
  return '#37b24d';
};

export default function Analytics() {
  const [utilization, setUtilization] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/utilization').then(r => { setUtilization(r.data); setLoading(false); });
  }, []);

  if (loading) return <div className="text-center text-gray-400 py-16">Loading analytics...</div>;

  const sorted = [...utilization].sort((a, b) => b.utilizationRate - a.utilizationRate);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>

      {/* Utilization bar chart */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Asset Utilization Rates (%)</h2>
        <ResponsiveContainer width="100%" height={Math.max(300, sorted.length * 32)}>
          <BarChart data={sorted} layout="vertical" margin={{ left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} tickFormatter={v => `${v}%`} />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={160} />
            <Tooltip formatter={(v) => [`${v}%`, 'Utilization']} />
            <Bar dataKey="utilizationRate" radius={[0, 4, 4, 0]}>
              {sorted.map((entry, i) => (
                <Cell key={i} fill={getColor(Number(entry.utilizationRate))} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-4 text-xs text-gray-500">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500 inline-block" /> Low (&lt;50%)</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-500 inline-block" /> Medium (50–80%)</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500 inline-block" /> High (&gt;80%)</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Asset Inventory Status</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Asset', 'Category', 'Total', 'Available', 'In Use', 'Utilization'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sorted.map(asset => (
                <tr key={asset.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{asset.name}</td>
                  <td className="px-4 py-3 text-gray-500">{asset.category}</td>
                  <td className="px-4 py-3 text-gray-700">{asset.totalQuantity}</td>
                  <td className="px-4 py-3 text-green-600 font-medium">{asset.availableQuantity}</td>
                  <td className="px-4 py-3 text-purple-600 font-medium">{asset.totalQuantity - asset.availableQuantity}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 w-20">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{ width: `${asset.utilizationRate}%`, backgroundColor: getColor(Number(asset.utilizationRate)) }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-700">{asset.utilizationRate}%</span>
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
