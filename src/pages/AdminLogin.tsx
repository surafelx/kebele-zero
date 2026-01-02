import React, { useState } from 'react';
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

  // Redirect if already authenticated
  React.useEffect(() => {
    if (user && !loading) {
      console.log('User already authenticated, redirecting to /admin');
      navigate('/admin');
    }
  }, [user, loading, navigate]);

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
    console.log('Form submitted, mode:', isLogin ? 'login' : 'signup');

    if (isLogin) {
      // Login
      console.log('Attempting login with:', credentials.email);
      try {
        const result = await login(credentials.email, credentials.password);
        console.log('Login result:', result);
        console.log('Login successful, navigating to /admin');
        navigate('/admin');
      } catch (error: any) {
        console.error('Login error:', error);
        setError(error.message || 'Login failed. Please check your credentials.');
      }
    } else {
      // Signup
      if (credentials.password !== credentials.confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      console.log('Attempting signup with:', credentials.email);
      try {
        const result = await register({
          username: credentials.email.split('@')[0],
          email: credentials.email,
          password: credentials.password,
          role: 'admin'
        });
        console.log('Signup result:', result);
        alert('Admin account created successfully! Please check your email to confirm, then sign in.');
        setIsLogin(true);
        setCredentials({ email: '', password: '', confirmPassword: '' });
      } catch (error: any) {
        console.error('Signup error:', error);
        setError(error.message || 'Signup failed. Please try again.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <h2 className="mt-8 text-3xl font-extrabold text-gray-900 uppercase tracking-tight">
            {isLogin ? 'Admin Access' : 'Create Admin Account'}
          </h2>
          <p className="mt-3 text-base text-gray-600 uppercase tracking-wide">
            {isLogin
              ? 'Sign in to access the Kebele Zero admin dashboard'
              : 'Create an admin account to manage content'
            }
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="bg-white py-8 px-8 shadow-2xl rounded-2xl space-y-6 border border-gray-100" style={{ zIndex: 10000 }}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wide" style={{ zIndex: 10001 }}>
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
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-base shadow-sm"
                placeholder="admin@kebele.com"
                style={{ zIndex: 10001 }}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wide" style={{ zIndex: 10001 }}>
                Password
              </label>
              <div className="relative" style={{ zIndex: 10001 }}>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  required
                  value={credentials.password}
                  onChange={handleInputChange}
                  className="appearance-none relative block w-full px-4 py-3 pr-12 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-base shadow-sm"
                  placeholder={isLogin ? 'Enter your password' : 'Create a password'}
                  style={{ zIndex: 10001 }}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-gray-50 rounded-r-xl transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ zIndex: 10002 }}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wide" style={{ zIndex: 10001 }}>
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
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-base shadow-sm"
                  placeholder="Confirm your password"
                  style={{ zIndex: 10001 }}
                />
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-4 px-6 border border-transparent text-base font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-xl hover:shadow-2xl"
                style={{ zIndex: 10001 }}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    {isLogin ? 'Signing in...' : 'Creating account...'}
                  </div>
                ) : (
                  <div className="flex items-center">
                    <LogIn className="w-5 h-5 mr-3" />
                    {isLogin ? 'Sign in to Admin Dashboard' : 'Create Admin Account'}
                  </div>
                )}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setCredentials({ email: '', password: '', confirmPassword: '' });
                }}
                className="text-sm text-gray-600 hover:text-blue-600 uppercase tracking-wide font-medium transition-colors"
                style={{ zIndex: 10001 }}
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-flex items-center text-sm text-gray-600 hover:text-blue-600 uppercase tracking-wide font-medium transition-colors"
              style={{ zIndex: 10001, position: 'relative' }}
            >
              <span className="mr-2">←</span>
              Back to Kebele Zero
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;