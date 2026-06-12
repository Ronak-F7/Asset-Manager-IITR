import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Camera, Loader2, ShieldCheck, User } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState(null); // 'admin' or 'user'
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (role === 'admin' && user.role !== 'ADMIN') {
        setError('This account does not have admin access.');
        setLoading(false);
        return;
      }
      navigate(user.role === 'ADMIN' ? '/dashboard' : '/assets');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-violet-600 rounded-2xl mb-4 shadow-lg shadow-violet-500/30">
            <Camera className="text-white" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-white">CULT Asset Manager</h1>
          <p className="text-gray-400 text-sm mt-1">IIT Roorkee Cultural Council</p>
        </div>

        {/* Role selection */}
        {!role ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl">
            <h2 className="text-xl font-bold text-white text-center mb-2">Welcome back</h2>
            <p className="text-gray-400 text-sm text-center mb-8">How would you like to sign in?</p>

            <div className="space-y-4">
              <button
                onClick={() => setRole('admin')}
                className="w-full flex items-center gap-4 bg-gray-800 hover:bg-violet-600/20 border border-gray-700 hover:border-violet-500 text-white p-4 rounded-xl transition-all group"
              >
                <div className="w-12 h-12 bg-violet-600/20 group-hover:bg-violet-600/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="text-violet-400" size={22} />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-white">Admin</p>
                  <p className="text-xs text-gray-400">Manage assets, approve bookings, view analytics</p>
                </div>
              </button>

              <button
                onClick={() => setRole('user')}
                className="w-full flex items-center gap-4 bg-gray-800 hover:bg-blue-600/20 border border-gray-700 hover:border-blue-500 text-white p-4 rounded-xl transition-all group"
              >
                <div className="w-12 h-12 bg-blue-600/20 group-hover:bg-blue-600/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <User className="text-blue-400" size={22} />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-white">User</p>
                  <p className="text-xs text-gray-400">Browse assets, make booking requests</p>
                </div>
              </button>
            </div>

            <p className="text-center text-gray-500 text-xs mt-6">
              New user?{' '}
              <Link to="/register" className="text-violet-400 hover:text-violet-300 font-medium">Create an account</Link>
            </p>
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl">
            {/* Back + role badge */}
            <div className="flex items-center justify-between mb-6">
              <button onClick={() => { setRole(null); setError(''); setForm({ email: '', password: '' }); }} className="text-gray-400 hover:text-white text-sm flex items-center gap-1 transition-colors">
                ← Back
              </button>
              <span className={`text-xs font-medium px-3 py-1 rounded-full ${role === 'admin' ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30' : 'bg-blue-600/20 text-blue-300 border border-blue-500/30'}`}>
                {role === 'admin' ? '🛡 Admin Login' : '👤 User Login'}
              </span>
            </div>

            <h2 className="text-xl font-bold text-white mb-6">Sign in</h2>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                <input
                  type="email" required
                  value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder={role === 'admin' ? 'ronakdas@iitr.ac.in' : 'your@email.com'}
                  className="w-full bg-gray-800 border border-gray-700 focus:border-violet-500 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
                <input
                  type="password" required
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full bg-gray-800 border border-gray-700 focus:border-violet-500 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
                />
              </div>
              <button
                type="submit" disabled={loading}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                Sign in
              </button>
            </form>

            {role === 'user' && (
              <p className="text-sm text-gray-500 text-center mt-6">
                Don't have an account?{' '}
                <Link to="/register" className="text-violet-400 hover:text-violet-300 font-medium">Register here</Link>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
