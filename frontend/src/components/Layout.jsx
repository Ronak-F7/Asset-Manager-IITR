import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Package, BookOpen, Users, BarChart3,
  ClipboardList, LogOut, Menu, X, Camera
} from 'lucide-react';
import { useState } from 'react';

const NavItem = ({ to, icon: Icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        isActive ? 'bg-brand-500 text-white' : 'text-gray-600 hover:bg-gray-100'
      }`
    }
  >
    <Icon size={18} />
    {label}
  </NavLink>
);

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const isAdmin = user?.role === 'ADMIN';

  const handleLogout = () => { logout(); navigate('/login'); };

  const nav = (
    <nav className="flex flex-col gap-1 flex-1">
      {isAdmin && <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />}
      <NavItem to="/assets" icon={Package} label="Assets" />
      <NavItem to="/bookings" icon={BookOpen} label="My Bookings" />
      {isAdmin && (
        <>
          <NavItem to="/admin/bookings" icon={ClipboardList} label="All Bookings" />
          <NavItem to="/analytics" icon={BarChart3} label="Analytics" />
          <NavItem to="/audit" icon={ClipboardList} label="Audit Logs" />
        </>
      )}
    </nav>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-8 px-2">
          <Camera className="text-brand-500" size={24} />
          <div>
            <p className="font-bold text-gray-900 text-sm leading-tight">CULT Asset Manager</p>
            <p className="text-xs text-gray-400">IIT Roorkee</p>
          </div>
        </div>
        {nav}
        <div className="border-t border-gray-100 pt-4 mt-4">
          <div className="px-2 mb-3">
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-400">{user?.role}</p>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 w-full transition-colors">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile sidebar */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="relative flex flex-col w-64 h-full bg-white p-4 z-50">
            <div className="flex items-center justify-between mb-8 px-2">
              <p className="font-bold text-gray-900">CULT Asset Manager</p>
              <button onClick={() => setOpen(false)}><X size={20} /></button>
            </div>
            {nav}
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="md:hidden flex items-center gap-3 p-4 bg-white border-b border-gray-200">
          <button onClick={() => setOpen(true)}><Menu size={22} /></button>
          <p className="font-bold text-gray-900">CULT Asset Manager</p>
        </header>
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
