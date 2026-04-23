import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUIStore } from '@/store/uiStore';
import { useGameStore } from '@/store/gameStore';
import { cn } from '@/lib/utils';
import {
  ReleaseStrategy,
  getReleaseStrategyEffect,
} from '@/engine/systems/ReleaseStrategySystem';

// ─── Strategy display metadata ────────────────────────────────────────────────

interface StrategyCardData {
  strategy: ReleaseStrategy;
  icon: string;
  name: string;
  tagline: string;
  revenuePotential: string;
  prestigeImpact: string;
  risk: 'Low' | 'Medium' | 'High';
  riskColor: string;
}

const STRATEGY_CARDS: StrategyCardData[] = [
  {
    strategy: 'theatrical',
    icon: '🎬',
    name: 'Theatrical Release',
    tagline: 'Go wide. Go loud. Win the weekend.',
    revenuePotential: 'Very High',
    prestigeImpact: '+5',
    risk: 'High',
    riskColor: 'text-destructive border-destructive/40 bg-destructive/10',
  },
  {
    strategy: 'streaming',
    icon: '📺',
    name: 'Streaming Deal',
    tagline: 'Guaranteed income, zero box-office risk.',
    revenuePotential: 'Moderate',
    prestigeImpact: '+3',
    risk: 'Low',
    riskColor: 'text-success border-success/40 bg-success/10',
  },
  {
    strategy: 'platform_exclusive',
    icon: '🔒',
    name: 'Platform Exclusive',
    tagline: '$5M platform fee upfront — no bidding war.',
    revenuePotential: 'Good',
    prestigeImpact: '+2',
    risk: 'Medium',
    riskColor: 'text-warning border-warning/40 bg-warning/10',
  },
  {
    strategy: 'limited_prestige',
    icon: '🏆',
    name: 'Limited Prestige Run',
    tagline: '500 screens. Maximum Oscar bait.',
    revenuePotential: 'Limited',
    prestigeImpact: '+30',
    risk: 'Medium',
    riskColor: 'text-warning border-warning/40 bg-warning/10',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export const ReleaseStrategyModal: React.FC = () => {
  const { activeModal, resolveCurrentModal } = useUIStore();
  const setReleaseStrategy = useGameStore(s => (s as any).setReleaseStrategy);
  const gameState = useGameStore(s => s.gameState);

  const [selected, setSelected] = useState<ReleaseStrategy | null>(null);

  if (!activeModal || activeModal.type !== 'RELEASE_STRATEGY') return null;

  const { projectId, projectTitle } = (activeModal.payload ?? {}) as {
    projectId: string;
    projectTitle: string;
  };

  const project = gameState?.entities?.projects?.[projectId];

  const handleConfirm = () => {
    if (!selected || !projectId) return;
    if (setReleaseStrategy) {
      setReleaseStrategy(projectId, selected);
    }
    resolveCurrentModal();
  };

  const getEffect = (strategy: ReleaseStrategy) => {
    if (!project) return null;
    return getReleaseStrategyEffect(strategy, project);
  };

  return (
    <Dialog
      open={true}
      onOpenChange={(open) => {
        // Prevent accidental close — player must make a decision
        if (!open) return;
      }}
    >
      <DialogContent
        className="max-w-2xl bg-card/90 backdrop-blur-2xl border border-white/10"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">
            Distribution Decision
          </p>
          <DialogTitle className="font-display font-black text-3xl text-primary tracking-tight">
            {projectTitle}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Select a release strategy before marketing begins. This decision is permanent.
          </p>
        </DialogHeader>

        {/* Strategy grid */}
        <div className="grid grid-cols-2 gap-3 py-2">
          {STRATEGY_CARDS.map((card) => {
            const effect = getEffect(card.strategy);
            const isSelected = selected === card.strategy;

            return (
              <button
                key={card.strategy}
                type="button"
                onClick={() => setSelected(card.strategy)}
                className={cn(
                  'glass-card hover-glow cursor-pointer p-4 rounded-none border-2 text-left transition-all duration-200',
                  'hover:scale-[1.02] active:scale-[0.99]',
                  isSelected
                    ? 'border-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.35)]'
                    : 'border-white/10'
                )}
              >
                {/* Icon + name */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl leading-none">{card.icon}</span>
                  <span className="font-display font-black text-sm uppercase tracking-tight text-foreground">
                    {card.name}
                  </span>
                </div>

                {/* Tagline */}
                <p className="text-xs text-muted-foreground mb-3 leading-snug">
                  {card.tagline}
                </p>

                {/* Stats row */}
                <div className="flex flex-col gap-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground font-medium">Revenue</span>
                    <span className="font-black text-foreground">{card.revenuePotential}</span>
                  </div>
                  {effect && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground font-medium">Multiplier</span>
                      <span className="font-black text-success">
                        {(effect.revenueMultiplier * 100).toFixed(0)}%
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground font-medium">Prestige</span>
                    <span className="font-black text-secondary">{card.prestigeImpact}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-muted-foreground font-medium">Risk</span>
                    <Badge
                      variant="outline"
                      className={cn('text-[10px] font-black uppercase px-2 py-0 border', card.riskColor)}
                    >
                      {card.risk}
                    </Badge>
                  </div>
                </div>

                {/* Special note */}
                {card.strategy === 'platform_exclusive' && (
                  <p className="mt-2 text-[10px] text-primary font-bold">
                    +$5,000,000 platform fee on confirm
                  </p>
                )}
                {card.strategy === 'limited_prestige' && (
                  <p className="mt-2 text-[10px] text-secondary font-bold">
                    +30 prestige on confirm
                  </p>
                )}
              </button>
            );
          })}
        </div>

        {/* Description of selected */}
        {selected && (
          <div className="p-3 rounded-none bg-card/60 border border-border/40 text-xs text-muted-foreground">
            {getReleaseStrategyEffect(selected, project ?? {}).description}
          </div>
        )}

        {/* Confirm */}
        <Button
          disabled={!selected}
          onClick={handleConfirm}
          className={cn(
            'w-full font-display font-black uppercase tracking-wider text-base py-5',
            selected
              ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
              : 'opacity-40 cursor-not-allowed'
          )}
        >
          Lock In Strategy
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default ReleaseStrategyModal;
