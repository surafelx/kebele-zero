import React from 'react';

interface ModalLoaderProps {
  label?: string;
  fullHeight?: boolean;
}

/**
 * Shared loading state for all homepage modal pages.
 * Consistent emerald retro spinner — use this everywhere instead of inline spinners.
 */
const ModalLoader: React.FC<ModalLoaderProps> = ({
  label = 'Loading...',
  fullHeight = false,
}) => (
  <div
    className={`flex flex-col items-center justify-center ${fullHeight ? 'min-h-[60vh]' : 'py-20'}`}
  >
    {/* Retro double-ring spinner */}
    <div className="relative w-14 h-14 mb-5">
      <div className="absolute inset-0 border-4 border-emerald-100 rounded-full" />
      <div className="absolute inset-0 border-4 border-transparent border-t-emerald-500 rounded-full animate-spin" />
    </div>

    {/* Label */}
    <p
      className="text-xs font-black uppercase tracking-widest text-gray-500"
      style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}
    >
      {label}
    </p>
  </div>
);

export default ModalLoader;
