import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Assets from './pages/Assets';
import AssetDetail from './pages/AssetDetail';
import Bookings from './pages/Bookings';
import AdminBookings from './pages/AdminBookings';
import Analytics from './pages/Analytics';
import AuditLogs from './pages/AuditLogs';

function ProtectedRoute({ children, adminOnly }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'ADMIN') return <Navigate to="/assets" />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard" element={<ProtectedRoute adminOnly><Dashboard /></ProtectedRoute>} />
            <Route path="assets" element={<Assets />} />
            <Route path="assets/:id" element={<AssetDetail />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="admin/bookings" element={<ProtectedRoute adminOnly><AdminBookings /></ProtectedRoute>} />
            <Route path="analytics" element={<ProtectedRoute adminOnly><Analytics /></ProtectedRoute>} />
            <Route path="audit" element={<ProtectedRoute adminOnly><AuditLogs /></ProtectedRoute>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
