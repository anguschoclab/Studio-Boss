import React from 'react';
import { cn } from '@/lib/utils';
import { getIdentityLabel, StudioIdentityAxes } from '@/engine/systems/StudioIdentitySystem';

// ---------------------------------------------------------------------------
// Identity label tooltip copy
// ---------------------------------------------------------------------------
const LABEL_DESCRIPTIONS: Record<string, string> = {
  'Auteur Studio':
    'Your studio is synonymous with artistic vision. Top-tier auteur filmmakers actively seek you out, and critics respect your output. Commercial blockbusters are rare on your slate.',
  'Prestige Franchise Factory':
    'You have carved out an enviable niche: high-quality franchise storytelling. Audiences trust your brand for both spectacle and substance.',
  'Blockbuster Machine':
    'You are a box-office powerhouse built on proven IP. Expect strong opening weekends, global partnerships, and talent drawn by big budgets — not prestige.',
  'Genre Indie':
    'Your original, genre-forward work punches above its weight. Emerging talent gravitates toward you for creative freedom on a lean budget.',
  'Balanced Studio':
    'A diverse slate with no single defining identity — flexibility is your strength, but it can dilute your brand in competitive award seasons.',
};

// ---------------------------------------------------------------------------
// Talent attraction hints per identity
// ---------------------------------------------------------------------------
const TALENT_HINTS: Record<string, string> = {
  'Auteur Studio': 'Auteur filmmakers & prestige-hunters prefer your studio.',
  'Prestige Franchise Factory': 'Award-conscious franchise stars are drawn to your slate.',
  'Blockbuster Machine': 'Commercial A-listers & action stars target your projects.',
  'Genre Indie': 'Rising stars & genre specialists seek creative opportunities here.',
  'Balanced Studio': 'A broad range of talent considers your studio a safe choice.',
};

// ---------------------------------------------------------------------------
// Axis bar sub-component
// ---------------------------------------------------------------------------
interface AxisBarProps {
  leftLabel: string;
  rightLabel: string;
  value: number; // 0-100 (100 = right)
  leftColor: string;  // Tailwind gradient start class
  rightColor: string; // Tailwind gradient end class
}

const AxisBar: React.FC<AxisBarProps> = ({ leftLabel, rightLabel, value, leftColor, rightColor }) => {
  const pct = Math.max(0, Math.min(100, value));

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] font-body text-muted-foreground uppercase tracking-wider">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
      {/* Track */}
      <div className="relative h-3 rounded-none bg-white/5 overflow-visible">
        {/* Fill */}
        <div
          className={cn('absolute inset-y-0 left-0 rounded-none', leftColor, rightColor)}
          style={{
            width: `${pct}%`,
            background: `linear-gradient(to right, var(--tw-gradient-stops))`,
          }}
        />
        {/* Marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-none bg-white border-2 border-primary shadow-md z-10"
          style={{ left: `calc(${pct}% - 6px)` }}
        />
      </div>
      {/* Value callout */}
      <div className="flex justify-end">
        <span className="text-[10px] font-tabular-nums text-muted-foreground">{pct.toFixed(0)}</span>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main panel
// ---------------------------------------------------------------------------
interface StudioIdentityPanelProps {
  /** Pass state.studio.identity — defaults to 50/50 if missing */
  identity?: Partial<StudioIdentityAxes>;
  className?: string;
}

export const StudioIdentityPanel: React.FC<StudioIdentityPanelProps> = ({
  identity,
  className,
}) => {
  const axes: StudioIdentityAxes = {
    prestigeCommercial: identity?.prestigeCommercial ?? 50,
    franchiseOriginal: identity?.franchiseOriginal ?? 50,
  };

  const label = getIdentityLabel(axes);
  const description = LABEL_DESCRIPTIONS[label] ?? '';
  const hint = TALENT_HINTS[label] ?? '';

  return (
    <div className={cn('glass-card p-5 space-y-5', className)}>
      {/* Header */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-body mb-1">
          Studio Identity
        </p>
        <h2 className="font-display font-black text-2xl text-primary leading-tight">
          {label}
        </h2>
        {description && (
          <p className="mt-1 text-xs font-body text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Axes */}
      <div className="space-y-4">
        <AxisBar
          leftLabel="Commercial"
          rightLabel="Art House"
          value={axes.prestigeCommercial}
          leftColor="from-amber-500/60"
          rightColor="to-violet-500/80"
        />
        <AxisBar
          leftLabel="Originals"
          rightLabel="Franchise"
          value={axes.franchiseOriginal}
          leftColor="from-sky-500/60"
          rightColor="to-primary/80"
        />
      </div>

      {/* Talent attraction hint */}
      {hint && (
        <div className="pt-1 border-t border-white/10">
          <p className="text-[11px] font-body text-secondary italic">{hint}</p>
        </div>
      )}
    </div>
  );
};

export default StudioIdentityPanel;
