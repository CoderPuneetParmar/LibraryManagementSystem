import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, ArrowRightLeft, BookPlus, Clock, DollarSign, Users, LogOut, ShieldCheck } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard & Analytics', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Issue / Return Books', path: '/admin/issue-return', icon: ArrowRightLeft },
    { label: 'Manage Books Catalog', path: '/admin/books', icon: BookPlus },
    { label: 'Reservation Queue', path: '/admin/reservations', icon: Clock },
    { label: 'Fines & Payments', path: '/admin/fines', icon: DollarSign },
    { label: 'Members Directory', path: '/admin/members', icon: Users },
  ];

  return (
    <aside className="w-64 bg-navy-dark text-slate-200 min-h-screen flex flex-col border-r border-slate-800 shadow-xl">
      {/* Header */}
      <div className="p-5 border-b border-slate-800 flex items-center space-x-3">
        <div className="bg-amber-accent p-2 rounded-lg text-navy font-bold">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h2 className="font-bold text-white tracking-wide text-sm">LIBRARIAN PORTAL</h2>
          <span className="text-[11px] text-amber-400 font-mono">ADMIN CONTROL</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-3.5 py-3 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-amber-accent text-navy font-semibold shadow-md'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-navy' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Admin Profile Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-center justify-between">
          <div className="overflow-hidden mr-2">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-slate-400 font-mono truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
