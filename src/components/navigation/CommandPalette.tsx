import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Command,
  Film,
  Users,
  TrendingUp,
  DollarSign,
  Star,
  Briefcase,
  Globe,
  LayoutDashboard,
  X,
  ArrowRight,
  Clock,
  Sparkles,
  AlertTriangle,
  Activity,
  Zap,
  Flame,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { tokens } from '@/lib/tokens';
import { scaleFadeTransition, transitions } from '@/lib/animations';
import { useUIStore } from '@/store/uiStore';

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string; size?: number | string }>;
  shortcut?: string;
  action: () => void;
  section: string;
  keywords?: string[];
}

interface CommandPaletteProps {
  /** Is palette open */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
}

/**
 * CommandPalette - Quick navigation and action center
 * 
 * Provides keyboard-driven access to:
 * - Hub navigation (Cmd+1, Cmd+2, etc.)
 * - Recent actions
 * - Project/talent search
 * - Common actions (new project, etc.)
 */
export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { setActiveHub, setActiveSubTab, openCreateProject } = useUIStore();

  // Build command list
  const commands: CommandItem[] = React.useMemo(() => {
    const list: CommandItem[] = [
      // Navigation
      {
        id: 'nav-hq',
        title: 'Studio HQ',
        subtitle: 'Overview, operations, strategy',
        icon: LayoutDashboard,
        shortcut: '⌘1',
        action: () => setActiveHub('hq'),
        section: 'Navigation',
      },
      {
        id: 'nav-production',
        title: 'Production',
        subtitle: 'Slate, development, distribution',
        icon: Film,
        shortcut: '⌘2',
        action: () => setActiveHub('production'),
        section: 'Navigation',
      },
      {
        id: 'nav-talent',
        title: 'Talent & Deals',
        subtitle: 'Roster, marketplace, agencies',
        icon: Users,
        shortcut: '⌘3',
        action: () => setActiveHub('talent'),
        section: 'Navigation',
      },
      {
        id: 'nav-intelligence',
        title: 'Intelligence',
        subtitle: 'Rivals, awards, market, financials',
        icon: Globe,
        shortcut: '⌘4',
        action: () => setActiveHub('intelligence'),
        section: 'Navigation',
      },
      // Actions
      {
        id: 'action-new-project',
        title: 'New Project',
        subtitle: 'Create a new film or TV project',
        icon: Sparkles,
        shortcut: '⌘N',
        action: () => openCreateProject(),
        section: 'Actions',
      },
      {
        id: 'action-week',
        title: 'Advance Week',
        subtitle: 'Progress to next production week',
        icon: Clock,
        action: () => {}, // Would trigger week advancement
        section: 'Actions',
      },
      // Crisis Management
      {
        id: 'crisis-dashboard',
        title: 'Crisis Dashboard',
        subtitle: 'View all active crises and issues',
        icon: AlertTriangle,
        shortcut: '⌘⇧C',
        action: () => {
          setActiveHub('hq');
          setActiveSubTab('operations');
        },
        section: 'Crisis Management',
        keywords: ['emergency', 'problems', 'issues', 'alerts'],
      },
      {
        id: 'greenlight-queue',
        title: 'Greenlight Queue',
        subtitle: 'Review projects awaiting approval',
        icon: Zap,
        action: () => {
          setActiveHub('production');
          setActiveSubTab('slate');
        },
        section: 'Crisis Management',
        keywords: ['approve', 'projects', 'slate'],
      },
      // Intelligence Views
      {
        id: 'market-trends',
        title: 'Market Trends',
        subtitle: 'View genre trends and market sentiment',
        icon: TrendingUp,
        action: () => {
          setActiveHub('intelligence');
          setActiveSubTab('market');
        },
        section: 'Intelligence',
        keywords: ['genres', 'trends', 'market', 'analysis'],
      },
      {
        id: 'studio-health',
        title: 'Studio Health',
        subtitle: 'Check overall studio performance metrics',
        icon: Activity,
        action: () => {
          setActiveHub('hq');
          setActiveSubTab('overview');
        },
        section: 'Intelligence',
        keywords: ['health', 'metrics', 'performance', 'dashboard'],
      },
      // Talent Views  
      {
        id: 'talent-morale',
        title: 'Talent Morale',
        subtitle: 'Check roster satisfaction levels',
        icon: Users,
        action: () => {
          setActiveHub('talent');
          setActiveSubTab('roster');
        },
        section: 'Talent',
        keywords: ['morale', 'happiness', 'satisfaction', 'roster'],
      },
      {
        id: 'deal-history',
        title: 'Deal History',
        subtitle: 'View negotiation history and offers',
        icon: Briefcase,
        action: () => {
          setActiveHub('talent');
          setActiveSubTab('negotiations');
        },
        section: 'Talent',
        keywords: ['offers', 'negotiations', 'deals', 'history'],
      },
      // Financial Views
      {
        id: 'budget-burn',
        title: 'Budget Burn Rate',
        subtitle: 'Monitor production spending vs planned',
        icon: Flame,
        action: () => {
          setActiveHub('production');
          setActiveSubTab('development');
        },
        section: 'Finance',
        keywords: ['budget', 'spending', 'overrun', 'costs'],
      },
      {
        id: 'cash-flow',
        title: 'Cash Flow',
        subtitle: 'View revenue and expense trends',
        icon: DollarSign,
        action: () => {
          setActiveHub('intelligence');
          setActiveSubTab('financials');
        },
        section: 'Finance',
        keywords: ['cash', 'revenue', 'expenses', 'financials'],
      },
    ];

    return list;
  }, [setActiveHub, setActiveSubTab, openCreateProject]);

  // Filter commands based on query
  const filteredCommands = React.useMemo(() => {
    if (!query) return commands;
    const lowerQuery = query.toLowerCase();
    return commands.filter(
      (cmd) =>
        cmd.title.toLowerCase().includes(lowerQuery) ||
        cmd.subtitle?.toLowerCase().includes(lowerQuery) ||
        cmd.section.toLowerCase().includes(lowerQuery) ||
        cmd.keywords?.some((k) => k.toLowerCase().includes(lowerQuery))
    );
  }, [commands, query]);

  // Group commands by section
  const groupedCommands = React.useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    filteredCommands.forEach((cmd) => {
      if (!groups[cmd.section]) groups[cmd.section] = [];
      groups[cmd.section].push(cmd);
    });
    return groups;
  }, [filteredCommands]);

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          Math.min(prev + 1, filteredCommands.length - 1)
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = filteredCommands[selectedIndex];
        if (selected) {
          selected.action();
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, filteredCommands, selectedIndex]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Get selected item from flat list
  const flatCommands = Object.values(groupedCommands).flat();
  const selectedItem = flatCommands[selectedIndex];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ ...transitions.spring }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-2xl z-50"
          >
            <div className="bg-card/95 backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl overflow-hidden">
              {/* Search header */}
              <div className="flex items-center gap-3 px-4 py-4 border-b border-white/5">
                <Search className="w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search commands, navigate, or run actions..."
                  className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground"
                  autoFocus
                />
                <kbd className="px-2 py-1 bg-muted rounded text-xs text-muted-foreground">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-[400px] overflow-y-auto py-2">
                {flatCommands.length === 0 ? (
                  <div className="px-4 py-8 text-center text-muted-foreground">
                    <p>No commands found</p>
                    <p className="text-xs mt-1">
                      Try a different search term
                    </p>
                  </div>
                ) : (
                  Object.entries(groupedCommands).map(([section, items]) => (
                    <div key={section}>
                      <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {section}
                      </div>
                      {items.map((item, idx) => {
                        const flatIdx = flatCommands.indexOf(item);
                        const isSelected = flatIdx === selectedIndex;
                        const Icon = item.icon;

                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              item.action();
                              onClose();
                            }}
                            onMouseEnter={() => setSelectedIndex(flatIdx)}
                            className={cn(
                              'w-full flex items-center gap-3 px-4 py-3 text-left',
                              'hover:bg-white/5',
                              isSelected && 'bg-white/10',
                              tokens.transition.fast
                            )}
                          >
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <Icon className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground">
                                {item.title}
                              </p>
                              {item.subtitle && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {item.subtitle}
                                </p>
                              )}
                            </div>
                            {item.shortcut && (
                              <kbd className="px-2 py-1 bg-muted rounded text-xs text-muted-foreground shrink-0">
                                {item.shortcut}
                              </kbd>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 bg-muted/30 border-t border-white/5 flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <ArrowRight className="w-3 h-3" /> to select
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">
                      ↵
                    </kbd>{' '}
                    to run
                  </span>
                </div>
                <span>{flatCommands.length} commands</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

/**
 * Hook to manage command palette state
 */
export const useCommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((prev) => !prev),
  };
};

export default CommandPalette;
