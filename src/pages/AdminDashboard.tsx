import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, BarChart3, Users, MessageSquare, Gamepad2, 
  Calendar, Image, Radio, ShoppingBag, CreditCard, Info, Settings,
  ChevronRight, ChevronLeft, Bell, Search, LogOut, User, Menu
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Admin Dashboard with Retro Styling
const AdminDashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  // Get current active tab from location path
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/admin' || path === '/admin/') return 'overview';
    const parts = path.split('/');
    return parts[parts.length - 1] || 'overview';
  };

  const activeTab = getActiveTab();

  // Hide canvas and add admin-route class
  useEffect(() => {
    document.body.classList.add('admin-route');
    document.documentElement.classList.add('admin-route');
    
    const allCanvases = document.querySelectorAll('canvas');
    allCanvases.forEach(c => (c as HTMLElement).style.display = 'none');
    
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';
    
    return () => {
      document.body.classList.remove('admin-route');
      document.documentElement.classList.remove('admin-route');
      allCanvases.forEach(c => (c as HTMLElement).style.display = '');
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [location.pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.user-dropdown')) {
        setShowUserDropdown(false);
      }
    };
    if (showUserDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserDropdown]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Navigation items organized by category
  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard, category: 'main' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, category: 'main' },
    { id: 'users', label: 'Users', icon: Users, category: 'main' },
    { id: 'forum', label: 'Forum', icon: MessageSquare, category: 'main' },
    { id: 'games', label: 'Games', icon: Gamepad2, category: 'main' },
    { id: 'souq', label: 'Marketplace', icon: ShoppingBag, category: 'main' },
    { id: 'events', label: 'Events', icon: Calendar, category: 'content' },
    { id: 'media', label: 'Videos', icon: Image, category: 'content' },
    { id: 'gallery', label: 'Media Gallery', icon: Image, category: 'content' },
    { id: 'radio', label: 'Radio', icon: Radio, category: 'content' },
    { id: 'transactions', label: 'Transactions', icon: CreditCard, category: 'system' },
    { id: 'about', label: 'About Page', icon: Info, category: 'system' },
    { id: 'social-links', label: 'Social Links', icon: Settings, category: 'system' },
    { id: 'settings', label: 'Settings', icon: Settings, category: 'system' },
  ];

  const categories = [
    { id: 'main', label: 'Main', color: 'text-emerald-600' },
    { id: 'content', label: 'Content', color: 'text-blue-600' },
    { id: 'system', label: 'System', color: 'text-purple-600' },
  ];

  const displayUser = user || {
    email: 'admin@kebele.com',
    role: 'admin' as const,
    username: 'Admin',
    id: 'admin-demo'
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Mobile Header - Fixed at top */}
      <header className="lg:hidden flex-none h-16 bg-white border-b-4 border-black z-50 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 bg-white border-2 border-black rounded-lg hover:bg-gray-100"
          >
            <Menu className="w-6 h-6 text-black" />
          </button>
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center border-2 border-black">
            <img src="/logo.png" alt="Kebele" className="w-7 h-7 object-cover" />
          </div>
          <span className="font-bold text-gray-800 uppercase" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Admin</span>
        </div>
        <div className="relative user-dropdown">
          <button 
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center text-white font-bold border-2 border-black"
          >
            {displayUser.username?.charAt(0).toUpperCase() || 'A'}
          </button>
          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-50">
              <div className="px-4 py-3 border-b-4 border-black bg-gradient-to-r from-emerald-500 to-teal-500">
                <p className="font-bold text-white uppercase" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{displayUser.username}</p>
                <p className="text-sm text-emerald-100">{displayUser.email}</p>
              </div>
              <div className="p-2 space-y-1">
                <button onClick={() => { navigate('/'); setShowUserDropdown(false); }} className="w-full text-left px-3 py-2 bg-white border-2 border-black rounded-lg hover:bg-gray-100 flex items-center space-x-2">
                  <span className="font-bold" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Back to Site</span>
                </button>
                <button onClick={handleLogout} className="w-full text-left px-3 py-2 bg-white border-2 border-black rounded-lg hover:bg-red-100 flex items-center space-x-2">
                  <LogOut className="w-4 h-4 text-red-600" />
                  <span className="font-bold text-red-600" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
          <div className="w-80 bg-white h-full border-r-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]" onClick={(e) => e.stopPropagation()}>
            {/* Retro Title Bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b-4 border-black bg-gradient-to-r from-emerald-600 to-teal-600 shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border-2 border-black shadow-lg">
                  <img src="/logo.png" alt="Kebele" className="w-7 h-7 object-cover" />
                </div>
                <div>
                  <p className="font-bold text-white uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Admin</p>
                  <p className="text-xs text-emerald-100">Dashboard</p>
                </div>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 bg-white border-2 border-black rounded-lg hover:bg-red-500 hover:text-white transition-all">
                <ChevronLeft className="w-4 h-4 text-black" />
              </button>
            </div>
            <nav className="p-4 space-y-4 overflow-y-auto flex-1">
              {categories.map(cat => (
                <div key={cat.id}>
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-2">{cat.label}</h3>
                  <div className="space-y-1">
                    {navItems.filter(item => item.category === cat.id).map(item => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => { navigate(`/admin/${item.id}`); setMobileMenuOpen(false); }}
                          className={`w-full flex items-center space-x-3 px-4 py-3 border-2 border-black rounded-lg transition-all ${
                            activeTab === item.id 
                              ? 'bg-emerald-100' 
                              : 'bg-white hover:bg-gray-100'
                          }`}
                          style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}
                        >
                          <Icon className={`w-5 h-5 ${activeTab === item.id ? 'text-emerald-600' : 'text-gray-500'}`} />
                          <span className="font-bold uppercase text-sm">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Desktop Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar - Fixed on the left */}
        <aside className={`hidden lg:flex lg:flex-col bg-white border-r-4 border-black transition-all duration-300 z-40 fixed inset-y-0 left-0 ${sidebarCollapsed ? 'w-20' : 'w-64'}`}>
          {/* Logo - Retro Title Bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b-4 border-black bg-gradient-to-r from-emerald-600 to-teal-600 shrink-0">
            {!sidebarCollapsed && (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border-2 border-black shadow-lg">
                  <img src="/logo.png" alt="Kebele" className="w-7 h-7 object-cover" />
                </div>
                <div>
                  <p className="font-bold text-white uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Kebele</p>
                  <p className="text-xs text-emerald-100">Admin Panel</p>
                </div>
              </div>
            )}
            {sidebarCollapsed && (
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border-2 border-black shadow-lg mx-auto">
                <img src="/logo.png" alt="Kebele" className="w-7 h-7 object-cover" />
              </div>
            )}
          </div>

          {/* Navigation - Scrollable */}
          <nav className="flex-1 overflow-y-auto py-4">
            {categories.map(cat => (
              <div key={cat.id} className="mb-4">
                {!sidebarCollapsed && (
                  <h3 className="px-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{cat.label}</h3>
                )}
                <div className="space-y-1 px-2">
                  {navItems.filter(item => item.category === cat.id).map(item => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => navigate(`/admin/${item.id}`)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 border-2 border-black rounded-lg transition-all duration-200 ${
                          activeTab === item.id 
                            ? 'bg-emerald-100' 
                            : 'bg-white hover:bg-gray-100'
                        } ${sidebarCollapsed ? 'justify-center' : ''}`}
                        title={sidebarCollapsed ? item.label : undefined}
                        style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}
                      >
                        <Icon className={`w-5 h-5 flex-shrink-0 ${activeTab === item.id ? 'text-emerald-600' : 'text-gray-500'}`} />
                        {!sidebarCollapsed && (
                          <span className="font-bold uppercase text-sm">{item.label}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Sidebar Footer - Fixed at bottom */}
          <div className="p-4 border-t-4 border-black bg-gray-50 shrink-0">
            {!sidebarCollapsed ? (
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => setSidebarCollapsed(true)}
                  className="p-2 bg-white border-2 border-black rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-black" />
                </button>
                <button 
                  onClick={() => navigate('/')}
                  className="flex items-center space-x-2 px-3 py-2 bg-white border-2 border-black rounded-lg hover:bg-emerald-100 transition-colors"
                  style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}
                >
                  <span className="text-sm font-bold text-gray-800">Back to Site</span>
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setSidebarCollapsed(false)}
                className="w-full p-2 bg-white border-2 border-black rounded-lg hover:bg-gray-100 transition-colors flex justify-center"
              >
                <ChevronRight className="w-4 h-4 text-black" />
              </button>
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className={`flex-1 flex flex-col overflow-hidden ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
          {/* Desktop Header - Fixed at top */}
          <header className="hidden lg:flex h-16 bg-white border-b-4 border-black items-center justify-between px-6 shrink-0 sticky top-0 z-30">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-bold text-gray-800 uppercase" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
                {navItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
              </h2>
            </div>
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="pl-10 pr-4 py-2 bg-white border-2 border-black rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 w-64"
                  style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}
                />
              </div>
              
              {/* Notifications */}
              <button className="relative p-2 bg-white border-2 border-black rounded-lg hover:bg-gray-100">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User Menu */}
              <div className="relative user-dropdown">
                <button 
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center space-x-3 p-2 bg-white border-2 border-black rounded-lg hover:bg-gray-50"
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center text-white font-bold border-2 border-black">
                    {displayUser.username?.charAt(0).toUpperCase() || 'A'}
                  </div>
                  {!sidebarCollapsed && (
                    <div className="text-left">
                      <p className="text-sm font-bold text-gray-800" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{displayUser.username}</p>
                      <p className="text-xs text-gray-500 capitalize">{displayUser.role}</p>
                    </div>
                  )}
                </button>
                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-50">
                    <div className="px-4 py-3 border-b-4 border-black bg-gradient-to-r from-emerald-500 to-teal-500">
                      <p className="font-bold text-white uppercase" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{displayUser.username}</p>
                      <p className="text-sm text-emerald-100">{displayUser.email}</p>
                    </div>
                    <div className="p-2 space-y-1">
                      <button className="w-full text-left px-3 py-2 bg-white border-2 border-black rounded-lg hover:bg-gray-100 flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-600" />
                        <span className="font-bold" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Profile</span>
                      </button>
                      <button className="w-full text-left px-3 py-2 bg-white border-2 border-black rounded-lg hover:bg-gray-100 flex items-center space-x-2">
                        <Settings className="w-4 h-4 text-gray-600" />
                        <span className="font-bold" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Settings</span>
                      </button>
                      <button onClick={handleLogout} className="w-full text-left px-3 py-2 bg-white border-2 border-black rounded-lg hover:bg-red-100 flex items-center space-x-2">
                        <LogOut className="w-4 h-4 text-red-600" />
                        <span className="font-bold text-red-600" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Page Content - Scrollable and fills remaining height */}
          <div className="flex-1 overflow-y-auto p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
