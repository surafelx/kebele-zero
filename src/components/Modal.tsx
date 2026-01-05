import React from 'react';

const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl'
  };

  return (
    <div className="fixed inset-0 z-[100000] bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 100000, position: 'fixed' }}>
      <div className={`retro-modal-content ${sizeClasses[size]} w-full max-h-[90vh] overflow-hidden retro-floating-enhanced`} style={{ zIndex: 100001, position: 'relative' }}>
        <div className="retro-titlebar retro-titlebar-mustard">
          <h3 className="retro-title text-base">{title}</h3>
          <button
            onClick={onClose}
            className="retro-btn text-xl px-3 py-1"
          >
            ×
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;