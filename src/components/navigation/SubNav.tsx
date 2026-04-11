import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export interface SubNavTab {
  id: string;
  label: string;
  badge?: number | null;
  icon?: React.ReactNode;
  description?: string;
}

interface SubNavProps {
  tabs: SubNavTab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
  variant?: 'default' | 'pills' | 'underline';
}

export const SubNav: React.FC<SubNavProps> = ({ 
  tabs, 
  activeTab, 
  onChange,
  className,
  variant = 'default'
}) => {
  const variantStyles = {
    default: 'bg-muted/30 border border-border/40 p-1 rounded-lg',
    pills: 'bg-transparent gap-1',
    underline: 'bg-transparent border-b border-border/40 pb-0 gap-6'
  };

  const tabStyles = {
    default: (isActive: boolean) => cn(
      'px-4 py-2 text-[11px] font-bold uppercase tracking-wider rounded-md transition-all duration-200',
      isActive 
        ? 'bg-primary/20 text-primary shadow-sm' 
        : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
    ),
    pills: (isActive: boolean) => cn(
      'px-4 py-2 text-[11px] font-bold uppercase tracking-wider rounded-full transition-all duration-200 border',
      isActive 
        ? 'bg-primary text-primary-foreground border-primary shadow-[0_0_15px_hsl(var(--primary)/0.4)]' 
        : 'bg-muted/50 text-muted-foreground border-transparent hover:border-secondary/30 hover:text-foreground'
    ),
    underline: (isActive: boolean) => cn(
      'px-1 py-2 text-[11px] font-bold uppercase tracking-wider transition-all duration-200 border-b-2 -mb-[1px]',
      isActive 
        ? 'text-primary border-primary' 
        : 'text-muted-foreground border-transparent hover:text-foreground hover:border-border/50'
    )
  };

  return (
    <div className={cn('flex items-center w-fit', variantStyles[variant], className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const hasBadge = tab.badge && tab.badge > 0;
        
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative flex items-center gap-2 whitespace-nowrap',
              tabStyles[variant](isActive)
            )}
            title={tab.description}
          >
            {tab.icon && <span className="w-3.5 h-3.5">{tab.icon}</span>}
            <span>{tab.label}</span>
            {hasBadge && (
              <Badge 
                variant="secondary" 
                className={cn(
                  'ml-1 h-4 min-w-4 px-1 text-[9px] font-black',
                  isActive ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-destructive/20 text-destructive'
                )}
              >
                {tab.badge}
              </Badge>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default SubNav;
