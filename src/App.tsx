import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Leva } from "leva";
import { Info, Calendar, ShoppingBag, Radio, Image, Menu, X, MessageSquare, Trophy, User, LayoutDashboard, Settings, Music, Play, Pause } from 'lucide-react';
import "./App.css";
import "./styles/retro.css";
import FolioCanvas from "./folio/javascript/FolioCanvas";
import "./folio/style/main.css";

// Import pages
import MaintenancePage from './pages/MaintenancePage';
import AboutKebele from './pages/AboutKebele';
import KebeleEvents from './pages/KebeleEvents';
import KebeleSouq from './pages/KebeleSouq';
import KebeleRadio from './pages/KebeleRadio';
import KebeleMedia from './pages/KebeleMedia';
import KebeleForum from './pages/KebeleForum';
import KebeleGames from './pages/KebeleGames';
import AdminDashboard from './pages/AdminDashboard';
import AdminForum from './pages/AdminForum';
import AdminOverview from './pages/AdminOverview';
import AdminLogin from './pages/AdminLogin';
import AdminAbout from './pages/AdminAbout';
import AdminRadio from './pages/AdminRadio';
import AdminSouq from './pages/AdminSouq';
import AdminGames from './pages/AdminGames';
import AdminMedia from './pages/AdminMedia';
import AdminEvents from './pages/AdminEvents';
import AdminSettings from './pages/AdminSettings';
import AdminTransactions from './pages/AdminTransactions';
import AdminUsers from './components/AdminUsers';
import AdminAnalytics from './components/AdminAnalytics';
import AdminGallery from './pages/AdminGallery';
import AdminSocialLinks from './pages/AdminSocialLinks';
import AdminPaymentRequests from './pages/AdminPaymentRequests';

import AdminRoute from './components/AdminRoute';
import AuthModal from './components/AuthModal';
import UserDashboardModal from './components/UserDashboardModal';

