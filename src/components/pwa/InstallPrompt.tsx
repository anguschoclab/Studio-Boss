import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw, X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Handles two banners:
 * 1. "Install" — shown when the browser fires beforeinstallprompt (Chrome/Edge on Mac)
 * 2. "Update ready" — shown when a new service worker is waiting
 * 
 * NOTE: PWA functionality is disabled for Electron desktop app
 */

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Check if running in Electron environment
const isElectron = typeof window !== 'undefined' && 'electronAPI' in window;

// Stub PWA functionality since PWA plugin is removed for Electron
const needRefresh = false;
const updateServiceWorker = () => {};

// Try to load PWA module if available (for web version)
try {
  // @ts-ignore - Virtual module provided by vite-plugin-pwa (may not exist)
  require('virtual:pwa-register/react');
} catch {
  // PWA module not available (Electron or plugin removed)
  console.log('PWA module not available (expected for Electron)');
}

export function InstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  // Load dismissed state from electron-store or localStorage
  useEffect(() => {
    const loadDismissedState = async () => {
      if (isElectron && window.electronAPI) {
        try {
          const dismissed = await window.electronAPI.store.get('pwa-install-dismissed');
          setDismissed(dismissed === '1');
        } catch (e) {
          console.error('Failed to load dismissed state from electron-store:', e);
        }
      } else {
        try {
          setDismissed(localStorage.getItem('pwa-install-dismissed') === '1');
        } catch (e) {
          console.error('Failed to load dismissed state from localStorage:', e);
        }
      }
    };
    loadDismissedState();
  }, []);

  useEffect(() => {
    // Only add beforeinstallprompt listener in web mode
    if (!isElectron) {
      const handler = (e: Event) => {
        e.preventDefault();
        setInstallEvent(e as BeforeInstallPromptEvent);
      };
      window.addEventListener('beforeinstallprompt', handler);
      return () => window.removeEventListener('beforeinstallprompt', handler);
    }
  }, []);

  const handleInstall = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    if (outcome === 'accepted') setInstallEvent(null);
  };

  const handleDismiss = async () => {
    setDismissed(true);
    if (isElectron && window.electronAPI) {
      try {
        await window.electronAPI.store.set('pwa-install-dismissed', '1');
      } catch (e) {
        console.error('Failed to save dismissed state to electron-store:', e);
      }
    } else {
      try {
        localStorage.setItem('pwa-install-dismissed', '1');
      } catch (e) {
        console.error('Failed to save dismissed state to localStorage:', e);
      }
    }
    setInstallEvent(null);
  };

  // PWA features are disabled in Electron
  if (isElectron) {
    return null;
  }

  // Update banner (only in web mode with PWA)
  if (needRefresh && !isElectron) {
    return (
      <div className={cn(
        'fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999]',
        'flex items-center gap-3 px-5 py-3 rounded-xl',
        'bg-indigo-950/95 border border-indigo-500/40 backdrop-blur-md shadow-2xl',
        'text-white'
      )}>
        <RefreshCw className="w-5 h-5 text-indigo-400" />
        <span className="text-sm font-medium">Update available</span>
        <Button
          size="sm"
          variant="outline"
          className="bg-white/10 border-white/20 hover:bg-white/20 text-white"
          onClick={() => updateServiceWorker()}
        >
          Update
        </Button>
        <button
          onClick={handleDismiss}
          className="p-1 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Install banner (only in browsers, not Electron)
  if (!isElectron && installEvent && !dismissed) {
    return (
      <div className={cn(
        'fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999]',
        'flex items-center gap-3 px-5 py-3 rounded-xl',
        'bg-indigo-950/95 border border-indigo-500/40 backdrop-blur-md shadow-2xl',
        'text-white'
      )}>
        <Download className="w-5 h-5 text-indigo-400" />
        <span className="text-sm font-medium">Install Studio Boss</span>
        <Button
          size="sm"
          variant="outline"
          className="bg-white/10 border-white/20 hover:bg-white/20 text-white"
          onClick={handleInstall}
        >
          Install
        </Button>
        <button
          onClick={handleDismiss}
          className="p-1 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return null;
}
