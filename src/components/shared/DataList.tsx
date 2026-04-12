import React, { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { tokens } from '@/lib/tokens';
import { EmptyState } from './EmptyState';
import { SkeletonList, SkeletonListItem } from './SkeletonCard';
import { staggerContainer, staggerItem } from '@/lib/animations';
import { Search, AlertCircle } from 'lucide-react';

interface DataListProps<T> {
  /** Array of items to display */
  items: T[];
  /** Render function for each item */
  renderItem: (item: T, index: number) => React.ReactNode;
  /** Unique key extractor */
  keyExtractor: (item: T, index: number) => string;
  /** Empty state configuration */
  emptyState?: {
    icon?: React.ComponentType<{ className?: string; size?: number | string; strokeWidth?: number | string }>;
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
  /** Virtualization for large lists (optional) */
  virtualized?: boolean;
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
  virtualized = false,
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
            icon={emptyState?.icon || AlertCircle}
            title={emptyState?.title || 'No items found'}
            description={emptyState?.description}
            action={emptyState?.action}
            variant="card"
          />
        )}
        {footer}
      </div>
    );
  }

  const ListWrapper = animate ? motion.div : 'div';
  const ItemWrapper = animate ? motion.div : 'div';

  return (
    <div className={className}>
      {header}
      
      <ListWrapper
        className={cn(
          'space-y-1',
          dividers && 'divide-y divide-white/5'
        )}
        {...(animate && {
          variants: staggerContainer,
          initial: 'initial',
          animate: 'animate',
        })}
      >
        <AnimatePresence mode="popLayout">
          {items.map((item, index) => (
            <ItemWrapper
              key={keyExtractor(item, index)}
              className={cn(
                interactive && [
                  'rounded-lg',
                  'hover:bg-white/5',
                  'cursor-pointer',
                  tokens.transition.fast,
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
  searchQuery = '',
  filterFn,
  searchPlaceholder = 'Search...',
  onSearchChange,
  showSearch = true,
  ...props
}: FilterableDataListProps<T>) {
  // Filter items based on search query
  const filteredItems = React.useMemo(() => {
    if (!searchQuery || !filterFn) return items;
    return items.filter(item => filterFn(item, searchQuery));
  }, [items, searchQuery, filterFn]);

  // Empty state for search with no results
  const searchEmptyState = searchQuery
    ? {
        icon: Search,
        title: 'No results found',
        description: `No matches for "${searchQuery}"`,
        action: onSearchChange
          ? {
              label: 'Clear search',
              onClick: () => onSearchChange(''),
            }
          : undefined,
      }
    : props.emptyState;

  return (
    <div className="space-y-4">
      {showSearch && onSearchChange && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className={cn(
              'w-full pl-10 pr-4 py-2',
              'bg-card/40 border border-white/10 rounded-lg',
              'text-sm placeholder:text-muted-foreground',
              'focus:outline-none focus:border-primary/50',
              tokens.transition.colors
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
}: Omit<DataListProps<T>, 'emptyState' | 'animate'>) {
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
        title: 'No items',
      }}
    />
  );
}

export default DataList;