// Import services and context
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider, useCart } from './contexts/CartContext';
import { pointsAPI } from './services/points';
import { settingsAPI } from './services/admin';
import { radioAPI } from './services/content';

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
            {import.meta.env.DEV && (
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Pause Three.js render loop while a modal covers the 3D scene
  useEffect(() => {
    if (activeModal) {
      window.dispatchEvent(new Event('kebele:modal:open'));
    } else {
      window.dispatchEvent(new Event('kebele:modal:close'));
    }
  }, [activeModal]);
  const { cart, cartTotal } = useCart();
  const [authModalFeature, setAuthModalFeature] = useState<string>('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserDashboardModal, setShowUserDashboardModal] = useState(false);
  const [isMusicPlayerOpen, setIsMusicPlayerOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [radioTracks, setRadioTracks] = useState<any[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
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


  // Fetch radio tracks on mount
  const fetchRadioTracks = async () => {
    try {
      const data = await radioAPI.getStations();
      if (data && data.length > 0) {
        setRadioTracks(data);
      }
    } catch (err) {
      console.error('Error fetching radio tracks:', err);
    }
  };

  useEffect(() => {
    fetchRadioTracks();
  }, []);

  // Fetch maintenance mode setting on mount
  useEffect(() => {
    settingsAPI.getSettings().then(data => {
      if (data?.maintenanceMode) setMaintenanceMode(true);
    }).catch(() => {});
  }, []);

  // Initialize checkAuthForFeature function
  const updateAuthCheckFunction = () => {
    (window as any).checkAuthForFeature = (feature: string) => {
      if (loading) return false;
      if (!user) {
        setAuthModalFeature(feature);
        setShowAuthModal(true);
        return false;
      }
      return true;
    };
  };

  // Update the auth check function whenever user or loading state changes
  useEffect(() => {
    updateAuthCheckFunction();
  }, [user, loading]);

  useEffect(() => {
    (window as any).openKebeleModal = (modalType: string) => {
      setActiveModal(modalType);
    };

    const handleOpenKebeleModal = (event: CustomEvent) => {
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

    // Show modal immediately without loading delay
    setActiveModal(modalType);
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
    setAuthModalFeature('');
  };

  if (maintenanceMode && user?.role !== 'admin') return <MaintenancePage />;

  return (
    <div className="w-screen h-screen relative retro-bg">
        <Leva hidden={!isLevaDebug} collapsed oneLineLabels />

        {/* Header with Logo and Navigation */}
        <div className="absolute top-6 left-8 right-8 z-[100] flex justify-between items-center">
          {/* Logo */}
          <div className="retro-nav px-6 py-3 font-bold text-lg flex items-center space-x-3 retro-floating">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center border-2 border-gray-800 retro-icon overflow-hidden p-2">
              <img src="/logo.png" alt="Kebele Zero Logo" className="w-full h-full object-cover rounded-full" />
            </div>
            <span className="retro-title text-gray-800">KEBELE ZERO</span>
          </div>

          {/* Navigation */}
          <div className="flex items-center space-x-4">
            {/* Circular Profile Button for Dashboard */}
            <button
              onClick={() => user ? setShowUserDashboardModal(true) : setShowAuthModal(true)}
              className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform border-2 border-white/30"
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
                className={`retro-btn px-3 py-2 font-medium text-xs flex items-center space-x-2 retro-hover ${activeModal === 'about' ? 'ring-4 ring-yellow-400 bg-yellow-400 text-black' : ''}`}
              >
                <Info className="w-4 h-4 retro-icon" />
                <span>ABOUT</span>
              </button>
              <button
                onClick={() => openModal('events')}
                className={`retro-btn px-3 py-2 font-medium text-xs flex items-center space-x-2 retro-hover ${activeModal === 'events' ? 'ring-4 ring-green-400 bg-green-400 text-black' : ''}`}
              >
                <Calendar className="w-4 h-4 retro-icon" />
                <span>EVENTS</span>
              </button>
              <button
                onClick={() => openModal('souq')}
                className={`retro-btn px-3 py-2 font-medium text-xs flex items-center space-x-2 retro-hover ${activeModal === 'souq' ? 'ring-4 ring-orange-400 bg-orange-400 text-black' : ''}`}
              >
                <ShoppingBag className="w-4 h-4 retro-icon" />
                <span>SOUQ</span>
              </button>
              <button
                onClick={() => openModal('radio')}
                className={`retro-btn px-3 py-2 font-medium text-xs flex items-center space-x-2 retro-hover ${activeModal === 'radio' ? 'ring-4 ring-purple-400 bg-purple-400 text-white' : ''}`}
              >
                <Radio className="w-4 h-4 retro-icon" />
                <span>RADIO</span>
              </button>
              <button
                onClick={() => openModal('media')}
                className={`retro-btn px-3 py-2 font-medium text-xs flex items-center space-x-2 retro-hover ${activeModal === 'media' ? 'ring-4 ring-pink-400 bg-pink-400 text-white' : ''}`}
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
                className={`retro-btn px-3 py-2 font-medium text-xs flex items-center space-x-2 retro-hover ${isMusicPlayerOpen ? 'ring-4 ring-purple-400 bg-purple-600 text-white' : 'bg-purple-500'}`}
                title="Music Player"
              >
                <Music className="w-4 h-4 retro-icon" />
                <span>MUSIC</span>
              </button>

              {/* Spectrum Visualizer */}
              {isPlaying && (
                <div className="flex items-end space-x-1 h-8">
                  {[30, 70, 50, 90, 40, 80, 60, 45].map((pct, i) => (
                    <div
                      key={i}
                      className="w-1 bg-purple-400 rounded-full"
                      style={{
                        height: `${pct}%`,
                        animation: `pulse ${0.4 + i * 0.07}s ease-in-out infinite alternate`
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Forum/Dashboard Button */}
            <button
              onClick={() => openModal('forum')}
              className={`retro-btn px-3 py-2 font-medium text-xs flex items-center space-x-2 retro-hover ${activeModal === 'forum' ? 'ring-4 ring-sky-400 bg-sky-500 text-black' : 'bg-sky-blue'}`}
              title="Forum & Games"
            >
              <MessageSquare className="w-4 h-4 retro-icon" />
              <span>FORUM</span>
            </button>

            {/* Play/Games Button */}
            <button
              onClick={() => openModal('games')}
              className={`retro-btn px-3 py-2 font-medium text-xs flex items-center space-x-2 retro-hover ${activeModal === 'games' ? 'ring-4 ring-yellow-400 bg-yellow-500 text-black' : 'bg-mustard'}`}
              title="Games & Scores"
            >
              <span className="w-4 h-4 flex items-center justify-center text-charcoal font-bold">🎮</span>
              <span>PLAY</span>
            </button>
          </div>
        </div>

        {/* Modals */}
        {activeModal && (
          <div
            className="fixed inset-0 z-[150] flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
            onClick={closeModal}
          >
            <div 
              className="w-full max-w-6xl max-h-[90vh] overflow-hidden bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-none"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Title Bar */}
              <div className="flex items-center justify-between px-4 py-3 border-b-4 border-black bg-gradient-to-r from-emerald-500 to-teal-500">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-lg border-2 border-black">
                    {activeModal === 'forum' && <MessageSquare className="w-5 h-5 text-emerald-500" />}
                    {activeModal === 'games' && <Trophy className="w-5 h-5 text-emerald-500" />}
                    {activeModal === 'about' && <Info className="w-5 h-5 text-emerald-500" />}
                    {activeModal === 'events' && <Calendar className="w-5 h-5 text-emerald-500" />}
                    {activeModal === 'souq' && <ShoppingBag className="w-5 h-5 text-emerald-500" />}
                    {activeModal === 'radio' && <Radio className="w-5 h-5 text-emerald-500" />}
                    {activeModal === 'media' && <Image className="w-5 h-5 text-emerald-500" />}
                  </div>
                  <h3 className="text-lg font-black text-white uppercase tracking-wide drop-shadow-lg" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
                    {activeModal === 'forum' && 'Forum & Discussion'}
                    {activeModal === 'games' && 'Games & Scores'}
                    {activeModal === 'about' && 'About Kebele Zero'}
                    {activeModal === 'events' && 'Events'}
                    {activeModal === 'souq' && 'Souq Marketplace'}
                    {activeModal === 'radio' && 'Kebele Radio'}
                    {activeModal === 'media' && 'Media Gallery'}
                  </h3>
                </div>
                <button
                  onClick={closeModal}
                  className="group p-1 bg-white border-2 border-black rounded-none shadow hover:bg-red-500 transition-all"
                >
                  <X className="w-4 h-4 text-black group-hover:text-white transition-colors" />
                </button>
              </div>
              <div className="max-h-[calc(90vh-80px)] overflow-y-auto">
                {activeModal === 'forum'  && <KebeleForum />}
                {activeModal === 'games'  && <KebeleGames />}
                {activeModal === 'about'  && <AboutKebele />}
                {activeModal === 'events' && <KebeleEvents />}
                {activeModal === 'souq'   && <KebeleSouq />}
                {activeModal === 'radio'  && <KebeleRadio />}
                {activeModal === 'media'  && <KebeleMedia />}
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

        {/* User Dashboard Modal */}
        <UserDashboardModal
          isOpen={showUserDashboardModal}
          onClose={() => setShowUserDashboardModal(false)}
        />

        {/* Music Player Modal */}
        {isMusicPlayerOpen && (
          <div className="fixed bottom-20 left-8 z-[95] bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-80">
            {/* Title bar */}
            <div className="flex items-center justify-between px-3 py-2 border-b-4 border-black bg-gradient-to-r from-purple-600 to-violet-600">
              <div className="flex items-center space-x-2">
                <Music className="w-4 h-4 text-white" />
                <span className="font-black text-white uppercase text-xs tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Music Player</span>
              </div>
              <button onClick={() => setIsMusicPlayerOpen(false)} className="w-6 h-6 bg-red-500 border-2 border-black flex items-center justify-center hover:bg-red-600">
                <X className="w-3 h-3 text-white" />
              </button>
            </div>

            {/* Video embed */}
            {radioTracks.length > 0 && radioTracks[currentTrackIndex]?.youtube_id ? (
              <div className="w-full aspect-video bg-black border-b-4 border-black">
                <iframe
                  key={radioTracks[currentTrackIndex].youtube_id}
                  src={`https://www.youtube.com/embed/${radioTracks[currentTrackIndex].youtube_id}?autoplay=${isPlaying ? 1 : 0}&controls=1`}
                  className="w-full h-full"
                  allow="autoplay; encrypted-media"
                  allowFullScreen={false}
                  title={radioTracks[currentTrackIndex].title}
                />
              </div>
            ) : (
              <div className="w-full aspect-video bg-gray-100 border-b-4 border-black flex items-center justify-center">
                <Music className="w-12 h-12 text-gray-300" />
              </div>
            )}

            {/* Current track info */}
            <div className="p-3 border-b-4 border-black bg-purple-50">
              {radioTracks.length > 0 ? (
                <>
                  <p className="font-black text-sm uppercase truncate" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
                    {radioTracks[currentTrackIndex]?.title || 'Unknown Track'}
                  </p>
                  <p className="text-xs text-gray-500 capitalize" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
                    {radioTracks[currentTrackIndex]?.category || 'music'} • {currentTrackIndex + 1}/{radioTracks.length}
                  </p>
                </>
              ) : (
                <p className="text-xs text-gray-500" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>No tracks added yet. Add tracks from the admin dashboard.</p>
              )}
            </div>

            {/* Controls */}
            <div className="p-3 flex items-center justify-center space-x-3 border-b-4 border-black">
              <button
                onClick={() => setCurrentTrackIndex(i => Math.max(0, i - 1))}
                disabled={currentTrackIndex === 0 || radioTracks.length === 0}
                className="w-8 h-8 bg-white border-2 border-black flex items-center justify-center hover:bg-gray-100 disabled:opacity-40"
              >
                <span className="text-sm">⏮</span>
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-10 h-10 bg-purple-600 border-2 border-black flex items-center justify-center hover:bg-purple-700"
              >
                {isPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white" />}
              </button>
              <button
                onClick={() => setCurrentTrackIndex(i => Math.min(radioTracks.length - 1, i + 1))}
                disabled={currentTrackIndex >= radioTracks.length - 1 || radioTracks.length === 0}
                className="w-8 h-8 bg-white border-2 border-black flex items-center justify-center hover:bg-gray-100 disabled:opacity-40"
              >
                <span className="text-sm">⏭</span>
              </button>
            </div>

            {/* Playlist */}
            {radioTracks.length > 0 && (
              <div className="max-h-40 overflow-y-auto">
                {radioTracks.map((track, idx) => (
                  <button
                    key={track.id}
                    onClick={() => { setCurrentTrackIndex(idx); setIsPlaying(true); }}
                    className={`w-full text-left px-3 py-2 border-b-2 border-black text-xs transition-colors ${
                      idx === currentTrackIndex ? 'bg-purple-100' : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    <p className="font-bold truncate uppercase" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
                      {idx === currentTrackIndex ? '▶ ' : ''}{track.title}
                    </p>
                    <p className="text-gray-400 capitalize">{track.category}</p>
                  </button>
                ))}
              </div>
            )}
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
               <Route path="/admin/login" element={<AdminLogin />} />
               <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>}>
                 <Route index element={<AdminOverview />} />
                 <Route path="overview" element={<AdminOverview />} />
                 <Route path="forum" element={<AdminForum />} />
                 <Route path="analytics" element={<AdminAnalytics />} />
                 <Route path="users" element={<AdminUsers />} />
                 <Route path="games" element={<AdminGames />} />
                 <Route path="souq" element={<AdminSouq />} />
                 <Route path="events" element={<AdminEvents />} />
                 <Route path="media" element={<AdminMedia />} />
                 <Route path="gallery" element={<AdminGallery />} />
                 <Route path="radio" element={<AdminRadio />} />
                 <Route path="transactions" element={<AdminTransactions />} />
                 <Route path="payment-requests" element={<AdminPaymentRequests />} />
                 <Route path="about" element={<AdminAbout />} />
                 <Route path="social-links" element={<AdminSocialLinks />} />
                 <Route path="settings" element={<AdminSettings />} />
               </Route>
               <Route path="*" element={<MainApp />} />
            </Routes>
          </Router>
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
