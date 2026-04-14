import React from 'react';
import { Minus, Square, X } from 'lucide-react';

// Check if running in Electron environment
const isElectron = typeof window !== 'undefined' && 'electronAPI' in window;

export function TitleBar() {
  if (!isElectron) {
    return null;
  }

  const handleMinimize = () => {
    if (window.electronAPI) {
      window.electronAPI.minimizeWindow();
    }
  };

  const handleMaximize = () => {
    if (window.electronAPI) {
      window.electronAPI.maximizeWindow();
    }
  };

  const handleClose = () => {
    if (window.electronAPI) {
      window.electronAPI.closeWindow();
    }
  };

  return (
    <div className="electron-title-bar fixed top-0 left-0 right-0 h-12 bg-[#0a0e1a] border-b border-white/10 flex items-center justify-between select-none z-50">
      {/* Left side - drag area */}
      <div className="flex-1 flex items-center px-4 electron-drag-region">
        <span className="text-white/80 text-sm font-medium">Studio Boss</span>
      </div>

      {/* Window controls - no-drag to make buttons clickable */}
      <div className="flex items-center electron-no-drag">
        <button
          onClick={handleMinimize}
          className="h-12 w-12 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          title="Minimize"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={handleMaximize}
          className="h-12 w-12 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          title="Maximize"
        >
          <Square className="w-4 h-4" />
        </button>
        <button
          onClick={handleClose}
          className="h-12 w-12 flex items-center justify-center text-white/60 hover:text-white hover:bg-red-500/80 transition-colors"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
