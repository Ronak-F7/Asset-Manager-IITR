import { useEffect, useState } from 'react';
import api from '../api/client';
import { ClipboardList } from 'lucide-react';

const actionColors = {
  ASSET_CREATED: 'bg-green-100 text-green-700',
  ASSET_UPDATED: 'bg-blue-100 text-blue-700',
  ASSET_DELETED: 'bg-red-100 text-red-700',
  BOOKING_REQUESTED: 'bg-yellow-100 text-yellow-700',
  BOOKING_APPROVED: 'bg-green-100 text-green-700',
  BOOKING_REJECTED: 'bg-red-100 text-red-700',
  ASSET_ISSUED: 'bg-purple-100 text-purple-700',
  ASSET_RETURNED: 'bg-gray-100 text-gray-700',
};

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/audit').then(r => { setLogs(r.data); setLoading(false); });
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>

      {loading ? (
        <div className="text-center text-gray-400 py-16">Loading...</div>
      ) : logs.length === 0 ? (
        <div className="text-center text-gray-400 py-16">
          <ClipboardList size={48} className="mx-auto mb-3 opacity-30" />
          <p>No audit logs yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['Action', 'Details', 'User', 'Asset', 'Time'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${actionColors[log.action] || 'bg-gray-100 text-gray-700'}`}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{log.details || '—'}</td>
                    <td className="px-4 py-3 text-gray-700">{log.user?.name || '—'}</td>
                    <td className="px-4 py-3 text-gray-700">{log.asset?.name || '—'}</td>
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
