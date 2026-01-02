import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Leva } from "leva";
import { Info, Calendar, ShoppingBag, Radio, Image, Menu, X, MessageSquare, Trophy, User, LayoutDashboard, Settings, Music, Play, Pause } from 'lucide-react';
import "./App.css";
import "./styles/retro.css";
import FolioCanvas from "./folio/javascript/FolioCanvas";
import "./folio/style/main.css";

// Import pages
import AboutKebele from './pages/AboutKebele';
import KebeleEvents from './pages/KebeleEvents';
import KebeleSouq from './pages/KebeleSouq';
import KebeleRadio from './pages/KebeleRadio';
import KebeleMedia from './pages/KebeleMedia';
import KebeleForum from './pages/KebeleForum';
import KebeleGames from './pages/KebeleGames';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';

// Import components
import AuthModal from './components/AuthModal';
import UserProfileModal from './components/UserProfileModal';
import UserDashboardModal from './components/UserDashboardModal';

// Import services and context
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider, useCart } from './contexts/CartContext';
import { pointsAPI } from './services/points';

// Error Boundary Component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if ((this.state as any).hasError) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-center text-white p-8 max-w-md">
            <div className="text-6xl mb-4">🚨</div>
            <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
            <p className="text-gray-300 mb-6">
              We encountered an unexpected error. Please try refreshing the page.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh Page
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Go Home
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-400 hover:text-gray-300">
                  Error Details (Dev Mode)
                </summary>
                <pre className="mt-2 text-xs text-red-400 bg-gray-800 p-3 rounded overflow-auto">
                  {(this.state as any).error?.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const isLevaDebug = window.location.hash === "#leva";

function MainApp() {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [activePage, setActivePage] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cart, cartTotal } = useCart();
  const [authModalFeature, setAuthModalFeature] = useState<string>('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserProfileModal, setShowUserProfileModal] = useState(false);
  const [showUserDashboardModal, setShowUserDashboardModal] = useState(false);
  const [modalLoading, setModalLoading] = useState<string | null>(null);
  const [isMusicPlayerOpen, setIsMusicPlayerOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [is3DLoaded, setIs3DLoaded] = useState(false);
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [userPoints, setUserPoints] = useState<any>(null);

  // Fetch user points when user changes
  useEffect(() => {
    if (user) {
      fetchUserPoints();
    } else {
      setUserPoints(null);
    }
  }, [user]);

  const fetchUserPoints = async () => {
    if (!user) return;
    try {
      const data = await pointsAPI.getUserPoints(user.id);
      setUserPoints(data);
    } catch (error) {
      console.error('Error fetching user points:', error);
    }
  };

  // Set up global functions immediately
  (window as any).openKebeleModal = (modalType: string) => {
    console.log('openKebeleModal called with:', modalType);
    openModal(modalType);
  };

  // Initialize checkAuthForFeature function
  const updateAuthCheckFunction = () => {
    (window as any).checkAuthForFeature = (feature: string) => {
      console.log('checkAuthForFeature called with:', feature, 'user:', user, 'loading:', loading);
      if (loading) {
        // If still loading, deny access and show loading state
        console.log('Auth still loading, denying access');
        return false;
      }
      if (!user) {
        console.log('No user found, showing auth modal for:', feature);
        setAuthModalFeature(feature);
        setShowAuthModal(true);
        return false;
      }
      console.log('User authenticated, allowing access to:', feature);
      return true;
    };
  };

  // Update the auth check function whenever user or loading state changes
  useEffect(() => {
    updateAuthCheckFunction();
  }, [user, loading]);

  useEffect(() => {
    console.log('MainApp component mounted, openKebeleModal function available:', !!(window as any).openKebeleModal);

    // Also listen for the fallback custom event
    const handleOpenKebeleModal = (event: CustomEvent) => {
      console.log('Received openKebeleModal event:', event.detail);
      setActiveModal(event.detail);
    };

    window.addEventListener('openKebeleModal', handleOpenKebeleModal as EventListener);

    return () => {
      delete (window as any).openKebeleModal;
      delete (window as any).checkAuthForFeature;
      window.removeEventListener('openKebeleModal', handleOpenKebeleModal as EventListener);
    };
  }, []);

  const closeModal = () => setActiveModal(null);

  const openModal = (modalType: string) => {
    // Allow forum access without authentication
    // Check authentication for other protected features if needed

    // Show loading first for certain modals
    if (['events', 'about', 'media', 'souq', 'radio'].includes(modalType)) {
      setModalLoading(modalType);
      // Simulate loading delay, then show modal
      setTimeout(() => {
        setModalLoading(null);
        setActiveModal(modalType);
      }, 1500);
    } else {
      setActiveModal(modalType);
    }
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
    setAuthModalFeature('');
  };

  return (
    <div className="w-screen h-screen relative retro-bg">
        <Leva hidden={!isLevaDebug} collapsed oneLineLabels />

        {/* Header with Logo and Navigation */}
        <div className="absolute top-6 left-8 right-8 z-[100] flex justify-between items-center">
          {/* Logo */}
          <div className="retro-nav px-6 py-3 font-bold text-lg flex items-center space-x-2 retro-floating">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center border-2 border-gray-800 retro-icon">
              <span className="text-gray-800 font-bold text-sm retro-title">K</span>
            </div>
            <span className="retro-title text-gray-800">KEBELE</span>
          </div>

          {/* Navigation */}
          <div className="flex items-center space-x-4">
            {/* Circular Profile Button for Dashboard */}
            <button
              onClick={() => user ? setShowUserDashboardModal(true) : setShowAuthModal(true)}
              className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform border-2 border-white/30 shadow-lg"
              title={user ? "Open Dashboard" : "Login to access Dashboard"}
            >
              <span className="text-white font-bold text-lg">
                {user ? user.email?.charAt(0).toUpperCase() : '?'}
              </span>
            </button>

            {/* Navigation Buttons */}
            <div className="hidden sm:flex space-x-4">
              <button
                onClick={() => openModal('about')}
                className="retro-btn px-3 py-2 font-medium text-xs flex items-center space-x-2 retro-hover"
              >
                <Info className="w-4 h-4 retro-icon" />
                <span>ABOUT</span>
              </button>
              <button
                onClick={() => openModal('events')}
                className="retro-btn px-3 py-2 font-medium text-xs flex items-center space-x-2 retro-hover"
              >
                <Calendar className="w-4 h-4 retro-icon" />
                <span>EVENTS</span>
              </button>
              <button
                onClick={() => openModal('souq')}
                className="retro-btn px-3 py-2 font-medium text-xs flex items-center space-x-2 retro-hover"
              >
                <ShoppingBag className="w-4 h-4 retro-icon" />
                <span>SOUQ</span>
              </button>
              <button
                onClick={() => openModal('radio')}
                className="retro-btn px-3 py-2 font-medium text-xs flex items-center space-x-2 retro-hover"
              >
                <Radio className="w-4 h-4 retro-icon" />
                <span>RADIO</span>
              </button>
              <button
                onClick={() => openModal('media')}
                className="retro-btn px-3 py-2 font-medium text-xs flex items-center space-x-2 retro-hover"
              >
                <Image className="w-4 h-4 retro-icon" />
                <span>MEDIA</span>
              </button>
            </div>
          </div>

          {/* Mobile Hamburger Menu */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="retro-nav p-3 retro-hover"
            >
              {isMenuOpen ? <X className="w-6 h-6 retro-icon" /> : <Menu className="w-6 h-6 retro-icon" />}
            </button>

            {isMenuOpen && (
              <div className="absolute top-full right-8 mt-2 retro-window retro-floating p-4 min-w-[200px]">
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={() => { navigate('/admin'); setIsMenuOpen(false); }}
                    className="retro-btn px-3 py-2 font-medium text-xs flex items-center space-x-2 retro-hover"
                  >
                    <Settings className="w-5 h-5 retro-icon" />
                    <span>ADMIN</span>
                  </button>
                  <button
                    onClick={() => { openModal('forum'); setIsMenuOpen(false); }}
                    className="retro-btn px-3 py-2 font-medium text-xs flex items-center space-x-2 retro-hover"
                  >
                    <MessageSquare className="w-5 h-5 retro-icon" />
                    <span>FORUM</span>
                  </button>
                  <button
                    onClick={() => { openModal('games'); setIsMenuOpen(false); }}
                    className="retro-btn px-3 py-2 font-medium text-xs flex items-center space-x-2 retro-hover"
                  >
                    <span className="w-5 h-5 flex items-center justify-center text-lg">🎮</span>
                    <span>GAMES</span>
                  </button>
                  <button
                    onClick={() => { openModal('about'); setIsMenuOpen(false); }}
                    className="retro-btn px-3 py-2 font-medium text-xs flex items-center space-x-2 retro-hover"
                  >
                    <Info className="w-5 h-5 retro-icon" />
                    <span>ABOUT</span>
                  </button>
                  <button
                    onClick={() => { openModal('events'); setIsMenuOpen(false); }}
                    className="retro-btn px-3 py-2 font-medium text-xs flex items-center space-x-2 retro-hover"
                  >
                    <Calendar className="w-5 h-5 retro-icon" />
                    <span>EVENTS</span>
                  </button>
                  <button
                    onClick={() => { openModal('souq'); setIsMenuOpen(false); }}
                    className="retro-btn px-3 py-2 font-medium text-xs flex items-center space-x-2 retro-hover"
                  >
                    <ShoppingBag className="w-5 h-5 retro-icon" />
                    <span>SOUQ</span>
                  </button>
                  <button
                    onClick={() => { openModal('radio'); setIsMenuOpen(false); }}
                    className="retro-btn px-3 py-2 font-medium text-xs flex items-center space-x-2 retro-hover"
                  >
                    <Radio className="w-5 h-5 retro-icon" />
                    <span>RADIO</span>
                  </button>
                  <button
                    onClick={() => { openModal('media'); setIsMenuOpen(false); }}
                    className="retro-btn px-3 py-2 font-medium text-xs flex items-center space-x-2 retro-hover"
                  >
                    <Image className="w-5 h-5 retro-icon" />
                    <span>MEDIA</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
{/* Base 3D Portfolio */}
<FolioCanvas />

{/* Bottom Action Bar - Left Side */}
<div className="absolute bottom-6 left-8 z-[90]">
  <div className="flex items-center space-x-3">

    {/* Music Player Button */}
    <div className="flex items-center space-x-2">
      <button
        onClick={() => setIsMusicPlayerOpen(!isMusicPlayerOpen)}
        className="retro-btn px-3 py-2 font-medium text-xs flex items-center space-x-2 retro-hover bg-purple-500"
        title="Music Player"
      >
        <Music className="w-4 h-4 retro-icon" />
        <span>MUSIC</span>
      </button>

      {/* Spectrum Visualizer */}
      {isPlaying && (
        <div className="flex items-end space-x-1 h-8">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-purple-400 rounded-full animate-pulse"
              style={{
                height: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.1}s`,
                animationDuration: '0.5s'
              }}
            />
          ))}
        </div>
      )}
    </div>

    {/* Forum/Dashboard Button */}
    <button
      onClick={() => openModal('forum')}
      className="retro-btn px-3 py-2 font-medium text-xs flex items-center space-x-2 retro-hover bg-sky-blue"
      title="Forum & Games"
    >
      <MessageSquare className="w-4 h-4 retro-icon" />
      <span>FORUM</span>
    </button>

    {/* Play/Games Button */}
    <button
      onClick={() => openModal('games')}
      className="retro-btn px-3 py-2 font-medium text-xs flex items-center space-x-2 retro-hover bg-mustard"
      title="Games & Scores"
    >
      <span className="w-4 h-4 flex items-center justify-center text-charcoal font-bold">🎮</span>
      <span>PLAY</span>
    </button>
  </div>
</div>

{/* Modal Loading */}
        {modalLoading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="retro-window retro-floating text-center max-w-sm w-full">
              <div className="retro-titlebar retro-titlebar-sky mb-4">
                <div className="flex items-center justify-center">
                  <Calendar className="w-5 h-5 retro-icon" />
                </div>
                <div className="retro-window-controls">
                  <div className="retro-window-dot"></div>
                  <div className="retro-window-dot"></div>
                  <div className="retro-window-dot"></div>
                </div>
              </div>
              <div className="retro-spinner w-16 h-16 mx-auto mb-6"></div>
              <div className="retro-title text-lg font-bold uppercase tracking-wider">Loading {modalLoading}...</div>
              <p className="retro-text text-sm mt-4 pb-6 opacity-80">Preparing your experience</p>
            </div>
          </div>
        )}

        {/* Modals */}
        {activeModal && (
          <div className="fixed inset-0 z-50 retro-modal flex items-center justify-center p-4" onClick={closeModal}>
            <div className="relative retro-modal-content retro-window w-full max-w-6xl max-h-[90vh] overflow-hidden retro-floating" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 retro-btn text-2xl w-10 h-10 p-0 flex items-center justify-center z-10"
                title="Close"
              >
                ×
              </button>
              <div className="max-h-[70vh] overflow-y-auto">
                {activeModal === 'forum' && <KebeleForum />}
                {activeModal === 'games' && <KebeleGames />}
                {activeModal === 'about' && <AboutKebele />}
                {activeModal === 'events' && <KebeleEvents />}
                {activeModal === 'souq' && <KebeleSouq />}
                {activeModal === 'radio' && <KebeleRadio />}
                {activeModal === 'media' && <KebeleMedia />}
              </div>
            </div>
          </div>
        )}

        {/* Auth Modal */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={closeAuthModal}
          feature={authModalFeature}
        />

        {/* User Profile Modal */}
        <UserProfileModal
          isOpen={showUserProfileModal}
          onClose={() => setShowUserProfileModal(false)}
        />

        {/* User Dashboard Modal */}
        <UserDashboardModal
          isOpen={showUserDashboardModal}
          onClose={() => setShowUserDashboardModal(false)}
        />

        {/* Music Player Modal */}
        {isMusicPlayerOpen && (
          <div className="fixed bottom-20 left-8 z-[95] retro-window retro-floating min-w-[300px]">
            <div className="retro-titlebar retro-titlebar-purple mb-3">
              <div className="flex items-center justify-center space-x-2">
                <Music className="w-4 h-4 retro-icon" />
                <span className="retro-title text-sm font-bold uppercase">Music Player</span>
              </div>
              <div className="retro-window-controls">
                <button
                  onClick={() => setIsMusicPlayerOpen(false)}
                  className="retro-window-dot bg-red-500 hover:bg-red-600"
                ></button>
              </div>
            </div>
            <div className="space-y-2">
              {/* Tiny Video Display */}
              <div className="flex justify-center mb-3">
                <div className="w-32 h-24 bg-black rounded-lg overflow-hidden border-2 border-purple-500">
                  <video
                    className="w-full h-full object-cover"
                    autoPlay={isPlaying}
                    muted
                    loop
                    src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
              <div className="text-center">
                <div className="retro-title text-sm font-bold mb-2">Traditional Ethiopian Music</div>
                <div className="retro-text text-xs opacity-80 mb-3">Various Artists</div>
                <div className="flex items-center justify-center space-x-4">
                  <button className="retro-btn p-2">
                    <span className="text-lg">⏮️</span>
                  </button>
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="retro-btn p-3 bg-purple-600 hover:bg-purple-700"
                  >
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                  </button>
                  <button className="retro-btn p-2">
                    <span className="text-lg">⏭️</span>
                  </button>
                </div>
              </div>
              <div className="space-y-1 p-2">
                <div className="text-xs retro-text">Now Playing:</div>
                <div className="bg-purple-100 p-2 rounded text-xs">
                  🎵 Azmari Performance - Live Session
                </div>
                <div className="bg-gray-100 p-2 rounded text-xs opacity-60">
                  🎵 Coffee Ceremony Chant - Traditional
                </div>
                <div className="bg-gray-100 p-2 rounded text-xs opacity-60">
                  🎵 Modern Fusion - Addis Groove
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <Router>
            <Routes>
              <Route path="/" element={<MainApp />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/login" element={<AdminLogin />} />
            </Routes>
          </Router>
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
