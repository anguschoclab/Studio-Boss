import React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  searchPlaceholder = 'SEARCH DATABASE...',
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
        'p-2 bg-white/[0.02] border border-white/5 rounded-none',
        className
      )}
    >
      {/* Search */}
      {onSearchChange && (
        <div className="relative flex-1 min-w-[200px] group">
          <Search aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/20 group-focus-within:text-primary transition-colors pointer-events-none" />
          <input
            type="text"
            aria-label={searchPlaceholder || 'Search'}
            value={searchValue || ''}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className={cn(
              'w-full pl-12 pr-12 py-3',
              'bg-white/5 border border-white/10 rounded-none',
              'text-[10px] font-black uppercase tracking-[0.3em] italic placeholder:text-muted-foreground/10',
              'focus:outline-none focus:border-primary/50 focus:bg-white/10',
              'transition-all duration-700'
            )}
          />
          {searchValue && (
            <button
              onClick={() => onSearchChange('')}
              className={cn(
                'absolute right-3 top-1/2 -translate-y-1/2',
                'p-2 rounded-none',
                'hover:bg-white/10 text-muted-foreground/40 hover:text-foreground',
                'transition-all duration-300'
              )}
            >
              <X className="w-4 h-4" />
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
                'px-4 py-3',
                'bg-white/5 border border-white/10 rounded-none',
                'text-[10px] font-black uppercase tracking-[0.2em] italic',
                'focus:outline-none focus:border-primary/50 focus:bg-white/10',
                'transition-all duration-700 appearance-none min-w-[120px]'
              )}
            >
              <option value="" className="bg-black/60">{filter.label.toUpperCase()}</option>
              {filter.options.map((option) => (
                <option key={option.value} value={option.value} className="bg-black/60">
                  {option.label.toUpperCase()}
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
            'px-4 py-3',
            'bg-white/5 border border-white/10 rounded-none',
            'text-[10px] font-black uppercase tracking-[0.2em] italic',
            'focus:outline-none focus:border-primary/50 focus:bg-white/10',
            'transition-all duration-700 appearance-none min-w-[140px]'
          )}
        >
          <option value="" className="bg-black/60">SORT BY...</option>
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value} className="bg-black/60">
              {option.label.toUpperCase()}
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
            'text-muted-foreground/20 hover:text-red-400 hover:bg-red-400/5 transition-all duration-700 rounded-none px-4',
            'text-[9px] font-black uppercase tracking-[0.2em] italic'
          )}
        >
          <X className="w-3 h-3 mr-2" />
          RESET
          {activeFilterCount > 0 && (
            <span className="ml-2 px-1.5 py-0.5 bg-white/5 border border-white/10 rounded-none text-[8px] font-display tracking-tighter">
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
