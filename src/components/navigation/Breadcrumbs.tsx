import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { tokens } from '@/lib/tokens';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string; size?: number }>;
  onClick?: () => void;
}

interface BreadcrumbsProps {
  /** Breadcrumb items, ordered from root to leaf */
  items: BreadcrumbItem[];
  /** Custom className */
  className?: string;
  /** Show home icon for first item */
  showHome?: boolean;
}

const HUB_LABELS: Record<string, string> = {
  hq: 'Studio HQ',
  production: 'Production',
  talent: 'Talent & Deals',
  intelligence: 'Intelligence',
};

/**
 * Breadcrumbs - Hierarchical navigation indicator
 * 
 * Shows the user's current location in the app hierarchy:
 * Hub > SubTab > Context (e.g., Project Name)
 */
export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  className,
  showHome = true,
}) => {
  return (
    <nav
      className={cn(
        'flex items-center gap-1 text-sm',
        className
      )}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center gap-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const Icon = item.icon;

          return (
            <li key={index} className="flex items-center">
              {/* Separator */}
              {index > 0 && (
                <ChevronRight
                  className="w-4 h-4 mx-1 text-muted-foreground/50"
                  aria-hidden="true"
                />
              )}

              {/* Item */}
              <div
                className={cn(
                  'flex items-center gap-1.5 px-2 py-1 rounded-md',
                  !isLast && [
                    'hover:bg-white/5 cursor-pointer',
                    tokens.transition.fast,
                  ],
                  isLast && 'text-foreground font-medium',
                  !isLast && 'text-muted-foreground'
                )}
                onClick={!isLast && item.onClick ? item.onClick : undefined}
                aria-current={isLast ? 'page' : undefined}
              >
                {/* Show home icon for first item if requested */}
                {index === 0 && showHome && !Icon && (
                  <Home className="w-3.5 h-3.5" />
                )}
                {Icon && !showHome && index === 0 && (
                  <Icon className="w-3.5 h-3.5" />
                )}
                <span className="truncate max-w-[200px]">{item.label}</span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

/**
 * Simplified breadcrumbs for hub navigation
 */
export const HubBreadcrumbs: React.FC<{
  hubId: string;
  subTabId?: string;
  contextLabel?: string;
  onHubClick?: () => void;
  onSubTabClick?: () => void;
  className?: string;
}> = ({
  hubId,
  subTabId,
  contextLabel,
  onHubClick,
  onSubTabClick,
  className,
}) => {
  const items: BreadcrumbItem[] = [
    {
      label: HUB_LABELS[hubId] || hubId,
      onClick: onHubClick,
    },
  ];

  if (subTabId) {
    items.push({
      label: subTabId.charAt(0).toUpperCase() + subTabId.slice(1),
      onClick: onSubTabClick,
    });
  }

  if (contextLabel) {
    items.push({
      label: contextLabel,
    });
  }

  return <Breadcrumbs items={items} className={className} showHome={false} />;
};

export default Breadcrumbs;
