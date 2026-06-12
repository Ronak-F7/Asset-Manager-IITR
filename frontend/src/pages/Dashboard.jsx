import { useEffect, useState } from 'react';
import api from '../api/client';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { Package, BookOpen, Clock, AlertTriangle, TrendingUp } from 'lucide-react';

const COLORS = ['#3b5bdb', '#37b24d', '#f59f00', '#f03e3e', '#7950f2', '#1098ad'];

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
    <div className={`p-3 rounded-xl ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/dashboard').then(r => { setData(r.data); setLoading(false); });
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Loading dashboard...</div>;

  const { summary, topAssets, bookingsByStatus, monthlyTrend, recentActivity } = data;

  const statusData = bookingsByStatus.map(b => ({ name: b.status, value: b._count.status }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon={Package} label="Total Assets" value={summary.totalAssets} color="bg-brand-500" />
        <StatCard icon={BookOpen} label="Total Bookings" value={summary.totalBookings} color="bg-green-500" />
        <StatCard icon={Clock} label="Pending" value={summary.pendingBookings} color="bg-yellow-500" />
        <StatCard icon={TrendingUp} label="Active" value={summary.activeBookings} color="bg-purple-500" />
        <StatCard icon={AlertTriangle} label="Overdue" value={summary.overdueBookings} color="bg-red-500" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly trend */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Booking Trend (6 months)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#3b5bdb" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Booking status pie */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Bookings by Status</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top assets + recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top assets bar chart */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Most Booked Assets</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topAssets} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={130} />
              <Tooltip />
              <Bar dataKey="bookingCount" fill="#3b5bdb" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent activity */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-3 overflow-y-auto max-h-56">
            {recentActivity.map(log => (
              <div key={log.id} className="flex items-start gap-3 text-sm">
                <span className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-800 font-medium">{log.action.replace(/_/g, ' ')}</p>
                  <p className="text-gray-400 text-xs">{log.details} · {log.user?.name || 'System'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
