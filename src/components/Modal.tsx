import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  icon?: React.ReactNode;
  titleColor?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md', icon, titleColor = 'from-emerald-500 to-teal-500' }) => {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-lg',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl'
  };

  return (
    <div 
      className="fixed inset-0 z-[100000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Retro Window Card */}
      <div 
        className={`${sizeClasses[size]} w-full bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden max-h-[90vh] flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Retro Title Bar */}
        <div className={`flex items-center justify-between px-4 py-3 border-b-4 border-black bg-gradient-to-r ${titleColor}`}>
          <div className="flex items-center space-x-3">
            {icon && (
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-lg">
                {icon}
              </div>
            )}
            <h3 className="text-lg font-black text-white uppercase tracking-wide drop-shadow-lg" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white border-2 border-black rounded-lg shadow-lg hover:bg-red-500 hover:text-white hover:border-red-500 transition-all active:translate-y-0.5"
          >
            <X className="w-4 h-4 text-black" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto max-h-[calc(90vh-80px)]">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
