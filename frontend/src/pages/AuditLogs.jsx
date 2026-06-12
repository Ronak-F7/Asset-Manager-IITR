import { useEffect, useState } from 'react';
import api from '../api/client';
import { ClipboardList } from 'lucide-react';

const actionColors = {
  ASSET_CREATED: 'bg-emerald-500/20 text-emerald-400',
  ASSET_UPDATED: 'bg-blue-500/20 text-blue-400',
  ASSET_DELETED: 'bg-red-500/20 text-red-400',
  BOOKING_REQUESTED: 'bg-yellow-500/20 text-yellow-400',
  BOOKING_APPROVED: 'bg-emerald-500/20 text-emerald-400',
  BOOKING_REJECTED: 'bg-red-500/20 text-red-400',
  ASSET_ISSUED: 'bg-violet-500/20 text-violet-400',
  ASSET_RETURNED: 'bg-gray-500/20 text-gray-400',
};

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/audit').then(r => { setLogs(r.data); setLoading(false); });
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Audit Logs</h1>
      {loading ? (
        <div className="text-center text-gray-500 py-16">Loading...</div>
      ) : logs.length === 0 ? (
        <div className="text-center text-gray-500 py-16">
          <ClipboardList size={48} className="mx-auto mb-3 opacity-20" />
          <p>No audit logs yet</p>
        </div>
      ) : (
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-800">
                <tr>
                  {['Action', 'Details', 'User', 'Asset', 'Time'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${actionColors[log.action] || 'bg-gray-500/20 text-gray-400'}`}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 max-w-xs truncate">{log.details || '—'}</td>
                    <td className="px-4 py-3 text-gray-300">{log.user?.name || '—'}</td>
                    <td className="px-4 py-3 text-gray-300">{log.asset?.name || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
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