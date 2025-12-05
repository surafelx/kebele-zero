import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Leva } from "leva";
import { Info, Calendar, ShoppingBag, Radio, Image } from 'lucide-react';
import "./App.css";
import FolioCanvas from "./folio/javascript/FolioCanvas";
import "./folio/style/main.css";

// Import pages
import AboutKebele from './pages/AboutKebele';
import KebeleEvents from './pages/KebeleEvents';
import KebeleSouq from './pages/KebeleSouq';
import KebeleRadio from './pages/KebeleRadio';
import KebeleMedia from './pages/KebeleMedia';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';

const isLevaDebug = window.location.hash === "#leva";

function MainApp() {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const navigate = useNavigate();

  // Set up global function immediately
  (window as any).openKebeleModal = (modalType: string) => {
    console.log('openKebeleModal called with:', modalType);
    setActiveModal(modalType);
  };

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
      window.removeEventListener('openKebeleModal', handleOpenKebeleModal as EventListener);
    };
  }, []);

  const closeModal = () => setActiveModal(null);

  return (
    <div className="w-screen h-screen relative">
        <Leva hidden={!isLevaDebug} collapsed oneLineLabels />

        {/* Header with Logo and Navigation */}
        <div className="absolute top-6 left-8 right-8 z-[100] flex justify-between items-center">
          {/* Logo */}
          <div className="bg-white/5 backdrop-blur-sm text-white px-6 py-3 rounded-lg font-bold text-lg flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">K</span>
            </div>
            <span>KEBELE</span>
          </div>

          {/* Navigation Links */}
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveModal('about')}
              className="bg-white/5 backdrop-blur-sm text-white px-6 py-3 rounded-lg hover:bg-white/10 transition-colors font-medium text-sm flex items-center space-x-2"
            >
              <Info className="w-5 h-5" />
              <span>ABOUT</span>
            </button>
            <button
              onClick={() => setActiveModal('events')}
              className="bg-white/5 backdrop-blur-sm text-white px-6 py-3 rounded-lg hover:bg-white/10 transition-colors font-medium text-sm flex items-center space-x-2"
            >
              <Calendar className="w-5 h-5" />
              <span>EVENTS</span>
            </button>
            <button
              onClick={() => setActiveModal('souq')}
              className="bg-white/5 backdrop-blur-sm text-white px-6 py-3 rounded-lg hover:bg-white/10 transition-colors font-medium text-sm flex items-center space-x-2"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>SOUQ</span>
            </button>
            <button
              onClick={() => setActiveModal('radio')}
              className="bg-white/5 backdrop-blur-sm text-white px-6 py-3 rounded-lg hover:bg-white/10 transition-colors font-medium text-sm flex items-center space-x-2"
            >
              <Radio className="w-5 h-5" />
              <span>RADIO</span>
            </button>
            <button
              onClick={() => setActiveModal('media')}
              className="bg-white/5 backdrop-blur-sm text-white px-6 py-3 rounded-lg hover:bg-white/10 transition-colors font-medium text-sm flex items-center space-x-2"
            >
              <Image className="w-5 h-5" />
              <span>MEDIA</span>
            </button>
          </div>
        </div>

        {/* Base 3D Portfolio */}
        <FolioCanvas />


        {/* Modals */}
        {activeModal && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={closeModal}>
            <div className="relative bg-white w-full max-w-6xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-light"
                title="Close"
              >
                ×
              </button>
              <div className="max-h-[90vh] overflow-y-auto">
                {activeModal === 'about' && <AboutKebele />}
                {activeModal === 'events' && <KebeleEvents />}
                {activeModal === 'souq' && <KebeleSouq />}
                {activeModal === 'radio' && <KebeleRadio />}
                {activeModal === 'media' && <KebeleMedia />}
              </div>
            </div>
          </div>
        )}
      </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/login" element={<AdminLogin />} />
      </Routes>
    </Router>
  );
}

export default App;
