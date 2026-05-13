import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { cn } from '@/lib/utils';


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
  hq: "STUDIO HQ",
  production: "PRODUCTION",
  talent: "TALENT & DEALS",
  intelligence: "INTELLIGENCE",
};

/**
 * Breadcrumbs - Hierarchical navigation indicator
 *
 * Shows the user's current location in the app hierarchy:
 * Hub > SubTab > Context (e.g., Project Name)
 */
export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className, showHome = true }) => {
  return (
    <nav
      className={cn(
        "flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.2em] italic",
        className
      )}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center gap-0">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const Icon = item.icon;

          return (
            <li key={index} className="flex items-center">
              {/* Separator */}
              {index > 0 && (
                <ChevronRight
                  className="w-3.5 h-3.5 mx-3 text-muted-foreground/10"
                  aria-hidden="true"
                  strokeWidth={3}
                />
              )}

              {/* Item */}
              <div
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-none transition-all duration-700",
                  !isLast && ["hover:bg-white/[0.03] hover:text-foreground cursor-pointer"],
                  isLast && "text-foreground font-display tracking-tighter italic scale-110 ml-1",
                  !isLast && "text-muted-foreground/40"
                )}
                role={!isLast && item.onClick ? "button" : undefined}
                tabIndex={!isLast && item.onClick ? 0 : undefined}
                onKeyDown={(e) => {
                  if (!isLast && item.onClick && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    item.onClick();
                  }
                }}
                onClick={!isLast && item.onClick ? item.onClick : undefined}
                aria-current={isLast ? "page" : undefined}
              >
                {/* Show home icon for first item if requested */}
                {index === 0 && showHome && !Icon && (
                  <Home className="w-3.5 h-3.5" strokeWidth={2.5} />
                )}
                {Icon && !showHome && index === 0 && (
                  <Icon className="w-3.5 h-3.5" strokeWidth={2.5} />
                )}
                <span className="truncate max-w-[250px]">{item.label.toUpperCase()}</span>
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
}> = ({ hubId, subTabId, contextLabel, onHubClick, onSubTabClick, className }) => {
  const items: BreadcrumbItem[] = [
    {
      label: HUB_LABELS[hubId] || hubId,
      onClick: onHubClick,
    },
  ];

  if (subTabId) {
    items.push({
      label: subTabId.toUpperCase(),
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
