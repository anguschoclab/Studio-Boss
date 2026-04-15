/**
 * Design Token System for Studio Boss
 * 
 * Provides consistent spacing, borders, shadows, and typography
 * across all components. Use these tokens instead of arbitrary values.
 */

export const tokens = {
  /**
   * Border opacity variants for consistent visual hierarchy
   * - subtle: Cards on dark backgrounds (lowest emphasis)
   * - default: Standard card borders (normal emphasis)
   * - prominent: Active/hover states (higher emphasis)
   * - divider: Section dividers (functional separation)
   */
  border: {
    subtle: 'border-white/5',
    default: 'border-white/10',
    prominent: 'border-white/20',
    divider: 'border-border',
    interactive: 'border-white/10 hover:border-white/20 focus:border-primary/50',
  },

  /**
   * Spacing scale - 5 values for all spacing needs
   * Use these consistently instead of arbitrary gap/space values
   */
  spacing: {
    xs: 'gap-1 space-y-1',         // 4px - Tight groupings, inline items
    sm: 'gap-2 space-y-2',         // 8px - Related items, toolbars
    md: 'gap-3 space-y-3',         // 12px - Standard sections, cards
    lg: 'gap-4 space-y-4',         // 16px - Major sections, form groups
    xl: 'gap-6 space-y-6',         // 24px - Page sections, major divisions
  },

  /**
   * Shadow variants for depth hierarchy
   */
  shadow: {
    card: 'shadow-lg shadow-black/20',
    elevated: 'shadow-xl shadow-black/30',
    glow: {
      primary: 'shadow-[0_0_20px_hsl(var(--primary)/0.3)]',
      secondary: 'shadow-[0_0_20px_hsl(var(--secondary)/0.3)]',
      destructive: 'shadow-[0_0_20px_hsl(var(--destructive)/0.3)]',
      success: 'shadow-[0_0_20px_hsl(var(--success)/0.3)]',
    },
  },

  /**
   * Typography scale - 5 standard sizes
   * Use these instead of arbitrary text-[Xpx] values
   */
  text: {
    label: 'text-[10px] font-black uppercase tracking-wider text-muted-foreground',      // Form labels, badges
    caption: 'text-[11px] font-medium text-muted-foreground',                             // Secondary info, metadata
    body: 'text-sm font-normal',                                                         // Standard text
    heading: 'text-base font-bold',                                                      // Card titles, section headers
    title: 'text-lg font-black tracking-tight',                                          // Page titles, major headers
    display: 'text-2xl font-display font-black tracking-tighter',                        // Major display text
  },

  /**
   * Animation duration tokens
   * Use these for all transitions and animations
   */
  duration: {
    fast: '150ms',       // Micro-interactions, hovers
    normal: '250ms',     // Standard transitions
    slow: '400ms',       // Page transitions, reveals
  },

  /**
   * Transition presets
   */
  transition: {
    fast: 'transition-all duration-150 ease-in-out',
    normal: 'transition-all duration-250 ease-in-out',
    slow: 'transition-all duration-400 ease-in-out',
    colors: 'transition-colors duration-150',
    transform: 'transition-transform duration-200',
  },

  /**
   * Glassmorphism presets
   */
  glass: {
    card: 'bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-300',
    panel: 'bg-background/40 backdrop-blur-2xl border-r border-white/5',
    header: 'bg-background/60 backdrop-blur-xl border-b border-white/5',
    elevated: 'bg-gradient-to-br from-card/90 to-card/50 backdrop-blur-2xl border border-white/20 shadow-2xl hover:shadow-[0_0_30px_hsl(var(--primary)/0.15)] transition-all duration-300',
  },

  /**
   * Interactive state styles
   */
  interactive: {
    default: 'hover:bg-white/10 hover:border-white/30 hover:shadow-lg transition-all duration-300',
    active: 'bg-primary/15 text-primary border-primary/30 shadow-[0_0_15px_hsl(var(--primary)/0.15)]',
    disabled: 'opacity-50 cursor-not-allowed pointer-events-none',
  },

  /**
   * Color semantic mapping
   */
  color: {
    primary: 'text-primary',
    secondary: 'text-secondary',
    success: 'text-emerald-400',
    warning: 'text-amber-400',
    destructive: 'text-red-400',
    muted: 'text-muted-foreground',
  },

  /**
   * Background semantic mapping
   */
  bg: {
    primary: 'bg-primary/10',
    secondary: 'bg-secondary/10',
    success: 'bg-emerald-500/10',
    warning: 'bg-amber-500/10',
    destructive: 'bg-red-500/10',
    muted: 'bg-muted',
  },
} as const;

/**
 * Utility function to combine token classes
 * Usage: cn(tokens.spacing.md, tokens.border.default)
 */
export function combineTokens(...tokenClasses: string[]): string {
  return tokenClasses.join(' ');
}

/**
 * Quick reference for common component patterns
 */
export const patterns = {
  card: combineTokens(
    'bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl',
    tokens.border.default,
    'rounded-xl',
    tokens.spacing.md,
    'hover:border-white/30 hover:shadow-xl hover:-translate-y-0.5',
    tokens.transition.normal
  ),
  
  listItem: combineTokens(
    'flex items-center gap-3',
    'p-3 rounded-lg',
    'hover:bg-white/5',
    tokens.transition.fast
  ),
  
  button: {
    primary: combineTokens(
      'bg-primary text-primary-foreground',
      'hover:bg-primary/90',
      tokens.shadow.glow.primary,
      'shadow-[0_0_15px_hsl(var(--primary)/0.1)]',
      'hover:shadow-[0_0_20px_hsl(var(--primary)/0.3)]',
      tokens.transition.normal,
      'active:scale-95'
    ),
    secondary: combineTokens(
      'bg-secondary text-secondary-foreground',
      'hover:bg-secondary/80',
      tokens.shadow.glow.secondary,
      tokens.transition.normal,
      'active:scale-95'
    ),
    ghost: combineTokens(
      'hover:bg-white/5',
      tokens.transition.fast
    ),
  },
  
  sectionHeader: combineTokens(
    'flex items-center gap-4',
    'mb-6',
    'pb-4 border-b border-white/5'
  ),
};
