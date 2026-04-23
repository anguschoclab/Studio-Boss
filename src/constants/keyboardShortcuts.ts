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
