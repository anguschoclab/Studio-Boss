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

  const starPower = talent.starMeter || 50;

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
        className={cn(
          "p-5 border glass-card transition-all duration-500 group relative overflow-hidden cursor-pointer h-full flex flex-col",
          talent.prestige >= 80
            ? 'border-primary/30 shadow-2xl shadow-primary/5 bg-white/[0.03]'
            : 'border-white/5 bg-white/[0.01]',
          "hover:border-primary/50 hover:bg-white/[0.05] hover:-translate-y-1 active:scale-[0.98]",
          className
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {/* Header: Portrait + Star Bar + Meta */}
        <div className="flex gap-4 relative z-10 mb-6">
          {/* Portrait Container */}
          <div className="relative shrink-0">
            <TalentAvatar talent={talent} size="lg" className="rounded-xl border-white/10 group-hover:border-primary/30 transition-all duration-500" />
            
            {/* Vertical Star Power Bar (Design Bible 13.1) */}
            <div className="absolute -right-1 top-0 bottom-0 w-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
               <div 
                 className="absolute bottom-0 left-0 right-0 bg-primary transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(var(--primary),0.5)]" 
                 style={{ height: `${starPower}%` }} 
               />
            </div>
          </div>
          
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="font-display font-black text-lg text-foreground tracking-tighter uppercase italic leading-none group-hover:text-primary transition-colors truncate">
                  {talent.name}
                </h4>
              </div>
              
              <div className="flex items-center gap-2 mb-3">
                 <Badge className="bg-primary text-black font-black uppercase tracking-widest text-[8px] h-4 border-none px-1.5">
                   {talent.roles[0]}
                 </Badge>
                 {talent.hasRazzie && (
                    <Badge className="bg-destructive text-white font-black uppercase tracking-widest text-[8px] h-4 border-none px-1.5">RAZZIE</Badge>
                 )}
              </div>
            </div>

            <div className="space-y-1.5">
               <div className="flex items-center gap-2">
                 <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">{visualAge}y {genderSymbol}</span>
                 <span className="w-1 h-1 rounded-full bg-white/10" />
                 <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] truncate">{talent.demographics.country}</span>
               </div>
               {agency && (
                  <p className="text-[9px] font-black text-secondary uppercase tracking-[0.15em] flex items-center gap-1.5 truncate">
                    {agency.name}
                    {isPackager && <Package className="w-2.5 h-2.5 text-secondary animate-pulse" />}
                  </p>
               )}
            </div>
          </div>
        </div>

        {/* Tactical Metrics Grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-4 pt-5 border-t border-white/5 relative z-10 mt-auto">
          <div className="space-y-1">
            <div className="text-[8px] uppercase font-black tracking-[0.2em] text-muted-foreground/40">Market Ask</div>
            <div className="font-display font-black text-sm text-success tracking-tighter">{formatMoney(talent.fee)}</div>
          </div>
          <div className="space-y-1 text-right">
            <div className="text-[8px] uppercase font-black tracking-[0.2em] text-muted-foreground/40">Prestige</div>
            <div className="font-display font-black text-sm text-primary tracking-tighter">★ {talent.prestige}</div>
          </div>
          <div className="space-y-1">
            <div className="text-[8px] uppercase font-black tracking-[0.2em] text-muted-foreground/40">BO Draw</div>
            <div className="font-display font-black text-sm text-foreground/80 tracking-tighter">{talent.draw}</div>
          </div>
          <div className="space-y-1 text-right">
            <div className="text-[8px] uppercase font-black tracking-[0.2em] text-muted-foreground/40">Vibe</div>
            <div className="font-display font-black text-sm text-foreground/80 tracking-tighter uppercase italic">
              {talent.psychology?.mood > 70 ? 'PEAK' : talent.psychology?.mood > 40 ? 'STEADY' : 'VOLATILE'}
            </div>
          </div>
        </div>
      </div>
    </TooltipWrapper>
  );
};
