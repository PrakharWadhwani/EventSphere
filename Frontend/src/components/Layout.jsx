import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, LogOut, Compass, Search, Users, LayoutDashboard } from 'lucide-react';
import { PushPrompt } from './PushPrompt';

const navItems = (isAdmin) => [
  { to: '/home', label: 'Feed', icon: Compass },
  { to: '/search', label: 'Search', icon: Search },
  { to: '/societies', label: 'Societies', icon: Users },
  ...(isAdmin ? [{ to: '/admin', label: 'Admin', icon: LayoutDashboard }] : []),
];

const linkClass = ({ isActive }) =>
  `flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
    isActive
      ? 'bg-slate-800 text-indigo-400 border border-slate-700'
      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
  }`;

export const Layout = ({ children }) => {
  const { name, email, isAdmin, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80 px-4 lg:px-8 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Logo & Platform Title */}
          <Link to={isAuthenticated ? '/home' : '/login'} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all duration-300">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-indigo-400 group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent tracking-tight">
                EventSphere
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                KIIT Edition
              </span>
            </div>
          </Link>

          {/* User Controls & Actions */}
          {isAuthenticated && (
            <div className="flex items-center gap-3 md:gap-4">
              <nav className="hidden md:flex items-center gap-2">
                {navItems(isAdmin).map(({ to, label, icon: Icon }) => (
                  <NavLink key={to} to={to} className={linkClass}>
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </NavLink>
                ))}
              </nav>

              {/* User Profile Badge */}
              <div className="hidden lg:flex items-center gap-2.5 pl-2 border-l border-slate-800">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-inner">
                  {name ? name.charAt(0).toUpperCase() : 'K'}
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold text-slate-200 truncate max-w-[140px]">
                    {name || 'KIIT Student'}
                    {isAdmin && <span className="ml-1.5 text-[9px] text-amber-400 uppercase">Rep</span>}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate max-w-[140px]">{email}</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Log out"
                aria-label="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </header>

      {isAuthenticated && <PushPrompt />}

      {/* Main Page Container */}
      <main className={`flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 ${isAuthenticated ? 'pb-24 md:pb-6' : ''}`}>
        {children}
      </main>

      {/* Mobile bottom navigation */}
      {isAuthenticated && (
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800 flex justify-around py-2">
          {navItems(isAdmin).map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-medium ${
                  isActive ? 'text-indigo-400' : 'text-slate-500'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {label}
            </NavLink>
          ))}
        </nav>
      )}

      {/* Footer */}
      <footer className="hidden md:block border-t border-slate-800/60 bg-slate-950 py-6 px-4 text-center text-xs text-slate-500">
        <p>© 2026 KIIT EventSphere • Campus Event Discovery Platform</p>
      </footer>
    </div>
  );
};
