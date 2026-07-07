import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import Logo from '../assets/logo.png';
import toast from 'react-hot-toast';

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [adminUser, setAdminUser] = useState({ name: 'Admin', email: 'admin@core.com' });
  const location = useLocation();
  const navigate = useNavigate();

  // Load actual admin data stored during login step
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setAdminUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Error parsing user data", e);
      }
    }
  }, []);

  const menuItems = [
    { name: 'Daily Salary', path: '/admin/salary-update', icon: LayoutDashboard },
    { name: 'Onboard Branch', path: '/admin/onboard-branch', icon: Users },
    { name: 'Onboard User', path: '/admin/onboard-user', icon: Settings },
  ];

  const handleLogout = () => {
    // Clear storage keys cleanly so ProtectedRoute activates on next page access
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Successfully logged out.');
    navigate('/login', { replace: true });
  };

  // Extract initials dynamically for avatar profile (e.g., "Admin Profile" -> "AP")
  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'AD';
  };

  return (
    <div className="flex h-screen bg-slate-50/50 overflow-hidden antialiased text-slate-900">

      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Component */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-100 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 border-r border-slate-800 flex flex-col justify-between
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div>
          {/* Sidebar Header */}
          <div className="flex items-center justify-between h-16 px-6 bg-slate-950 border-b border-slate-800">
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 rounded-lg text-white">
                <img src={Logo} alt="Logo" className="h-9 w-9" />
              </div>
              <span className="font-semibold text-base tracking-wide uppercase text-white">AVG</span>
            </div>
            <button
              className="lg:hidden p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 px-4 space-y-1.5">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/15'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
                    }`}
                >
                  <div className="flex items-center">
                    <Icon size={18} className={`mr-3 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                    <span>{item.name}</span>
                  </div>
                  {isActive && <ChevronRight size={14} className="opacity-75" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Dynamic Sidebar Footer Account Section */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center space-x-3 px-2 py-1.5">
            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-semibold text-indigo-400 text-sm">
              {getInitials(adminUser.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{adminUser.name}</p>
              <p className="text-xs text-slate-500 truncate">{adminUser.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Space */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar Header */}
        <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-slate-200/80 shadow-sm shadow-slate-100/40 z-30">

          {/* Mobile Navigation Menu Toggle */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-1.5 -ml-1 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-50 focus:outline-none lg:hidden transition-colors"
          >
            <Menu size={22} />
          </button>

          <div className="hidden sm:block text-sm text-slate-500 font-medium">
            {/* <span className="text-slate-800 font-semibold capitalize">{location.pathname.split('/').pop()}</span> */}
          </div>

          {/* Action Tools */}
          <div className="flex items-center space-x-4">
            {/* <button className="relative p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50 transition-colors">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-white"></span>
            </button> */}

            {/* <div className="h-4 w-px bg-slate-200" /> */}

            <button
              onClick={handleLogout}
              className="flex items-center space-x-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/80 px-3.5 py-2 rounded-xl transition-all duration-200"
            >
              <LogOut size={14} className="stroke-[2.5]" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Workspace Views */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 lg:p-8 bg-slate-50/60">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;