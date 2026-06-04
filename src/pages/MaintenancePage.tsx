import React from 'react';
import { Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';

const MaintenancePage: React.FC = () => {
  return (
    <div className="min-h-screen retro-bg flex items-center justify-center p-4">
      <div className="w-full max-w-lg border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white overflow-hidden">
        {/* Title Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b-4 border-black bg-gradient-to-r from-amber-500 to-orange-500">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-lg border-2 border-black">
              <Wrench className="w-5 h-5 text-orange-500" />
            </div>
            <h3
              className="text-lg font-black text-white uppercase tracking-wide"
              style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}
            >
              Maintenance Mode
            </h3>
          </div>
          <div className="flex space-x-2">
            <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-black" />
            <div className="w-4 h-4 rounded-full bg-yellow-400 border-2 border-black" />
            <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-black" />
          </div>
        </div>

        {/* Content */}
        <div className="p-8 text-center space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <Wrench className="w-12 h-12 text-white" />
            </div>
          </div>

          {/* Heading */}
          <div>
            <h1
              className="text-4xl font-black text-gray-900 uppercase tracking-widest"
              style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}
            >
              COMING SOON
            </h1>
            <p
              className="mt-3 text-lg font-bold text-gray-700"
              style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}
            >
              We're working on something amazing
            </p>
          </div>

          {/* Animated Retro Progress Bar */}
          <div className="space-y-2">
            <div className="w-full h-6 bg-gray-100 border-4 border-black overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-orange-500"
                style={{
                  width: '60%',
                  animation: 'retro-progress 2s ease-in-out infinite alternate',
                }}
              />
            </div>
            <p
              className="text-xs font-bold text-gray-500 uppercase tracking-widest"
              style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}
            >
              Loading...
            </p>
          </div>

          <style>{`
            @keyframes retro-progress {
              0%   { width: 20%; }
              100% { width: 90%; }
            }
          `}</style>

          {/* Message */}
          <p
            className="text-base font-bold text-gray-700 border-4 border-black bg-amber-50 p-4"
            style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}
          >
            We'll be back soon!
          </p>

          {/* Back Link */}
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-white border-4 border-black font-black text-gray-900 uppercase tracking-wide shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
            style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;
