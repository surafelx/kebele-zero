import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const AdminLogin: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login, register, loading, user } = useAuth();

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
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !loading) {
      navigate('/admin');
    }
  }, [user, loading, navigate]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="fixed inset-0 z-[9999] retro-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-bold uppercase tracking-wide">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If user is already authenticated (but loading is complete), redirect
  if (user) {
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      try {
        await login(credentials.email, credentials.password);
        navigate('/admin');
      } catch (error: any) {
        setError(error.message || 'Login failed. Please check your credentials.');
      }
    } else {
      if (credentials.password !== credentials.confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      try {
        await register({
          username: credentials.email.split('@')[0],
          email: credentials.email,
          password: credentials.password,
          role: 'admin'
        });
        alert('Admin account created successfully! Please check your email to confirm, then sign in.');
        setIsLogin(true);
        setCredentials({ email: '', password: '', confirmPassword: '' });
      } catch (error: any) {
        setError(error.message || 'Signup failed. Please try again.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] retro-bg flex items-center justify-center py-8 px-4">
      <div className="max-w-md w-full">
        {/* Retro Window Card */}
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          {/* Retro Title Bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b-4 border-black bg-gradient-to-r from-blue-600 to-purple-600">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-wide drop-shadow-lg" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
                  {isLogin ? 'Admin Access' : 'Create Admin'}
                </h3>
                <p className="text-xs text-blue-100 font-bold uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
                  {isLogin
                    ? 'Sign in to access the admin dashboard'
                    : 'Create an admin account to manage content'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6 bg-white">
            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="p-4 bg-red-50 border-2 border-red-200">
                  <p className="text-sm font-bold text-red-600" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-bold text-gray-800 uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
                  Admin Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={credentials.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 focus:border-blue-500 focus:outline-none transition-all font-medium placeholder-gray-400"
                  style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}
                  placeholder="admin@kebele.com"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-bold text-gray-800 uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                    required
                    value={credentials.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 pr-12 bg-gray-50 border-2 border-gray-300 focus:border-blue-500 focus:outline-none transition-all font-medium placeholder-gray-400"
                    style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}
                    placeholder={isLogin ? 'Enter your password' : 'Create a password'}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="block text-sm font-bold text-gray-800 uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={credentials.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 focus:border-blue-500 focus:outline-none transition-all font-medium placeholder-gray-400"
                    style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}
                    placeholder="Confirm your password"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-4 font-bold uppercase tracking-wide transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg active:translate-y-0.5"
                style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    {isLogin ? 'Signing in...' : 'Creating account...'}
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <LogIn className="w-5 h-5 mr-3" />
                    {isLogin ? 'Sign In to Dashboard' : 'Create Admin Account'}
                  </div>
                )}
              </button>

              {/* Toggle Login/Signup */}
              <div className="text-center pt-4 border-t-2 border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                    setCredentials({ email: '', password: '', confirmPassword: '' });
                  }}
                  className="text-sm font-bold text-blue-600 hover:text-blue-700 uppercase tracking-wide transition-colors"
                  style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}
                >
                  {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                </button>
              </div>
            </form>

            {/* Back Button */}
            <div className="text-center mt-6">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="inline-flex items-center text-sm font-bold text-gray-600 hover:text-blue-600 uppercase tracking-wide transition-colors"
                style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}
              >
                <span className="mr-2">←</span>
                Back to Kebele Zero
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
