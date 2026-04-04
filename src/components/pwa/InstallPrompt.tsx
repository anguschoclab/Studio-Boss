import React, { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw, X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Handles two banners:
 * 1. "Install" — shown when the browser fires beforeinstallprompt (Chrome/Edge on Mac)
 * 2. "Update ready" — shown when a new service worker is waiting
 */

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem('pwa-install-dismissed') === '1'; } catch { return false; }
  });

  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      if (r) console.log('[PWA] Service worker registered:', r.scope);
    },
    onRegisterError(e) {
      console.warn('[PWA] Service worker registration failed:', e);
    },
  });

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    if (outcome === 'accepted') setInstallEvent(null);
  };

  const handleDismiss = () => {
    setDismissed(true);
    try { localStorage.setItem('pwa-install-dismissed', '1'); } catch {}
    setInstallEvent(null);
  };

  // Update banner takes priority
  if (needRefresh) {
    return (
      <div className={cn(
        'fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999]',
        'flex items-center gap-3 px-5 py-3 rounded-xl',
        'bg-indigo-950/95 border border-indigo-500/40 backdrop-blur-md shadow-2xl',
        'animate-in slide-in-from-bottom-4 duration-500'
      )}>
        <RefreshCw className="h-4 w-4 text-indigo-400 shrink-0" />
        <span className="text-xs font-bold text-indigo-100 uppercase tracking-wider">
          New version available
        </span>
        <Button
          size="sm"
          className="h-7 text-[10px] font-black uppercase tracking-widest bg-indigo-600 hover:bg-indigo-500 border-0"
          onClick={() => updateServiceWorker(true)}
        >
          Update
        </Button>
      </div>
    );
  }

  // Install prompt (only shown once, dismissable)
  if (installEvent && !dismissed) {
    return (
      <div className={cn(
        'fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999]',
        'flex items-center gap-3 px-5 py-3 rounded-xl',
        'bg-slate-900/95 border border-white/10 backdrop-blur-md shadow-2xl',
        'animate-in slide-in-from-bottom-4 duration-500'
      )}>
        <Download className="h-4 w-4 text-indigo-400 shrink-0" />
        <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
          Install Studio Boss for offline play
        </span>
        <Button
          size="sm"
          className="h-7 text-[10px] font-black uppercase tracking-widest bg-indigo-600 hover:bg-indigo-500 border-0"
          onClick={handleInstall}
        >
          Install
        </Button>
        <button
          className="text-slate-500 hover:text-slate-300 transition-colors"
          onClick={handleDismiss}
          aria-label="Dismiss"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return null;
}
