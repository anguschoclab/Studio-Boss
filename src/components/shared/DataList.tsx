import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

import { EmptyState } from "./EmptyState";
import { SkeletonList } from "./SkeletonCard";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { Search, AlertCircle } from "lucide-react";

interface DataListProps<T> {
  /** Array of items to display */
  items: T[];
  /** Render function for each item */
  renderItem: (item: T, index: number) => React.ReactNode;
  /** Unique key extractor */
  keyExtractor: (item: T, index: number) => string;
  /** Empty state configuration */
  emptyState?: {
    icon?: React.ComponentType<{
      className?: string;
      size?: number | string;
      strokeWidth?: number | string;
    }>;
    title: string;
    description?: string;
    action?: {
      label: string;
      onClick: () => void;
    };
  };
  /** Loading state */
  isLoading?: boolean;
  /** Number of skeleton items to show while loading */
  skeletonCount?: number;
  /** Custom container className */
  className?: string;
  /** Custom item wrapper className */
  itemClassName?: string;
  /** Enable hover effects on items */
  interactive?: boolean;
  /** Enable stagger animation on mount */
  animate?: boolean;
  /** Header content */
  header?: React.ReactNode;
  /** Footer content */
  footer?: React.ReactNode;
  /** Divider between items */
  dividers?: boolean;
  /** Custom empty state component */
  customEmptyState?: React.ReactNode;
}

/**
 * DataList - Standardized list component with loading, empty, and animation states
 *
 * Provides consistent list rendering with:
 * - Skeleton loading states
 * - Empty state handling
 * - Stagger animations
 * - Interactive hover states
 * - Optional virtualization for large lists
 */
export function DataList<T>({
  items,
  renderItem,
  keyExtractor,
  emptyState,
  isLoading = false,
  skeletonCount = 5,
  className,
  itemClassName,
  interactive = false,
  animate = true,
  header,
  footer,
  dividers = false,
  customEmptyState,
}: DataListProps<T>) {
  // Loading state
  if (isLoading) {
    return (
      <div className={className}>
        {header}
        <SkeletonList count={skeletonCount} />
        {footer}
      </div>
    );
  }

  // Empty state
  if (items.length === 0) {
    return (
      <div className={className}>
        {header}
        {customEmptyState || (
          <EmptyState
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            icon={(emptyState?.icon || AlertCircle) as any}
            title={emptyState?.title || "No items found"}
            message={emptyState?.description || ""}
            action={emptyState?.action}
            variant="card"
          />
        )}
        {footer}
      </div>
    );
  }

  const ListWrapper = animate ? motion.div : "div";
  const ItemWrapper = animate ? motion.div : "div";

  return (
    <div className={className}>
      {header}

      <ListWrapper
        className={cn("space-y-2", dividers && "divide-y divide-white/5")}
        {...(animate && {
          variants: staggerContainer,
          initial: "initial",
          animate: "animate",
        })}
      >
        <AnimatePresence mode="popLayout">
          {items.map((item, index) => (
            <ItemWrapper
              key={keyExtractor(item, index)}
              className={cn(
                interactive && [
                  "rounded-none border border-transparent",
                  "hover:bg-white/[0.03] hover:border-white/5",
                  "cursor-pointer",
                  "transition-all duration-700",
                ],
                itemClassName
              )}
              {...(animate && {
                variants: staggerItem,
                layout: true,
              })}
            >
              {renderItem(item, index)}
            </ItemWrapper>
          ))}
        </AnimatePresence>
      </ListWrapper>

      {footer}
    </div>
  );
}

/**
 * Specialized DataList for searchable/filterable data
 */
interface FilterableDataListProps<T> extends DataListProps<T> {
  /** Current search query */
  searchQuery?: string;
  /** Filter function */
  filterFn?: (item: T, query: string) => boolean;
  /** Search placeholder text */
  searchPlaceholder?: string;
  /** Callback when search changes */
  onSearchChange?: (query: string) => void;
  /** Show search input */
  showSearch?: boolean;
}

export function FilterableDataList<T>({
  items,
  searchQuery = "",
  filterFn,
  searchPlaceholder = "SEARCH DATABASE...",
  onSearchChange,
  showSearch = true,
  ...props
}: FilterableDataListProps<T>) {
  // Filter items based on search query
  const filteredItems = React.useMemo(() => {
    if (!searchQuery || !filterFn) return items;
    return items.filter((item) => filterFn(item, searchQuery));
  }, [items, searchQuery, filterFn]);

  // Empty state for search with no results
  const searchEmptyState = searchQuery
    ? {
        icon: Search,
        title: "NO RESULTS FOUND",
        description: `NO MATCHES FOR "${searchQuery.toUpperCase()}"`,
        action: onSearchChange
          ? {
              label: "CLEAR SEARCH",
              onClick: () => onSearchChange(""),
            }
          : undefined,
      }
    : props.emptyState;

  return (
    <div className="space-y-8">
      {showSearch && onSearchChange && (
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/20 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder || "Search"}
            className={cn(
              "w-full pl-12 pr-6 py-4",
              "bg-white/[0.02] border border-white/5 rounded-none",
              "text-[10px] font-black uppercase tracking-[0.3em] italic placeholder:text-muted-foreground/10",
              "focus:outline-none focus:border-primary/40 focus:bg-white/[0.05]",
              "transition-all duration-700"
            )}
          />
        </div>
      )}

      <DataList
        {...props}
        items={filteredItems}
        emptyState={searchEmptyState || props.emptyState}
      />
    </div>
  );
}

/**
 * Compact list variant for sidebars/panels
 */
export function CompactList<T>({
  items,
  renderItem,
  keyExtractor,
  isLoading,
  className,
}: Omit<DataListProps<T>, "emptyState" | "animate">) {
  return (
    <DataList
      items={items}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      isLoading={isLoading}
      className={className}
      animate={false}
      interactive
      emptyState={{
        icon: AlertCircle,
        title: "NO ITEMS FOUND",
      }}
    />
  );
}

export default DataList;
