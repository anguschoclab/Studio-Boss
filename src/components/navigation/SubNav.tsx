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
    default: 'bg-white/[0.02] border border-white/5 p-1 rounded-none backdrop-blur-3xl',
    pills: 'bg-transparent gap-2',
    underline: 'bg-transparent border-b border-white/10 pb-0 gap-8'
  };

  const tabStyles = {
    default: (isActive: boolean) => cn(
      'px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] rounded-none transition-all duration-700 italic',
      isActive 
        ? 'bg-primary/10 text-primary shadow-2xl border border-primary/20' 
        : 'text-muted-foreground/40 hover:text-foreground hover:bg-white/5'
    ),
    pills: (isActive: boolean) => cn(
      'px-8 py-3 text-[10px] font-black uppercase tracking-[0.3em] rounded-none transition-all duration-700 border italic shadow-xl',
      isActive 
        ? 'bg-primary text-black border-primary shadow-[0_0_20px_rgba(var(--primary),0.2)]' 
        : 'bg-white/[0.01] text-muted-foreground/40 border-white/5 hover:border-primary/40 hover:text-foreground'
    ),
    underline: (isActive: boolean) => cn(
      'px-1 py-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-700 border-b-2 -mb-[2px] italic',
      isActive 
        ? 'text-primary border-primary drop-shadow-[0_0_10px_rgba(var(--primary),0.3)]' 
        : 'text-muted-foreground/30 border-transparent hover:text-foreground hover:border-white/20'
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
              'relative flex items-center gap-3 whitespace-nowrap group',
              tabStyles[variant](isActive)
            )}
            title={tab.description}
          >
            {tab.icon && <span className={cn('w-3.5 h-3.5 transition-transform duration-700', isActive ? 'scale-110' : 'group-hover:scale-110 opacity-40 group-hover:opacity-100')}>{tab.icon}</span>}
            <span>{tab.label}</span>
            {hasBadge && (
              <Badge 
                variant="secondary" 
                className={cn(
                  'ml-2 h-4 min-w-4 px-2 text-[8px] font-black rounded-none border-none tracking-widest',
                  isActive ? 'bg-black text-primary shadow-lg' : 'bg-destructive/20 text-destructive'
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
