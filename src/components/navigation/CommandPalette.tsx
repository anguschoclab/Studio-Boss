/* eslint-disable react-refresh/only-export-components */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Film,
  Users,
  TrendingUp,
  DollarSign,
  Briefcase,
  Globe,
  LayoutDashboard,
  ArrowRight,
  Clock,
  Sparkles,
  AlertTriangle,
  Activity,
  Zap,
  Flame,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { transitions } from '@/lib/animations';
import { useUIStore } from '@/store/uiStore';
import { useGameStore } from '@/store/gameStore';

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
 * - Full Design Bible v1.0 Compliance
 */
const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { openCreateProject, setActiveHub, setActiveSubTab } = useUIStore();
  const doAdvanceWeek = useGameStore((s) => s.doAdvanceWeek);

  // Build command list
  const commands: CommandItem[] = React.useMemo(() => {
    const list: CommandItem[] = [
      // Navigation
      {
        id: 'nav-hq',
        title: 'STUDIO HQ',
        subtitle: 'OVERVIEW_OPERATIONS_STRATEGY',
        icon: LayoutDashboard,
        shortcut: '⌘1',
        action: () => setActiveHub('hq'),
        section: 'NAVIGATION_HUB',
      },
      {
        id: 'nav-production',
        title: 'PRODUCTION_CONTROL',
        subtitle: 'SLATE_DEVELOPMENT_DISTRIBUTION',
        icon: Film,
        shortcut: '⌘2',
        action: () => setActiveHub('production'),
        section: 'NAVIGATION_HUB',
      },
      {
        id: 'nav-talent',
        title: 'TALENT_&_DEALS',
        subtitle: 'ROSTER_MARKETPLACE_AGENCIES',
        icon: Users,
        shortcut: '⌘3',
        action: () => setActiveHub('talent'),
        section: 'NAVIGATION_HUB',
      },
      {
        id: 'nav-intelligence',
        title: 'STRATEGIC_INTELLIGENCE',
        subtitle: 'RIVALS_AWARDS_MARKET_FINANCIALS',
        icon: Globe,
        shortcut: '⌘4',
        action: () => setActiveHub('intelligence'),
        section: 'NAVIGATION_HUB',
      },
      // Actions
      {
        id: 'action-new-project',
        title: 'INITIALIZE_NEW_PROJECT',
        subtitle: 'CREATE_A_NEW_FILM_OR_TV_PROJECT',
        icon: Sparkles,
        shortcut: '⌘N',
        action: () => openCreateProject(),
        section: 'TACTICAL_ACTIONS',
      },
      {
        id: 'action-week',
        title: 'ADVANCE_WEEKLY_CYCLE',
        subtitle: 'PROGRESS_TO_NEXT_PRODUCTION_WEEK',
        icon: Clock,
        action: () => { doAdvanceWeek(); },
        section: 'TACTICAL_ACTIONS',
      },
      // Crisis Management
      {
        id: 'crisis-dashboard',
        title: 'CRISIS_COMMAND_DASHBOARD',
        subtitle: 'VIEW_ALL_ACTIVE_CRISES_AND_ISSUES',
        icon: AlertTriangle,
        shortcut: '⌘⇧C',
        action: () => {
          setActiveHub('hq');
          setActiveSubTab('operations');
        },
        section: 'CRISIS_MANAGEMENT',
        keywords: ['emergency', 'problems', 'issues', 'alerts'],
      },
      {
        id: 'greenlight-queue',
        title: 'GREENLIGHT_QUEUE_AUDIT',
        subtitle: 'REVIEW_PROJECTS_AWAITING_APPROVAL',
        icon: Zap,
        action: () => {
          setActiveHub('production');
          setActiveSubTab('slate');
        },
        section: 'CRISIS_MANAGEMENT',
        keywords: ['approve', 'projects', 'slate'],
      },
      // Intelligence Views
      {
        id: 'market-trends',
        title: 'MARKET_TREND_ANALYSIS',
        subtitle: 'VIEW_GENRE_TRENDS_AND_MARKET_SENTIMENT',
        icon: TrendingUp,
        action: () => {
          setActiveHub('intelligence');
          setActiveSubTab('market');
        },
        section: 'INTELLIGENCE_REPORTS',
        keywords: ['genres', 'trends', 'market', 'analysis'],
      },
      {
        id: 'studio-health',
        title: 'STUDIO_HEALTH_AUDIT',
        subtitle: 'CHECK_OVERALL_STUDIO_PERFORMANCE_METRICS',
        icon: Activity,
        action: () => {
          setActiveHub('hq');
          setActiveSubTab('overview');
        },
        section: 'INTELLIGENCE_REPORTS',
        keywords: ['health', 'metrics', 'performance', 'dashboard'],
      },
      // Talent Views  
      {
        id: 'talent-morale',
        title: 'TALENT_MORALE_MONITOR',
        subtitle: 'CHECK_ROSTER_SATISFACTION_LEVELS',
        icon: Users,
        action: () => {
          setActiveHub('talent');
          setActiveSubTab('roster');
        },
        section: 'TALENT_MANAGEMENT',
        keywords: ['morale', 'happiness', 'satisfaction', 'roster'],
      },
      {
        id: 'deal-history',
        title: 'DEAL_HISTORY_LOG',
        subtitle: 'VIEW_NEGOTIATION_HISTORY_AND_OFFERS',
        icon: Briefcase,
        action: () => {
          setActiveHub('talent');
          setActiveSubTab('negotiations');
        },
        section: 'TALENT_MANAGEMENT',
        keywords: ['offers', 'negotiations', 'deals', 'history'],
      },
      // Financial Views
      {
        id: 'budget-burn',
        title: 'BUDGET_BURN_RATE_AUDIT',
        subtitle: 'MONITOR_PRODUCTION_SPENDING_VS_PLANNED',
        icon: Flame,
        action: () => {
          setActiveHub('production');
          setActiveSubTab('development');
        },
        section: 'FINANCIAL_INTELLIGENCE',
        keywords: ['budget', 'spending', 'overrun', 'costs'],
      },
      {
        id: 'cash-flow',
        title: 'CASH_FLOW_ANALYSIS',
        subtitle: 'VIEW_REVENUE_AND_EXPENSE_TRENDS',
        icon: DollarSign,
        action: () => {
          setActiveHub('intelligence');
          setActiveSubTab('financials');
        },
        section: 'FINANCIAL_INTELLIGENCE',
        keywords: ['cash', 'revenue', 'expenses', 'financials'],
      },
    ];

    return list;
  }, [setActiveHub, setActiveSubTab, openCreateProject, doAdvanceWeek]);

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
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50"
            onClick={onClose}
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -20 }}
            transition={{ ...transitions.spring, duration: 0.8 }}
            className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 px-6"
          >
            <div className="bg-black/90 backdrop-blur-3xl border border-white/10 rounded-none shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden">
              {/* Search header */}
              <div className="flex items-center gap-6 px-8 py-8 border-b border-white/5 bg-white/[0.02]">
                <Search className="w-5 h-5 text-primary" strokeWidth={3} />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="SEARCH_COMMANDS_&_TAC_INTEL..."
                  className="flex-1 bg-transparent border-none outline-none text-sm font-black uppercase tracking-[0.2em] placeholder:text-muted-foreground/30 italic"
                  autoFocus
                />
                <kbd className="px-3 py-1 bg-white/5 border border-white/10 rounded-none text-[10px] font-black text-muted-foreground/40 italic">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-[500px] overflow-y-auto py-4 custom-scrollbar">
                {flatCommands.length === 0 ? (
                  <div className="px-8 py-16 text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic">NULL_RESULT_DETECTED</p>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/20 mt-2 italic">
                      SYSTEM_SCAN_FAILED: TRY_ALTERNATIVE_QUERY
                    </p>
                  </div>
                ) : (
                  Object.entries(groupedCommands).map(([section, items]) => (
                    <div key={section} className="mb-6 last:mb-2">
                      <div className="px-8 py-2 text-[9px] font-black text-primary/40 uppercase tracking-[0.4em] italic mb-2">
                        {section}
                      </div>
                      {items.map((item) => {
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
                              'w-full flex items-center gap-6 px-8 py-4 text-left border-l-2 transition-all duration-700',
                              isSelected 
                                ? 'bg-primary/5 border-primary text-primary translate-x-1 shadow-2xl' 
                                : 'bg-transparent border-transparent text-muted-foreground/40 hover:bg-white/[0.02] hover:text-foreground hover:translate-x-1',
                            )}
                          >
                            <div className={cn(
                              "w-10 h-10 rounded-none flex items-center justify-center shrink-0 transition-all duration-700",
                              isSelected ? "bg-primary text-black" : "bg-white/5 text-muted-foreground/40"
                            )}>
                              <Icon className="w-5 h-5" strokeWidth={isSelected ? 3 : 2} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={cn(
                                "text-sm font-black uppercase italic tracking-tight leading-none mb-1",
                                isSelected ? "text-foreground" : "text-foreground/60"
                              )}>
                                {item.title}
                              </p>
                              {item.subtitle && (
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40 truncate italic">
                                  {item.subtitle}
                                </p>
                              )}
                            </div>
                            {item.shortcut && (
                              <kbd className={cn(
                                "px-3 py-1 rounded-none text-[10px] font-black shrink-0 italic border transition-all duration-700",
                                isSelected ? "bg-primary/20 text-primary border-primary/20" : "bg-white/5 text-muted-foreground/30 border-white/5"
                              )}>
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
              <div className="px-8 py-4 bg-white/[0.02] border-t border-white/5 flex items-center justify-between text-[8px] font-black text-muted-foreground/30 uppercase tracking-[0.3em] italic">
                <div className="flex items-center gap-8">
                  <span className="flex items-center gap-2">
                    <ArrowRight className="w-3 h-3 text-primary" strokeWidth={3} /> SELECT_NODE
                  </span>
                  <span className="flex items-center gap-2">
                    <kbd className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-none text-[8px]">
                      ENTER
                    </kbd>
                    INITIALIZE_LINK
                  </span>
                </div>
                <span>{flatCommands.length}_TAC_NODES_FOUND</span>
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
const useCommandPalette = () => {
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

export { useCommandPalette, CommandPalette };
