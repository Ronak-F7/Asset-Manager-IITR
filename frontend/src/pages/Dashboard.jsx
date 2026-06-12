import { useEffect, useState } from 'react';
import api from '../api/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Package, BookOpen, Clock, AlertTriangle, TrendingUp } from 'lucide-react';

const COLORS = ['#7c3aed', '#2563eb', '#059669', '#d97706', '#dc2626', '#0891b2'];

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-gray-900 rounded-xl p-5 border border-gray-800 flex items-center gap-4">
    <div className={`p-3 rounded-xl ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-sm text-gray-400">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  </div>
);

const tooltipStyle = { backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#f9fafb' };

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/dashboard').then(r => { setData(r.data); setLoading(false); });
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Loading dashboard...</div>;

  const { summary, topAssets, bookingsByStatus, monthlyTrend, recentActivity } = data;
  const statusData = bookingsByStatus.map(b => ({ name: b.status, value: b._count.status }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon={Package} label="Total Assets" value={summary.totalAssets} color="bg-violet-600" />
        <StatCard icon={BookOpen} label="Total Bookings" value={summary.totalBookings} color="bg-emerald-600" />
        <StatCard icon={Clock} label="Pending" value={summary.pendingBookings} color="bg-yellow-600" />
        <StatCard icon={TrendingUp} label="Active" value={summary.activeBookings} color="bg-blue-600" />
        <StatCard icon={AlertTriangle} label="Overdue" value={summary.overdueBookings} color="bg-red-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-900 rounded-xl p-5 border border-gray-800">
          <h2 className="text-base font-semibold text-white mb-4">Booking Trend (6 months)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="count" stroke="#7c3aed" strokeWidth={2} dot={{ r: 4, fill: '#7c3aed' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <h2 className="text-base font-semibold text-white mb-4">Bookings by Status</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value"
                label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <h2 className="text-base font-semibold text-white mb-4">Most Booked Assets</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topAssets} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" tick={{ fontSize: 12, fill: '#9ca3af' }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#9ca3af' }} width={130} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="bookingCount" fill="#7c3aed" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <h2 className="text-base font-semibold text-white mb-4">Recent Activity</h2>
          <div className="space-y-3 overflow-y-auto max-h-56">
            {recentActivity.map(log => (
              <div key={log.id} className="flex items-start gap-3 text-sm">
                <span className="w-2 h-2 rounded-full bg-violet-500 mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-200 font-medium">{log.action.replace(/_/g, ' ')}</p>
                  <p className="text-gray-500 text-xs">{log.details} · {log.user?.name || 'System'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}