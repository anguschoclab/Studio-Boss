import React from 'react';
import { Badge } from '@/components/ui/badge';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card';
import { Star, TrendingUp, TrendingDown, Package } from 'lucide-react';
import { Talent } from '@/engine/types';
import { formatMoney } from '@/engine/utils';
import { AGENCY_ARCHETYPES } from '@/engine/data/archetypes';
import { cn } from '@/lib/utils';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { TooltipWrapper } from '@/components/ui/tooltip-wrapper';
import { TalentAvatar } from './TalentAvatar';
import { getTalentVisualAge, getCountryFlag } from '@/engine/generators/avatarGenerator';

interface TalentCardProps {
  talent: Talent;
  className?: string;
  showStarMeter?: boolean;
  onClick?: (talentId: string) => void;
  tooltip?: string;
}

export const TalentCard: React.FC<TalentCardProps> = ({ 
  talent, 
  className, 
  showStarMeter,
  onClick,
  tooltip 
}) => {
  const { selectTalent } = useUIStore();
  const gameState = useGameStore(s => s.gameState);
  const currentWeek = gameState?.week ?? 1;
  const agencyMap = new Map(gameState?.industry.agencies.map(a => [a.id, a]) || []);
  const agency = talent.agencyId ? agencyMap.get(talent.agencyId) : null;
  const archetype = agency?.archetype ? AGENCY_ARCHETYPES[agency.archetype] : null;

  const isPackager = agency?.currentMotivation === 'THE_PACKAGER' ||
    (archetype?.description?.toLowerCase() || '').includes('package') ||
    (archetype?.description?.toLowerCase() || '').includes('packaging');

  const starMeterTrend = (talent.starMeter || 50) > 75 ? 'up' : (talent.starMeter || 50) < 30 ? 'down' : 'stable';

  const visualAge = getTalentVisualAge(talent, currentWeek);
  const countryFlag = getCountryFlag(talent.demographics.country);
  const genderSymbol = talent.demographics.gender === 'MALE' ? '♂' : talent.demographics.gender === 'FEMALE' ? '♀' : '⚧';

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) {
      onClick(talent.id);
    } else {
      selectTalent(talent.id);
    }
  };

  return (
    <TooltipWrapper tooltip={tooltip || `View ${talent.name} Profile`} side="top">
      <div 
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick(e as any);
          }
        }}
        className={cn(
          "p-4 rounded-xl border backdrop-blur-md transition-all duration-300 space-y-3 group relative overflow-hidden cursor-pointer",
          talent.prestige >= 80 
            ? 'border-primary/50 shadow-[0_0_20px_rgba(234,179,8,0.15)] bg-card/80 bg-gradient-to-br from-primary/10 to-transparent' 
            : 'border-border/60 bg-card/60 bg-gradient-to-br from-card/80 to-transparent',
          "hover:shadow-[0_12px_40px_rgba(0,0,0,0.3)] hover:border-primary/50 hover:-translate-y-1 active:scale-[0.98]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          className
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {/* Header: Avatar + Name + Badges */}
        <div className="flex items-start gap-3 relative z-10">
          <TalentAvatar talent={talent} size="sm" className="mt-0.5 group-hover:border-primary/30 transition-colors" />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-display font-bold text-[14px] text-foreground leading-tight group-hover:text-primary transition-colors drop-shadow-sm truncate">{talent.name}</h4>
                  {talent.hasRazzie && (
                    <Badge variant="destructive" className="text-[8px] px-1 py-0 h-4 bg-pink-500/20 text-pink-500 border-pink-500/30 shrink-0">RAZZIE</Badge>
                  )}
                </div>
                
                {/* Demographic Info Row */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[9px] font-bold text-muted-foreground/70 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                    {visualAge}y {genderSymbol}
                  </span>
                  <span className="text-[9px] font-bold text-muted-foreground/70 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                    {countryFlag} {talent.demographics.country}
                  </span>
                  {talent.accessLevel !== 'outsider' && talent.accessLevel !== 'soft-access' && (
                    <span className="text-[8px] font-black tracking-widest text-secondary uppercase drop-shadow-[0_0_2px_rgba(255,161,22,0.4)]">
                      {talent.accessLevel}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-1 shrink-0">
                <Badge variant="outline" className="text-[9px] font-black tracking-widest uppercase bg-background/80 backdrop-blur-md border-border/50 text-foreground/80 group-hover:border-primary/30 transition-colors shadow-sm">
                  {talent.roles[0]}
                </Badge>
                {showStarMeter && (
                  <div className="flex items-center gap-1 bg-black/40 px-1.5 py-0.5 rounded border border-white/5">
                    <Star className="w-2.5 h-2.5 text-primary fill-primary" />
                    <span className="text-[10px] font-bold text-primary">{talent.starMeter || 50}</span>
                    {starMeterTrend === 'up' && <TrendingUp className="w-2.5 h-2.5 text-success" />}
                    {starMeterTrend === 'down' && <TrendingDown className="w-2.5 h-2.5 text-destructive" />}
                  </div>
                )}
              </div>
            </div>
            
            {/* Agency Badge */}
            {agency && (
              <div className="mt-1.5">
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <span className="text-[9px] font-bold tracking-widest text-muted-foreground/80 lowercase bg-background/50 backdrop-blur-sm px-1.5 py-0.5 rounded border border-border/40 shadow-sm group-hover:border-primary/20 transition-colors cursor-help">
                      {agency.name}
                      {isPackager && <Package className="w-2.5 h-2.5 ml-1 inline-block text-amber-500" />}
                    </span>
                  </HoverCardTrigger>
                  {archetype && (
                    <HoverCardContent className="w-80 z-50">
                      <div className="space-y-1">
                        <h4 className="text-sm font-semibold">{archetype.name} Agency</h4>
                        <p className="text-sm text-muted-foreground">{archetype.description}</p>
                        {isPackager && (
                          <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-amber-500 bg-amber-500/10 p-1.5 rounded border border-amber-500/20">
                            <Package className="w-3.5 h-3.5" />
                            <span>Known for aggressive packaging demands</span>
                          </div>
                        )}
                      </div>
                    </HoverCardContent>
                  )}
                </HoverCard>
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-2 text-xs pt-2.5 border-t border-border/40 relative z-10">
          <div className="space-y-0.5">
            <div className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground">Prestige</div>
            <div className="font-semibold text-primary">{talent.prestige}</div>
          </div>
          <div className="space-y-0.5">
            <div className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground">Ask</div>
            <div className="font-semibold text-success">{formatMoney(talent.fee)}</div>
          </div>
          <div className="space-y-0.5">
            <div className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground">Draw</div>
            <div className="font-semibold text-foreground/90">{talent.draw}</div>
          </div>
          <div className="space-y-0.5">
            <div className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground">Status</div>
            <div className="font-semibold truncate text-foreground/90 capitalize">{talent.psychology?.mood > 70 ? 'Confident' : talent.psychology?.mood > 40 ? 'Steady' : 'Volatile'}</div>
          </div>
        </div>
      </div>
    </TooltipWrapper>
  );
};
