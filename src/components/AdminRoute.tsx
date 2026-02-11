import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Loader2 } from 'lucide-react';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [redirecting, setRedirecting] = useState(false);

  // Show loading state while checking auth
  if (loading || redirecting) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated and has admin role
  if (!user) {
    // Redirect to login while preserving the intended destination
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Check if user has admin role
  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          {/* Retro Title Bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b-4 border-black bg-gradient-to-r from-red-500 to-red-600">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-wide drop-shadow-lg" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
                  Access Denied
                </h3>
                <p className="text-xs text-red-100 font-bold uppercase tracking-wide">Admin privileges required</p>
              </div>
            </div>
          </div>
          
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-4" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
              Access Restricted
            </h2>
            <p className="text-gray-600 mb-6">
              You don't have administrator privileges to access this area. 
              Please contact an administrator if you believe this is an error.
            </p>
            <div className="space-y-3">
              <a
                href="/"
                className="block w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 px-4 font-bold uppercase tracking-wide transition-all duration-200 shadow-lg hover:from-emerald-600 hover:to-teal-600"
                style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}
              >
                Return to Homepage
              </a>
              <button
                onClick={() => {
                  // Sign out and redirect to login
                  import('../contexts/AuthContext').then(({ useAuth }) => {
                    const { logout } = useAuth();
                    logout();
                    window.location.href = '/admin/login';
                  });
                }}
                className="block w-full bg-gray-200 text-gray-700 py-3 px-4 font-bold uppercase tracking-wide transition-all duration-200 hover:bg-gray-300"
                style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated and has admin role - render the protected content
  return <>{children}</>;
};

export default AdminRoute;
