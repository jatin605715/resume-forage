import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileText, LogOut, LayoutDashboard, Layers } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null; // Navbar is hidden for non-logged in users (like on Login/Signup screens)

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="no-print bg-[#121212] border-b border-gray-800 sticky top-0 z-50 px-4 sm:px-6 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-white text-black p-1.5 rounded-md font-black flex items-center justify-center transition-transform group-hover:scale-105">
            <FileText size={18} />
          </div>
          <span className="font-extrabold text-lg tracking-wider text-white">
            Resume<span className="text-gray-400 font-semibold">Forge</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
              isActive('/') 
                ? 'text-white border-b-2 border-white pb-1 mt-0.5' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <LayoutDashboard size={16} />
            Dashboard
          </Link>
          <Link
            to="/templates"
            className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
              isActive('/templates') 
                ? 'text-white border-b-2 border-white pb-1 mt-0.5' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Layers size={16} />
            Templates
          </Link>
        </div>

        {/* User profile & logout */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-xs text-gray-500 font-medium">Logged in as</div>
            <div className="text-sm font-semibold text-gray-300">{user.email}</div>
          </div>
          
          {/* Mobile Dashboard & Templates icons */}
          <div className="flex md:hidden items-center gap-3">
            <Link 
              to="/" 
              title="Dashboard"
              className={`p-1.5 rounded-md transition-colors ${isActive('/') ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
            >
              <LayoutDashboard size={18} />
            </Link>
            <Link 
              to="/templates" 
              title="Templates"
              className={`p-1.5 rounded-md transition-colors ${isActive('/templates') ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
            >
              <Layers size={18} />
            </Link>
          </div>

          <div className="h-6 w-px bg-gray-800 hidden sm:block"></div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-transparent hover:bg-gray-800 text-gray-400 hover:text-white transition-all text-sm font-medium border border-gray-800 hover:border-gray-700"
            title="Log Out"
          >
            <LogOut size={15} />
            <span className="hidden sm:inline">Log out</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
