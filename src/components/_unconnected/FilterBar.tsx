import React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { tokens } from '@/lib/tokens';
import { Button } from '@/components/ui/button';
import { Stack, HorizontalStack } from '@/components/layout/Stack';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterBarProps {
  /** Search query value */
  searchValue?: string;
  /** Callback when search changes */
  onSearchChange?: (value: string) => void;
  /** Search placeholder text */
  searchPlaceholder?: string;
  /** Available filter options */
  filters?: {
    key: string;
    label: string;
    options: FilterOption[];
    value: string;
    onChange: (value: string) => void;
  }[];
  /** Sort options */
  sortOptions?: FilterOption[];
  /** Current sort value */
  sortValue?: string;
  /** Callback when sort changes */
  onSortChange?: (value: string) => void;
  /** Active filter count for badge */
  activeFilterCount?: number;
  /** Show filter button */
  showFilters?: boolean;
  /** Callback to clear all filters */
  onClearFilters?: () => void;
  /** Additional actions to show */
  actions?: React.ReactNode;
  /** Custom className */
  className?: string;
  /** Compact mode for tight spaces */
  compact?: boolean;
}

/**
 * FilterBar - Standardized filter/search/sort controls
 * 
 * Provides consistent filtering interface with:
 * - Search input with clear button
 * - Filter dropdowns
 * - Sort dropdown
 * - Active filter indicators
 * - Clear all action
 */
export const FilterBar: React.FC<FilterBarProps> = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters,
  sortOptions,
  sortValue,
  onSortChange,
  activeFilterCount = 0,
  showFilters = true,
  onClearFilters,
  actions,
  className,
  compact = false,
}) => {
  const hasActiveFilters = activeFilterCount > 0 || (searchValue && searchValue.length > 0);

  return (
    <Stack
      direction={compact ? 'vertical' : 'horizontal'}
      gap="sm"
      className={cn(
        'p-3 bg-card/40 border border-white/5 rounded-lg',
        className
      )}
    >
      {/* Search */}
      {onSearchChange && (
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchValue || ''}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className={cn(
              'w-full pl-10 pr-9 py-2',
              'bg-background/50 border border-white/10 rounded-md',
              'text-sm placeholder:text-muted-foreground',
              'focus:outline-none focus:border-primary/50',
              tokens.transition.colors
            )}
          />
          {searchValue && (
            <button
              onClick={() => onSearchChange('')}
              className={cn(
                'absolute right-2 top-1/2 -translate-y-1/2',
                'p-1 rounded-full',
                'hover:bg-white/10',
                tokens.transition.fast
              )}
            >
              <X className="w-3 h-3 text-muted-foreground" />
            </button>
          )}
        </div>
      )}

      {/* Filters */}
      {showFilters && filters && filters.length > 0 && (
        <HorizontalStack gap="sm" className="flex-wrap">
          {filters.map((filter) => (
            <select
              key={filter.key}
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
              className={cn(
                'px-3 py-2',
                'bg-background/50 border border-white/10 rounded-md',
                'text-sm',
                'focus:outline-none focus:border-primary/50',
                tokens.transition.colors
              )}
            >
              <option value="">{filter.label}</option>
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ))}
        </HorizontalStack>
      )}

      {/* Sort */}
      {sortOptions && onSortChange && (
        <select
          value={sortValue}
          onChange={(e) => onSortChange(e.target.value)}
          className={cn(
            'px-3 py-2',
            'bg-background/50 border border-white/10 rounded-md',
            'text-sm',
            'focus:outline-none focus:border-primary/50',
            tokens.transition.colors
          )}
        >
          <option value="">Sort by...</option>
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}

      {/* Clear filters */}
      {hasActiveFilters && onClearFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className={cn(
            'text-muted-foreground hover:text-foreground',
            tokens.transition.fast
          )}
        >
          <X className="w-4 h-4 mr-1" />
          Clear
          {activeFilterCount > 0 && (
            <span className="ml-1.5 px-1.5 py-0.5 bg-muted rounded text-[10px]">
              {activeFilterCount}
            </span>
          )}
        </Button>
      )}

      {/* Actions */}
      {actions && (
        <div className="ml-auto flex items-center gap-2">
          {actions}
        </div>
      )}
    </Stack>
  );
};

/**
 * Simplified search-only variant
 */
export const SearchBar: React.FC<{
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}> = ({ value, onChange, placeholder, className }) => (
  <FilterBar
    searchValue={value}
    onSearchChange={onChange}
    searchPlaceholder={placeholder}
    className={className}
  />
);

export default FilterBar;
