import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Library, LayoutDashboard, Bookmark, LogOut, User as UserIcon } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-navy text-white shadow-md border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to={user?.role === 'admin' ? '/admin/dashboard' : '/dashboard'} className="flex items-center space-x-3">
            <div className="bg-amber-accent p-2 rounded-lg text-navy font-bold">
              <Library className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-wide text-white">CAMPUS LIBRARY</span>
              <span className="block text-[10px] text-amber-300 font-mono tracking-widest">MANAGEMENT SYSTEM</span>
            </div>
          </Link>

          {/* Member Nav Links */}
          {user && user.role === 'member' && (
            <div className="hidden md:flex items-center space-x-1">
              <Link
                to="/dashboard"
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-2 transition-colors ${
                  isActive('/dashboard') ? 'bg-amber-accent text-navy font-semibold' : 'text-slate-200 hover:bg-slate-700/50 hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>My Dashboard</span>
              </Link>

              <Link
                to="/catalog"
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-2 transition-colors ${
                  isActive('/catalog') ? 'bg-amber-accent text-navy font-semibold' : 'text-slate-200 hover:bg-slate-700/50 hover:text-white'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Browse Catalog</span>
              </Link>

              <Link
                to="/elibrary"
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-2 transition-colors ${
                  isActive('/elibrary') ? 'bg-amber-accent text-navy font-semibold' : 'text-slate-200 hover:bg-slate-700/50 hover:text-white'
                }`}
              >
                <Bookmark className="w-4 h-4" />
                <span>E-Library</span>
              </Link>
            </div>
          )}

          {/* Right User Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-sm font-medium text-white">{user.name}</span>
                  <span className="text-[11px] text-amber-300 font-mono">{user.membership_id || user.role.toUpperCase()}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-slate-700/60 hover:bg-rose-600 text-white px-3 py-1.5 rounded-lg text-sm flex items-center space-x-1.5 transition-colors border border-slate-600"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-slate-200 hover:text-white px-3 py-1.5 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-amber-accent hover:bg-amber-600 text-navy font-semibold px-4 py-1.5 rounded-md text-sm transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
