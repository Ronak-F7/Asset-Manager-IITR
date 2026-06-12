import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Camera, Loader2 } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'ADMIN' ? '/dashboard' : '/assets');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-brand-500 p-2 rounded-xl">
            <Camera className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">CULT Asset Manager</h1>
            <p className="text-sm text-gray-400">IIT Roorkee Cultural Council</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">Sign in</h2>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email" required
              value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="you@iitroorkee.ac.in"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password" required
              value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Sign in
          </button>
        </form>

        <p className="text-sm text-gray-500 text-center mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-500 font-medium hover:underline">Register</Link>
        </p>

        <div className="mt-6 p-3 bg-gray-50 rounded-lg text-xs text-gray-500">
          <p className="font-medium mb-1">Demo credentials:</p>
          <p>Admin: admin@cult.iitroorkee.ac.in / admin123</p>
          <p>User: user@iitroorkee.ac.in / user123</p>
        </div>
      </div>
    </div>
  );
}
