import React from 'react';
import { cn } from '@/lib/utils';
import { tokens } from '@/lib/tokens';

/**
 * Base skeleton pulse animation
 */
const SkeletonPulse: React.FC<{ className?: string }> = ({ className }) => (
  <div
    className={cn(
      'animate-pulse bg-muted/50 rounded',
      className
    )}
  />
);

interface SkeletonCardProps {
  /** Number of content rows to show */
  rows?: number;
  /** Include a header section */
  hasHeader?: boolean;
  /** Include an image/avatar area */
  hasImage?: boolean;
  /** Image position relative to content */
  imagePosition?: 'left' | 'top';
  /** Card size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Custom className */
  className?: string;
}

const sizeConfig = {
  sm: {
    container: 'p-4',
    header: 'h-4 w-1/3 mb-3',
    image: 'w-10 h-10',
    imageTop: 'h-32 mb-4',
    row: 'h-3',
    rowWidth: ['w-full', 'w-2/3'],
    gap: 'space-y-2',
  },
  md: {
    container: 'p-5',
    header: 'h-5 w-1/3 mb-4',
    image: 'w-12 h-12',
    imageTop: 'h-40 mb-4',
    row: 'h-3.5',
    rowWidth: ['w-full', 'w-3/4', 'w-1/2'],
    gap: 'space-y-3',
  },
  lg: {
    container: 'p-6',
    header: 'h-6 w-1/4 mb-5',
    image: 'w-16 h-16',
    imageTop: 'h-48 mb-5',
    row: 'h-4',
    rowWidth: ['w-full', 'w-4/5', 'w-3/5', 'w-1/2'],
    gap: 'space-y-4',
  },
};

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  rows = 3,
  hasHeader = true,
  hasImage = false,
  imagePosition = 'top',
  size = 'md',
  className,
}) => {
  const config = sizeConfig[size];

  return (
    <div
      className={cn(
        'bg-card/40 border border-white/5 rounded-xl overflow-hidden',
        config.container,
        className
      )}
    >
      {/* Top image */}
      {hasImage && imagePosition === 'top' && (
        <SkeletonPulse className={cn('rounded-lg', config.imageTop)} />
      )}

      {/* Header */}
      {hasHeader && (
        <SkeletonPulse className={config.header} />
      )}

      {/* Content layout */}
      <div className={cn('flex', imagePosition === 'left' && hasImage && 'gap-4')}>
        {/* Left image */}
        {hasImage && imagePosition === 'left' && (
          <SkeletonPulse className={cn('rounded-lg shrink-0', config.image)} />
        )}

        {/* Text rows */}
        <div className={cn('flex-1', config.gap)}>
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonPulse
              key={i}
              className={cn(
                config.row,
                config.rowWidth[i % config.rowWidth.length]
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Stat card skeleton matching StatCard dimensions
 */
export const SkeletonStat: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ size = 'md', className }) => {
  const sizes = {
    sm: 'p-4',
    md: 'p-5',
    lg: 'p-6',
  };

  return (
    <div
      className={cn(
        'bg-card/40 border border-white/5 rounded-xl overflow-hidden',
        sizes[size],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-3">
          {/* Title */}
          <SkeletonPulse className="h-3 w-20" />
          {/* Value */}
          <SkeletonPulse className={cn(
            'h-8',
            size === 'sm' ? 'w-16' : size === 'md' ? 'w-24' : 'w-32'
          )} />
          {/* Subtitle */}
          <SkeletonPulse className="h-2.5 w-28" />
        </div>
        {/* Icon placeholder */}
        <SkeletonPulse className={cn(
          'rounded-lg shrink-0',
          size === 'sm' ? 'w-8 h-8' : size === 'md' ? 'w-10 h-10' : 'w-12 h-12'
        )} />
      </div>
    </div>
  );
};

/**
 * List item skeleton
 */
export const SkeletonListItem: React.FC<{
  /** Include avatar/image placeholder */
  hasAvatar?: boolean;
  /** Include meta text line */
  hasMeta?: boolean;
  /** Number of text lines */
  lines?: number;
  className?: string;
}> = ({ hasAvatar = true, hasMeta = true, lines = 2, className }) => (
  <div className={cn('flex items-center gap-3 p-3', className)}>
    {hasAvatar && (
      <SkeletonPulse className="w-10 h-10 rounded-full shrink-0" />
    )}
    <div className="flex-1 space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonPulse
          key={i}
          className={cn(
            'h-3',
            i === 0 ? 'w-3/4' : i === 1 && hasMeta ? 'w-1/2' : 'w-1/3'
          )}
        />
      ))}
    </div>
  </div>
);

/**
 * Full list skeleton with multiple items
 */
export const SkeletonList: React.FC<{
  count?: number;
  hasAvatar?: boolean;
  hasMeta?: boolean;
  className?: string;
}> = ({ count = 5, hasAvatar = true, hasMeta = true, className }) => (
  <div className={cn('space-y-1', className)}>
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonListItem
        key={i}
        hasAvatar={hasAvatar}
        hasMeta={hasMeta}
      />
    ))}
  </div>
);

/**
 * Grid of skeleton cards
 */
export const SkeletonCardGrid: React.FC<{
  columns?: 1 | 2 | 3 | 4;
  count?: number;
  hasHeader?: boolean;
  hasImage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({
  columns = 3,
  count = 6,
  hasHeader = true,
  hasImage = false,
  size = 'md',
  className,
}) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-4', gridCols[columns], className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard
          key={i}
          hasHeader={hasHeader}
          hasImage={hasImage}
          size={size}
        />
      ))}
    </div>
  );
};

/**
 * Page section skeleton (for initial page load)
 */
export const SkeletonPage: React.FC<{
  headerRows?: number;
  contentCards?: number;
  className?: string;
}> = ({ headerRows = 2, contentCards = 4, className }) => (
  <div className={cn('space-y-6 animate-in fade-in duration-500', className)}>
    {/* Header section */}
    <div className="space-y-3 pb-6 border-b border-white/5">
      {Array.from({ length: headerRows }).map((_, i) => (
        <SkeletonPulse
          key={i}
          className={cn(
            'h-8',
            i === 0 ? 'w-1/3' : 'w-1/4'
          )}
        />
      ))}
    </div>

    {/* Sub-nav placeholder */}
    <SkeletonPulse className="h-10 w-full max-w-md rounded-lg" />

    {/* Content cards */}
    <SkeletonCardGrid count={contentCards} columns={2} />
  </div>
);

export default SkeletonCard;
