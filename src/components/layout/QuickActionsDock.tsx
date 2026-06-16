import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Clock,
  Users,
  Film,
  TrendingUp,
  Settings,
  ChevronUp,
  ChevronDown,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { tokens } from '@/lib/tokens';
import { useUIStore } from '@/store/uiStore';
import { useGameStore } from '@/store/gameStore';
import { transitions } from '@/lib/animations';

interface QuickAction {
  id: string;
  icon: React.ComponentType<{ className?: string; size?: number | string }>;
  label: string;
  shortcut?: string;
  action: () => void;
  variant?: 'default' | 'primary' | 'secondary';
}

interface QuickActionsDockProps {
  className?: string;
}

/**
 * QuickActionsDock - Persistent dock with contextual actions
 * 
 * Provides quick access to common actions based on current hub.
 * Collapsible, with keyboard shortcut support.
 */
export const QuickActionsDock: React.FC<QuickActionsDockProps> = ({
  className,
}) => {
  const { activeHub, openCreateProject, showQuickActions, setActiveHub } = useUIStore();
  const doAdvanceWeek = useGameStore(s => s.doAdvanceWeek);
  const [isExpanded, setIsExpanded] = React.useState(false);

  // Contextual actions based on active hub
  const actions: QuickAction[] = React.useMemo(() => {
    const baseActions: QuickAction[] = [
      {
        id: 'new-project',
        icon: Plus,
        label: 'INITIATE PROJECT',
        shortcut: '⌘N',
        action: () => openCreateProject(),
        variant: 'primary',
      },
      {
        id: 'advance-week',
        icon: Clock,
        label: 'ADVANCE CYCLE',
        action: () => { doAdvanceWeek(); },
        variant: 'secondary',
      },
    ];

    const hubSpecificActions: Record<string, QuickAction[]> = {
      hq: [
        {
          id: 'studio-marketing',
          icon: Settings,
          label: 'MARKETING INTEL',
          action: () => { setActiveHub('hq', 'marketing'); },
        },
      ],
      production: [
        {
          id: 'pipeline-view',
          icon: Film,
          label: 'PRODUCTION SLATE',
          action: () => { setActiveHub('production', 'slate'); },
        },
      ],
      talent: [
        {
          id: 'discover-talent',
          icon: Users,
          label: 'TALENT ACQUISITION',
          action: () => { setActiveHub('talent', 'marketplace'); },
        },
      ],
      intelligence: [
        {
          id: 'market-analysis',
          icon: TrendingUp,
          label: 'MARKET ANALYSIS',
          action: () => { setActiveHub('intelligence', 'market'); },
        },
      ],
    };

    return [...baseActions, ...(hubSpecificActions[activeHub] || [])];
  }, [activeHub, openCreateProject, doAdvanceWeek, setActiveHub]);

  if (!showQuickActions) return null;

  return (
    <div
      className={cn(
        'fixed bottom-12 right-12 z-40 flex flex-col items-end gap-4',
        className
      )}
    >
      {/* Expanded actions */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ ...transitions.spring }}
            className="flex flex-col gap-3 mb-4"
          >
            {actions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.id}
                  type="button"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.5 }}
                  onClick={() => {
                    action.action();
                    setIsExpanded(false);
                  }}
                  className={cn(
                    'flex items-center gap-6 px-8 py-4 rounded-none',
                    'bg-black/90 backdrop-blur-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]',
                    'hover:border-primary/40 hover:bg-black group relative overflow-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary focus-visible:outline-none focus-visible:transition-none',
                    tokens.transition.normal
                  )}
                >
                  <div
                    className={cn(
                      'w-10 h-10 rounded-none flex items-center justify-center transition-all duration-700',
                      action.variant === 'primary' && 'bg-primary text-black shadow-[0_0_20px_rgba(var(--primary),0.4)]',
                      action.variant === 'secondary' && 'bg-secondary text-black shadow-[0_0_20px_rgba(var(--secondary),0.4)]',
                      (!action.variant || action.variant === 'default') && 'bg-white/5 text-foreground/40 group-hover:text-primary group-hover:bg-primary/10'
                    )}
                  >
                    <Icon className="w-5 h-5" strokeWidth={3} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] italic whitespace-nowrap group-hover:translate-x-2 transition-transform duration-700">
                    {action.label}
                  </span>
                  {action.shortcut && (
                    <kbd className="ml-4 px-2 py-1 bg-white/5 border border-white/10 rounded-none text-[8px] font-black tracking-tighter text-muted-foreground/30 group-hover:text-primary transition-colors">
                      {action.shortcut}
                    </kbd>
                  )}
                  
                  {/* Hover accent */}
                  <div className="absolute bottom-0 left-0 h-0.5 bg-primary w-0 group-hover:w-full transition-all duration-700" />
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <motion.button
        type="button"
        aria-expanded={isExpanded}
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'flex items-center gap-4 px-10 py-5 rounded-none',
          'bg-primary text-black shadow-[0_0_50px_rgba(var(--primary),0.3)]',
          'hover:shadow-[0_0_80px_rgba(var(--primary),0.5)] transition-all duration-700',
          'active:scale-95 group relative overflow-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-black focus-visible:outline-none focus-visible:transition-none'
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Zap className={cn("w-5 h-5 transition-transform duration-700", isExpanded && "rotate-180")} strokeWidth={3} />
        <span className="text-xs font-black uppercase tracking-[0.4em] italic">
          {isExpanded ? 'CLOSE MODULE' : 'QUICK COMMAND'}
        </span>
        {isExpanded ? (
          <ChevronDown className="w-5 h-5" strokeWidth={3} />
        ) : (
          <ChevronUp className="w-5 h-5" strokeWidth={3} />
        )}
        
        {/* Glow effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </motion.button>
    </div>
  );
};

export default QuickActionsDock;
