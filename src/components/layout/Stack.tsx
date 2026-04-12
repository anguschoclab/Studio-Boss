import React from 'react';
import { cn } from '@/lib/utils';
import { tokens } from '@/lib/tokens';

type GapSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type Direction = 'vertical' | 'horizontal' | 'v' | 'h';
type AlignItems = 'start' | 'center' | 'end' | 'stretch';
type JustifyContent = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';

interface StackProps {
  /** Child elements */
  children: React.ReactNode;
  /** Gap size between items */
  gap?: GapSize;
  /** Layout direction */
  direction?: Direction;
  /** Alignment on cross axis */
  align?: AlignItems;
  /** Alignment on main axis */
  justify?: JustifyContent;
  /** Wrap items to next line */
  wrap?: boolean;
  /** Full width */
  fullWidth?: boolean;
  /** Full height */
  fullHeight?: boolean;
  /** Custom className */
  className?: string;
  /** HTML element to render as */
  as?: keyof JSX.IntrinsicElements;
}

const gapMap: Record<GapSize, string> = {
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-3',
  lg: 'gap-4',
  xl: 'gap-6',
};

const alignMap: Record<AlignItems, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
};

const justifyMap: Record<JustifyContent, string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
};

/**
 * Stack - Standardized flex container with token-based spacing
 * 
 * Use this instead of arbitrary `flex gap-X` classes.
 * Provides consistent spacing across all components.
 */
export const Stack: React.FC<StackProps> = ({
  children,
  gap = 'md',
  direction = 'vertical',
  align = 'stretch',
  justify = 'start',
  wrap = false,
  fullWidth = false,
  fullHeight = false,
  className,
  as: Component = 'div',
}) => {
  const isHorizontal = direction === 'horizontal' || direction === 'h';

  return (
    <Component
      className={cn(
        'flex',
        isHorizontal ? 'flex-row' : 'flex-col',
        gapMap[gap],
        alignMap[align],
        justifyMap[justify],
        wrap && 'flex-wrap',
        fullWidth && 'w-full',
        fullHeight && 'h-full',
        className
      )}
    >
      {children}
    </Component>
  );
};

/**
 * VerticalStack - Convenience wrapper for vertical stacks
 */
export const VerticalStack: React.FC<Omit<StackProps, 'direction'>> = (props) => (
  <Stack direction="vertical" {...props} />
);

/**
 * HorizontalStack - Convenience wrapper for horizontal stacks
 */
export const HorizontalStack: React.FC<Omit<StackProps, 'direction'>> = (props) => (
  <Stack direction="horizontal" {...props} />
);

/**
 * Space - Creates consistent vertical spacing between sections
 * 
 * Use this instead of margin-top/margin-bottom on individual components.
 */
export const Space: React.FC<{
  size?: GapSize;
  className?: string;
}> = ({ size = 'md', className }) => {
  const sizeMap: Record<GapSize, string> = {
    xs: 'h-1',
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
    xl: 'h-6',
  };

  return <div className={cn(sizeMap[size], className)} />;
};

/**
 * Divider - Horizontal or vertical divider with consistent styling
 */
export const Divider: React.FC<{
  direction?: 'horizontal' | 'vertical';
  className?: string;
}> = ({ direction = 'horizontal', className }) => (
  <div
    className={cn(
      tokens.border.divider,
      direction === 'horizontal' ? 'h-px w-full' : 'w-px h-full',
      className
    )}
  />
);

/**
 * Center - Centers content both horizontally and vertically
 */
export const Center: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <Stack
    direction="vertical"
    align="center"
    justify="center"
    fullWidth
    fullHeight
    className={className}
  >
    {children}
  </Stack>
);

export default Stack;
