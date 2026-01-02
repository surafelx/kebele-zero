import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string; // e.g., "games", "forum"
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, feature }) => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    receiveNewsletters: true,
    receiveNotifications: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, register } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        await register({
          username: formData.username,
          email: formData.email,
          password: formData.password
        });
      } else {
        await login(formData.email, formData.password);
      }
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      receiveNewsletters: true,
      receiveNotifications: true
    });
    setError('');
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    resetForm();
  };

  return (
    <div className="fixed inset-0 z-[10002] bg-black bg-opacity-40 retro-modal flex items-center justify-center p-4">
      <div className="retro-modal-content max-w-sm w-full max-h-[60vh] overflow-hidden retro-floating">
        {/* Header */}
        <div className="retro-titlebar relative">
          <div className="flex items-center space-x-3">
            <User className="w-4 h-4 retro-icon" />
            <span className="retro-title text-sm font-bold uppercase">Sign In</span>
          </div>
          <button
            onClick={onClose}
            className="retro-btn text-sm w-6 h-6 p-0 flex items-center justify-center retro-hover"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <div className="p-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            {isSignUp && (
              <div>
                <div className="relative">
                  <User className="absolute left-2 top-1/2 transform -translate-y-1/2 text-charcoal w-3 h-3 retro-icon" />
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="retro-input w-full pl-6 pr-3 py-2 text-xs"
                    placeholder="Username"
                  />
                </div>
              </div>
            )}

            <div>
              <div className="relative">
                <Mail className="absolute left-2 top-1/2 transform -translate-y-1/2 text-charcoal w-3 h-3 retro-icon" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="retro-input w-full pl-6 pr-3 py-2 text-xs"
                  placeholder="Email"
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <Lock className="absolute left-2 top-1/2 transform -translate-y-1/2 text-charcoal w-3 h-3 retro-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="retro-input w-full pl-6 pr-8 py-2 text-xs"
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-charcoal hover:text-mustard retro-hover"
                >
                  {showPassword ? <EyeOff className="w-3 h-3 retro-icon" /> : <Eye className="w-3 h-3 retro-icon" />}
                </button>
              </div>
            </div>

            {isSignUp && (
              <div>
                <div className="relative">
                  <Lock className="absolute left-2 top-1/2 transform -translate-y-1/2 text-charcoal w-3 h-3 retro-icon" />
                  <input
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="retro-input w-full pl-6 pr-3 py-2 text-xs"
                    placeholder="Confirm Password"
                  />
                </div>
              </div>
            )}

            {isSignUp && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="newsletters"
                    checked={formData.receiveNewsletters}
                    onChange={(e) => setFormData({ ...formData, receiveNewsletters: e.target.checked })}
                    className="w-3 h-3 text-sky-blue bg-paper border-2 border-charcoal rounded focus:ring-sky-blue"
                  />
                  <label htmlFor="newsletters" className="retro-text text-xs cursor-pointer">
                    Receive newsletters
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="notifications"
                    checked={formData.receiveNotifications}
                    onChange={(e) => setFormData({ ...formData, receiveNotifications: e.target.checked })}
                    className="w-3 h-3 text-sky-blue bg-paper border-2 border-charcoal rounded focus:ring-sky-blue"
                  />
                  <label htmlFor="notifications" className="retro-text text-xs cursor-pointer">
                    Receive notifications
                  </label>
                </div>
              </div>
            )}

            {error && (
              <div className="retro-card p-2 bg-red-50 border-2 border-red-400">
                <p className="retro-text text-red-700 text-xs font-bold">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="retro-btn w-full py-2 px-4 text-xs retro-hover disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="retro-spinner h-3 w-3"></div>
                  <span className="retro-title text-xs">{isSignUp ? 'Creating...' : 'Signing In...'}</span>
                </div>
              ) : (
                <span className="retro-title text-xs">{isSignUp ? 'SIGN UP' : 'SIGN IN'}</span>
              )}
            </button>
          </form>

          {/* Toggle between sign in/sign up */}
          <div className="mt-3 text-center">
            <button
              onClick={toggleMode}
              className="retro-btn-secondary px-3 py-1 text-xs retro-hover"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;