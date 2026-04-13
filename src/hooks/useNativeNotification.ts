import { useCallback } from 'react';

// Check if running in Electron environment
const isElectron = typeof window !== 'undefined' && 'electronAPI' in window;

export function useNativeNotification() {
  const showNotification = useCallback(async (options: {
    title: string;
    body: string;
    icon?: string;
  }) => {
    if (isElectron && window.electronAPI) {
      try {
        await window.electronAPI.showNotification(options);
      } catch (e) {
        console.error('Failed to show native notification:', e);
      }
    } else {
      // Fallback to browser notification API for web
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(options.title, {
          body: options.body,
          icon: options.icon,
        });
      }
    }
  }, []);

  return { showNotification, isSupported: isElectron };
}
