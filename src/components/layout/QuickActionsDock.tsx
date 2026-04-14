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
  const { activeHub, openCreateProject, showQuickActions } = useUIStore();
  const [isExpanded, setIsExpanded] = React.useState(false);

  // Contextual actions based on active hub
  const actions: QuickAction[] = React.useMemo(() => {
    const baseActions: QuickAction[] = [
      {
        id: 'new-project',
        icon: Plus,
        label: 'New Project',
        shortcut: '⌘N',
        action: () => openCreateProject(),
        variant: 'primary',
      },
      {
        id: 'advance-week',
        icon: Clock,
        label: 'Advance Week',
        action: () => {}, // Would trigger week advancement
      },
    ];

    const hubSpecificActions: Record<string, QuickAction[]> = {
      hq: [
        {
          id: 'studio-settings',
          icon: Settings,
          label: 'Studio Settings',
          action: () => {},
        },
      ],
      production: [
        {
          id: 'pipeline-view',
          icon: Film,
          label: 'Pipeline Overview',
          action: () => {},
        },
      ],
      talent: [
        {
          id: 'discover-talent',
          icon: Users,
          label: 'Discover Talent',
          action: () => {},
        },
      ],
      intelligence: [
        {
          id: 'market-analysis',
          icon: TrendingUp,
          label: 'Market Analysis',
          action: () => {},
        },
      ],
    };

    return [...baseActions, ...(hubSpecificActions[activeHub] || [])];
  }, [activeHub, openCreateProject]);

  if (!showQuickActions) return null;

  return (
    <div
      className={cn(
        'fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2',
        className
      )}
    >
      {/* Expanded actions */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ ...transitions.spring }}
            className="flex flex-col gap-2 mb-2"
          >
            {actions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => {
                    action.action();
                    setIsExpanded(false);
                  }}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl',
                    'bg-card/90 backdrop-blur-xl border border-white/10 shadow-lg',
                    'hover:border-white/20 hover:bg-card',
                    'group relative',
                    tokens.transition.normal
                  )}
                >
                  <div
                    className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center',
                      action.variant === 'primary' && 'bg-primary/20 text-primary',
                      action.variant === 'secondary' && 'bg-secondary/20 text-secondary',
                      (!action.variant || action.variant === 'default') && 'bg-white/10'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium whitespace-nowrap">
                    {action.label}
                  </span>
                  {action.shortcut && (
                    <kbd className="ml-2 px-1.5 py-0.5 bg-muted rounded text-[10px] text-muted-foreground">
                      {action.shortcut}
                    </kbd>
                  )}
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'flex items-center gap-2 px-4 py-3 rounded-full',
          'bg-primary text-primary-foreground shadow-lg',
          'hover:shadow-xl hover:shadow-primary/20',
          'active:scale-95',
          tokens.transition.normal
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Zap className="w-4 h-4" />
        <span className="text-sm font-semibold">
          {isExpanded ? 'Close' : 'Quick Actions'}
        </span>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronUp className="w-4 h-4" />
        )}
      </motion.button>
    </div>
  );
};

export default QuickActionsDock;
