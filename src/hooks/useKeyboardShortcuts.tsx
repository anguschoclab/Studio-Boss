import React, { useEffect, useCallback } from 'react';
import { useUIStore } from '@/store/uiStore';

/**
 * Keyboard shortcut definitions
 */
export const KEYBOARD_SHORTCUTS = {
  // Navigation
  'cmd+1': { action: 'hub', target: 'hq', description: 'Go to Studio HQ' },
  'cmd+2': { action: 'hub', target: 'production', description: 'Go to Production' },
  'cmd+3': { action: 'hub', target: 'talent', description: 'Go to Talent & Deals' },
  'cmd+4': { action: 'hub', target: 'intelligence', description: 'Go to Intelligence' },
  
  // Command palette
  'cmd+k': { action: 'commandPalette', description: 'Open command palette' },
  
  // Actions
  'cmd+n': { action: 'createProject', description: 'Create new project' },
  
  // Quick actions dock
  'cmd+shift+a': { action: 'toggleQuickActions', description: 'Toggle quick actions dock' },
  
  // Escape
  'escape': { action: 'escape', description: 'Close modals/panels' },
} as const;

type ShortcutKey = keyof typeof KEYBOARD_SHORTCUTS;

/**
 * Hook to enable keyboard shortcuts throughout the app
 * 
 * Provides:
 * - Hub navigation (Cmd+1, Cmd+2, etc.)
 * - Command palette (Cmd+K)
 * - Quick actions (Cmd+Shift+A)
 * - Create project (Cmd+N)
 */
export function useKeyboardShortcuts() {
  const { 
    setActiveHub, 
    openCreateProject, 
    toggleQuickActions,
    activeModal,
    resolveCurrentModal 
  } = useUIStore();

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Build key combination string
    const keys: string[] = [];
    if (event.metaKey || event.ctrlKey) keys.push('cmd');
    if (event.shiftKey) keys.push('shift');
    if (event.altKey) keys.push('alt');
    keys.push(event.key.toLowerCase());
    
    const shortcut = keys.join('+') as ShortcutKey;
    const config = KEYBOARD_SHORTCUTS[shortcut];
    
    if (!config) return;
    
    // Prevent default for all defined shortcuts
    event.preventDefault();
    
    // Execute action
    switch (config.action) {
      case 'hub':
        if (config.target) {
          setActiveHub(config.target as any);
        }
        break;
        
      case 'commandPalette':
        // Command palette is handled by its own hook
        break;
        
      case 'createProject':
        openCreateProject();
        break;
        
      case 'toggleQuickActions':
        toggleQuickActions();
        break;
        
      case 'escape':
        if (activeModal) {
          resolveCurrentModal();
        }
        break;
    }
  }, [setActiveHub, openCreateProject, toggleQuickActions, activeModal, resolveCurrentModal]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

/**
 * Component wrapper that enables keyboard shortcuts
 */
export const KeyboardShortcuts: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useKeyboardShortcuts();
  return <>{children}</>;
};

export default useKeyboardShortcuts;
