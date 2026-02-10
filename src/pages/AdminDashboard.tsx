import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, BarChart3, Users, MessageSquare, Gamepad2, 
  Calendar, Image, Radio, ShoppingBag, CreditCard, Info, Settings,
  ChevronRight, ChevronLeft, Bell, Search, LogOut, User, Menu,
  Plus, Edit, Trash2, Eye, Filter, Download, Upload, RefreshCw
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/Modal';
import AdminOverview from '../components/AdminOverview';
import AdminAnalytics from '../components/AdminAnalytics';
import AdminUsers from '../components/AdminUsers';
import AdminEvents from '../pages/AdminEvents';
import AdminForum from '../components/AdminForum';
import AdminGames from '../pages/AdminGames';
import AdminGallery from '../pages/AdminGallery';
import AdminMedia from '../pages/AdminMedia';
import AdminRadio from '../pages/AdminRadio';
import AdminSouq from '../pages/AdminSouq';
import AdminTransactions from '../pages/AdminTransactions';
import AdminAbout from '../pages/AdminAbout';
import AdminSettings from '../pages/AdminSettings';

// Admin Dashboard with Clean, Modern Aesthetics
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

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
    { id: 'settings', label: 'Settings', icon: Settings, category: 'system' },
  ];

  const categories = [
    { id: 'main', label: 'Main', color: 'text-emerald-600' },
    { id: 'content', label: 'Content', color: 'text-blue-600' },
    { id: 'system', label: 'System', color: 'text-purple-600' },
  ];

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Hide canvas when admin dashboard is active
  useEffect(() => {
    const canvas = document.querySelector('.canvas') as HTMLElement;
    if (canvas) {
      canvas.style.display = 'none';
    }
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';
    return () => {
      if (canvas) {
        canvas.style.display = '';
      }
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    };
  }, []);

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

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <AdminOverview onNavigateToTab={setActiveTab} />;
      case 'analytics':
        return <AdminAnalytics />;
      case 'users':
        return <AdminUsers />;
      case 'forum':
        return <AdminForum />;
      case 'games':
        return <AdminGames />;
      case 'events':
        return <AdminEvents />;
      case 'media':
        return <AdminMedia />;
      case 'gallery':
        return <AdminGallery />;
      case 'radio':
        return <AdminRadio />;
      case 'souq':
        return <AdminSouq />;
      case 'transactions':
        return <AdminTransactions />;
      case 'about':
        return <AdminAbout />;
      case 'settings':
        return <AdminSettings />;
      default:
        return null;
    }
  };

  const displayUser = user || {
    email: 'admin@kebele.com',
    role: 'admin' as const,
    username: 'Admin',
    id: 'admin-demo'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-40 flex items-center justify-between px-4">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
            <img src="/logo.png" alt="Kebele" className="w-6 h-6 object-cover" />
          </div>
          <span className="font-semibold text-gray-800">Admin</span>
        </div>
        <div className="relative user-dropdown">
          <button 
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-medium"
          >
            {displayUser.username?.charAt(0).toUpperCase() || 'A'}
          </button>
          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="font-medium text-gray-800">{displayUser.username}</p>
                <p className="text-sm text-gray-500">{displayUser.email}</p>
              </div>
              <button onClick={() => { navigate('/'); setShowUserDropdown(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                Back to Site
              </button>
              <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2">
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
          <div className="w-72 bg-white h-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                  <img src="/logo.png" alt="Kebele" className="w-7 h-7 object-cover" />
                </div>
                <div>
                  <p className="font-bold text-gray-800">Admin</p>
                  <p className="text-xs text-gray-500">Dashboard</p>
                </div>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>
            <nav className="p-4 space-y-6">
              {categories.map(cat => (
                <div key={cat.id}>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{cat.label}</h3>
                  <div className="space-y-1">
                    {navItems.filter(item => item.category === cat.id).map(item => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                            activeTab === item.id 
                              ? 'bg-emerald-50 text-emerald-700' 
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <Icon className={`w-5 h-5 ${activeTab === item.id ? 'text-emerald-600' : 'text-gray-400'}`} />
                          <span className="font-medium">{item.label}</span>
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

      {/* Desktop Sidebar */}
      <div className={`hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:flex-col bg-white border-r border-gray-200 transition-all duration-300 z-40 ${
        sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'
      }`}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
          {!sidebarCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
                <img src="/logo.png" alt="Kebele" className="w-7 h-7 object-cover" />
              </div>
              <div>
                <p className="font-bold text-gray-800">Kebele</p>
                <p className="text-xs text-gray-500">Admin Panel</p>
              </div>
            </div>
          )}
          {sidebarCollapsed && (
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-200">
              <img src="/logo.png" alt="Kebele" className="w-7 h-7 object-cover" />
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {categories.map(cat => (
            <div key={cat.id} className="mb-4">
              {!sidebarCollapsed && (
                <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{cat.label}</h3>
              )}
              <div className="space-y-1 px-2">
                {navItems.filter(item => item.category === cat.id).map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                        activeTab === item.id 
                          ? 'bg-emerald-50 text-emerald-700' 
                          : 'text-gray-600 hover:bg-gray-50'
                      } ${sidebarCollapsed ? 'justify-center' : ''}`}
                      title={sidebarCollapsed ? item.label : undefined}
                    >
                      <Icon className={`w-5 h-5 flex-shrink-0 ${activeTab === item.id ? 'text-emerald-600' : 'text-gray-400'}`} />
                      {!sidebarCollapsed && (
                        <span className="font-medium">{item.label}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-100">
          {!sidebarCollapsed ? (
            <div className="flex items-center justify-between">
              <button 
                onClick={() => setSidebarCollapsed(true)}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-400"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
              >
                <span className="text-sm">Back to Site</span>
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setSidebarCollapsed(false)}
              className="w-full p-2 hover:bg-gray-100 rounded-lg text-gray-400 flex justify-center"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 pt-16 lg:pt-0 ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
        {/* Desktop Header */}
        <div className="hidden lg:flex h-16 bg-white border-b border-gray-200 items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-800">
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
                className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent w-64"
              />
            </div>
            
            {/* Notifications */}
            <button className="relative p-2 hover:bg-gray-100 rounded-lg">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Menu */}
            <div className="relative user-dropdown">
              <button 
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg"
              >
                <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-medium">
                  {displayUser.username?.charAt(0).toUpperCase() || 'A'}
                </div>
                {!sidebarCollapsed && (
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-800">{displayUser.username}</p>
                    <p className="text-xs text-gray-500 capitalize">{displayUser.role}</p>
                  </div>
                )}
              </button>
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="font-medium text-gray-800">{displayUser.username}</p>
                    <p className="text-sm text-gray-500">{displayUser.email}</p>
                  </div>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </button>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2">
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6 min-h-[calc(100vh-4rem)]">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
