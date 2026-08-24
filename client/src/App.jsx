import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import MemberDashboard from './pages/MemberDashboard';
import Catalog from './pages/Catalog';
import BookDetail from './pages/BookDetail';
import ELibrary from './pages/ELibrary';
import AdminDashboard from './pages/AdminDashboard';
import IssueReturn from './pages/IssueReturn';
import ManageBooks from './pages/ManageBooks';
import ReservationQueue from './pages/ReservationQueue';
import ManageFines from './pages/ManageFines';
import ManageMembers from './pages/ManageMembers';

// Member Layout (Top Navbar)
const MemberLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-slate-500 text-xs font-medium">
        © 2026 Campus Library Management System — College Project
      </footer>
    </div>
  );
};

// Admin Layout (Left Sidebar)
const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

const DefaultRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Member Protected Routes */}
          <Route
            element={
              <ProtectedRoute>
                <MemberLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<MemberDashboard />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/books/:id" element={<BookDetail />} />
            <Route path="/elibrary" element={<ELibrary />} />
          </Route>

          {/* Admin Protected Routes */}
          <Route
            element={
              <ProtectedRoute roleRequired="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/issue-return" element={<IssueReturn />} />
            <Route path="/admin/books" element={<ManageBooks />} />
            <Route path="/admin/reservations" element={<ReservationQueue />} />
            <Route path="/admin/fines" element={<ManageFines />} />
            <Route path="/admin/members" element={<ManageMembers />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<DefaultRedirect />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
