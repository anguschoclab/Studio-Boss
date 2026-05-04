import React from 'react';
import { Package } from 'lucide-react';
import { Talent } from '@/engine/types';
import { formatMoney } from '@/engine/utils';
import { AGENCY_ARCHETYPES } from '@/engine/data/archetypes';
import { cn } from '@/lib/utils';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { TooltipWrapper } from '@/components/ui/tooltip-wrapper';
import { TalentAvatar } from './TalentAvatar';
import { getTalentVisualAge, getCountryFlag } from '@/engine/generators/avatarGenerator';
import { useAgencyMap } from '@/hooks/useTalentMap';

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
  onClick,
  tooltip 
}) => {
  const { selectTalent } = useUIStore();
  const gameState = useGameStore(s => s.gameState);
  const currentWeek = gameState?.week ?? 1;
  const agencyMap = useAgencyMap();
  const agency = talent.agencyId ? agencyMap.get(talent.agencyId) : null;
  const archetype = agency?.archetype ? AGENCY_ARCHETYPES[agency.archetype] : null;

  const isPackager = agency?.currentMotivation === 'THE_PACKAGER' ||
    (archetype?.description?.toLowerCase() || '').includes('package') ||
    (archetype?.description?.toLowerCase() || '').includes('packaging');

  const starPower = talent.starMeter || 50;

  const visualAge = getTalentVisualAge(talent, currentWeek);
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
    <TooltipWrapper tooltip={tooltip || `VIEW ${talent.name.toUpperCase()} STRATEGIC PROFILE`} side="top">
      <div 
        onClick={handleClick}
        className={cn(
          "p-6 border rounded-none bg-white/[0.01] glass-card transition-all duration-700 group relative overflow-hidden cursor-pointer h-full flex flex-col shadow-2xl",
          talent.prestige >= 80
            ? 'border-primary/30 bg-white/[0.03] shadow-[0_0_40px_rgba(var(--primary),0.05)]'
            : 'border-white/5',
          "hover:border-primary/50 hover:bg-white/[0.05] active:scale-[0.98]",
          className
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

        {/* Header: Portrait + Star Bar + Meta */}
        <div className="flex gap-6 relative z-10 mb-8">
          {/* Portrait Container */}
          <div className="relative shrink-0">
            <TalentAvatar talent={talent} size="lg" className="rounded-none border border-white/10 group-hover:border-primary/40 transition-all duration-700 shadow-xl" />
            
            {/* Vertical Star Power Bar (Design Bible 13.1) */}
            <div className="absolute -right-2 top-0 bottom-0 w-2 bg-black/60 rounded-none overflow-hidden border border-white/5">
               <div 
                 className="absolute bottom-0 left-0 right-0 bg-primary transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(var(--primary),0.6)]" 
                 style={{ height: `${starPower}%` }} 
               >
                 <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
               </div>
            </div>
          </div>
          
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-display font-black text-xl text-foreground/90 tracking-tighter uppercase italic leading-none group-hover:text-primary transition-all duration-700 truncate drop-shadow-[0_0_10px_rgba(255,255,255,0.05)]">
                  {talent.name}
                </h4>
              </div>
              
              <div className="flex items-center gap-3">
                 <div className="bg-primary text-black font-black uppercase tracking-[0.2em] text-[8px] h-5 border-none px-2 flex items-center justify-center rounded-none italic shadow-[0_0_10px_rgba(var(--primary),0.2)]">
                   {talent.roles[0]}
                 </div>
                 {talent.hasRazzie && (
                    <div className="bg-red-500 text-white font-black uppercase tracking-[0.2em] text-[8px] h-5 border-none px-2 flex items-center justify-center rounded-none italic shadow-[0_0_10px_rgba(239,68,68,0.2)]">RAZZIE</div>
                 )}
              </div>
            </div>

            <div className="space-y-2">
               <div className="flex items-center gap-3">
                 <span className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.25em] italic">{visualAge}Y {genderSymbol}</span>
                 <span className="w-1 h-1 bg-white/10" />
                 <span className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.25em] truncate italic">{talent.demographics.country.toUpperCase()}</span>
               </div>
               {agency && (
                  <p className="text-[9px] font-black text-secondary uppercase tracking-[0.2em] flex items-center gap-2 truncate italic group-hover:text-secondary/80 transition-all duration-700">
                    {agency.name.toUpperCase()}
                    {isPackager && <Package className="w-3 h-3 text-secondary animate-pulse" />}
                  </p>
               )}
            </div>
          </div>
        </div>

        {/* Tactical Metrics Grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-6 pt-6 border-t border-white/5 relative z-10 mt-auto">
          <div className="space-y-2">
            <div className="text-[8px] uppercase font-black tracking-[0.3em] text-muted-foreground/20 italic">MARKET ASK</div>
            <div className="font-display font-black text-sm text-emerald-400 tracking-tighter italic leading-none">{formatMoney(talent.fee).toUpperCase()}</div>
          </div>
          <div className="space-y-2 text-right">
            <div className="text-[8px] uppercase font-black tracking-[0.3em] text-muted-foreground/20 italic">PRESTIGE</div>
            <div className="font-display font-black text-sm text-primary tracking-tighter italic leading-none drop-shadow-[0_0_10px_rgba(var(--primary),0.3)]">★ {talent.prestige}</div>
          </div>
          <div className="space-y-2">
            <div className="text-[8px] uppercase font-black tracking-[0.3em] text-muted-foreground/20 italic">BO DRAW</div>
            <div className="font-display font-black text-sm text-foreground/70 tracking-tighter italic leading-none">{talent.draw}</div>
          </div>
          <div className="space-y-2 text-right">
            <div className="text-[8px] uppercase font-black tracking-[0.3em] text-muted-foreground/20 italic">VIBE</div>
            <div className="font-display font-black text-sm text-foreground/70 tracking-tighter uppercase italic leading-none">
              {talent.psychology?.mood > 70 ? 'PEAK' : talent.psychology?.mood > 40 ? 'STEADY' : 'VOLATILE'}
            </div>
          </div>
        </div>
      </div>
    </TooltipWrapper>
  );
};
