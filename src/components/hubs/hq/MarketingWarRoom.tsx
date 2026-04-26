import React, { useState, useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { MarketingAngle, AudienceQuadrant } from '@/engine/types';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, TrendingUp, Users, Sparkles, DollarSign, X } from 'lucide-react';
import { calculateAudienceIndex } from '@/engine/systems/demographics';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface MarketingWarRoomProps {
  projectId: string;
  onClose?: () => void;
}

const QUADRANTS: { key: AudienceQuadrant; label: string }[] = [
  { key: 'male_under_25', label: 'M < 25' },
  { key: 'female_under_25', label: 'F < 25' },
  { key: 'male_over_25', label: 'M > 25' },
  { key: 'female_over_25', label: 'F > 25' },
  { key: 'four_quadrant', label: '4-Quadrant' },
];

export const MarketingWarRoom: React.FC<MarketingWarRoomProps> = ({ projectId, onClose }) => {
  const gameState = useGameStore(s => s.gameState);
  const launchMarketingCampaign = useGameStore(s => s.launchMarketingCampaign);
  const launchAwardsCampaign = useGameStore(s => s.launchAwardsCampaign);
  
  const studioCash = gameState?.finance.cash || 0;

  const project = useMemo(() => 
    gameState?.entities.projects[projectId],
    [gameState, projectId]
  );

  const [campaignType, setCampaignType] = useState<'marketing' | 'awards'>('marketing');
  const [selectedTier, setSelectedTier] = useState<string>('Standard');
  const [selectedQuadrant, setSelectedQuadrant] = useState<AudienceQuadrant>(project?.targetDemographic || 'four_quadrant');
  const [selectedAngle, setSelectedAngle] = useState<MarketingAngle>((project?.marketingCampaign?.primaryAngle as MarketingAngle) || 'SELL_THE_STORY');

  const resonanceScores = useMemo(() => {
    if (!project) return {};
    return QUADRANTS.reduce((acc, q) => {
      acc[q.key] = calculateAudienceIndex(project, q.key);
      return acc;
    }, {} as Record<string, number>);
  }, [project]);

  if (!project) return null;

  const handleLaunch = () => {
    if (campaignType === 'marketing') {
      launchMarketingCampaign(projectId, selectedTier as 'Standard' | 'Tentpole' | 'Saturation', selectedAngle, selectedQuadrant);
    } else {
      launchAwardsCampaign(projectId, selectedTier as 'Grassroots' | 'Trade' | 'Blitz');
    }
    if (onClose) onClose();
  };

  const currentResonance = resonanceScores[selectedQuadrant] || 1.0;

  return (
    <div className="w-full max-w-5xl mx-auto bg-black/95 border border-white/5 rounded-none overflow-hidden text-left shadow-[0_0_100px_rgba(0,0,0,0.8)] backdrop-blur-3xl relative">
      <div className="bg-white/[0.02] border-b border-white/5 p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[120px] -mr-32 -mt-32" />
        <div className="flex justify-between items-center relative z-10">
          <div className="flex items-center gap-8">
             <div className="w-16 h-16 rounded-none bg-primary/5 border border-primary/20 flex items-center justify-center shadow-2xl">
                <Target className="w-8 h-8 text-primary" strokeWidth={3} />
             </div>
             <div>
                <h3 className="text-4xl font-display font-black uppercase italic tracking-tighter leading-none mb-3 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">CAMPAIGN_COMMAND_CENTER</h3>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/30 italic mt-1">STRATEGIC_OVERRIDE • {project.title.toUpperCase()}</p>
             </div>
          </div>
          <div className="flex items-center gap-10">
            <div className="text-right">
               <p className="text-[9px] font-black uppercase text-muted-foreground/20 tracking-[0.2em] italic mb-1">AVAILABLE_LIQUIDITY</p>
               <p className="text-2xl font-display font-black italic tracking-tighter text-primary drop-shadow-[0_0_20px_rgba(var(--primary),0.3)]">
                 {formatCurrency(studioCash)}
               </p>
            </div>
            {onClose && (
              <Button variant="ghost" size="icon" aria-label="Close" onClick={onClose} className="h-12 w-12 hover:bg-white/5 border border-transparent hover:border-white/10 rounded-none">
                <X className="h-6 w-6" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="p-10 space-y-12">
        <div className="grid grid-cols-12 gap-12">
          {/* Left Column: Strategic Controls */}
          <div className="col-span-7 space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/30 flex items-center gap-3 italic">
                <Users className="w-3.5 h-3.5" strokeWidth={3} /> CAMPAIGN_OBJECTIVE
              </label>
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant={campaignType === 'marketing' ? 'default' : 'outline'} 
                  className={cn("h-16 font-black uppercase italic tracking-widest", campaignType === 'marketing' ? "bg-primary text-black shadow-[0_0_20px_rgba(var(--primary),0.2)]" : "bg-white/[0.02] border-white/5 hover:border-white/20 text-muted-foreground/40")}
                  onClick={() => { setCampaignType('marketing'); setSelectedTier('Standard'); }}
                >
                  <DollarSign className="w-4 h-4 mr-3" strokeWidth={3} /> REVENUE_GENERATION
                </Button>
                <Button 
                  variant={campaignType === 'awards' ? 'default' : 'outline'} 
                   className={cn("h-16 font-black uppercase italic tracking-widest", campaignType === 'awards' ? "bg-amber-500 text-black border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]" : "bg-white/[0.02] border-white/5 hover:border-white/20 text-muted-foreground/40")}
                  onClick={() => { setCampaignType('awards'); setSelectedTier('Grassroots'); }}
                >
                  <Sparkles className="w-4 h-4 mr-3" strokeWidth={3} /> PRESTIGE_MAXIMIZATION
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/30 flex items-center gap-3 italic">
                <TrendingUp className="w-3.5 h-3.5" strokeWidth={3} /> ALLOCATION_SCALE
              </label>
              <Select value={selectedTier} onValueChange={setSelectedTier}>
                <SelectTrigger className="h-16 bg-black/40 border-white/10 rounded-none font-black uppercase tracking-widest italic text-xs">
                  <SelectValue placeholder="SELECT_TIER" />
                </SelectTrigger>
                <SelectContent className="rounded-none bg-black/95 border-white/10">
                  {campaignType === 'marketing' ? (
                    <>
                      <SelectItem value="Standard" className="font-black uppercase tracking-widest italic text-[10px] py-4">STANDARD_ALLOCATION ($2.0M)</SelectItem>
                      <SelectItem value="Tentpole" className="font-black uppercase tracking-widest italic text-[10px] py-4">TENTPOLE_ALLOCATION ($10.0M)</SelectItem>
                      <SelectItem value="Saturation" className="font-black uppercase tracking-widest italic text-[10px] py-4">SATURATION_ALLOCATION ($50.0M)</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="Grassroots" className="font-black uppercase tracking-widest italic text-[10px] py-4">GRASSROOTS_EFFORT ($0.25M)</SelectItem>
                      <SelectItem value="Trade" className="font-black uppercase tracking-widest italic text-[10px] py-4">TRADE_CAMPAIGN ($1.0M)</SelectItem>
                      <SelectItem value="Blitz" className="font-black uppercase tracking-widest italic text-[10px] py-4">BLITZ_CAMPAIGN ($5.0M)</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            {campaignType === 'marketing' && (
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/30 flex items-center gap-3 italic">
                  <Target className="w-3.5 h-3.5" strokeWidth={3} /> CREATIVE_VECTOR
                </label>
                <Select value={selectedAngle} onValueChange={(v) => setSelectedAngle(v as MarketingAngle)}>
                  <SelectTrigger className="h-16 bg-black/40 border-white/10 rounded-none font-black uppercase tracking-widest italic text-xs">
                    <SelectValue placeholder="SELECT_VECTOR" />
                  </SelectTrigger>
                  <SelectContent className="rounded-none bg-black/95 border-white/10">
                    <SelectItem value="SELL_THE_SPECTACLE" className="font-black uppercase tracking-widest italic text-[10px] py-4">SELL_THE_SPECTACLE</SelectItem>
                    <SelectItem value="SELL_THE_STORY" className="font-black uppercase tracking-widest italic text-[10px] py-4">SELL_THE_STORY</SelectItem>
                    <SelectItem value="SELL_THE_STARS" className="font-black uppercase tracking-widest italic text-[10px] py-4">SELL_THE_STARS</SelectItem>
                    <SelectItem value="FAMILY_ADVENTURE" className="font-black uppercase tracking-widest italic text-[10px] py-4">FAMILY_ADVENTURE</SelectItem>
                    <SelectItem value="CONTROVERSY" className="font-black uppercase tracking-widest italic text-[10px] py-4">CONTROVERSY_STIMULATION</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Right Column: Audience Resonance & Intelligence */}
          <div className="col-span-5 bg-white/[0.01] border border-white/5 p-8 space-y-10 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -mr-16 -mt-16 group-hover:opacity-100 opacity-30 transition-opacity" />
            
            <div className="space-y-6 relative z-10">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary italic mb-6">AUDIENCE_INTELLIGENCE</h4>
              <div className="grid grid-cols-2 gap-4">
                {QUADRANTS.map(q => {
                  const isSelected = selectedQuadrant === q.key;
                  const score = resonanceScores[q.key] || 1.0;
                  return (
                    <button 
                      key={q.key}
                      onClick={() => campaignType === 'marketing' && setSelectedQuadrant(q.key)}
                      disabled={campaignType !== 'marketing'}
                      aria-pressed={isSelected}
                      className={cn(
                        "p-5 rounded-none border transition-all duration-700 text-left space-y-2 relative group/btn",
                        isSelected ? "bg-primary/10 border-primary shadow-[0_0_20px_rgba(var(--primary),0.1)] scale-[1.02] z-10" : "bg-black/40 border-white/5 hover:border-white/20",
                        campaignType !== 'marketing' && "opacity-40 cursor-not-allowed"
                      )}
                    >
                      <p className={cn("text-[9px] font-black uppercase tracking-[0.2em] italic", isSelected ? "text-primary" : "text-muted-foreground/30")}>{q.label}</p>
                      <div className="flex items-center gap-3">
                         <span className={cn("text-2xl font-display font-black italic tracking-tighter", isSelected ? "text-foreground" : "text-foreground/40")}>{score.toFixed(2)}X</span>
                         <div className={cn("w-1.5 h-1.5 rounded-none", score > 1.2 ? "bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]" : score > 0.8 ? "bg-amber-500" : "bg-red-500")} />
                      </div>
                      {isSelected && <Target className="absolute top-4 right-4 w-3 h-3 text-primary animate-pulse" strokeWidth={3} />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-6 pt-10 border-t border-white/5 relative z-10">
               <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-black uppercase text-muted-foreground/20 tracking-[0.3em] italic">EFFICIENCY_RATING</span>
                  <span className={cn("text-2xl font-display font-black italic tracking-tighter", currentResonance >= 1.2 ? "text-primary drop-shadow-[0_0_15px_rgba(var(--primary),0.3)]" : "text-foreground")}>
                    {(currentResonance * 100).toFixed(0)}%
                  </span>
               </div>
               <div className="h-1.5 bg-black/60 rounded-none overflow-hidden border border-white/5">
                 <div 
                   className={cn("h-full transition-all duration-1000", currentResonance >= 1.2 ? "bg-primary" : "bg-white/40")} 
                   style={{ width: `${Math.min(currentResonance * 50, 100)}%` }} 
                 />
               </div>
               <p className="text-[10px] leading-relaxed text-muted-foreground/40 italic uppercase tracking-wider border-l-2 border-white/5 pl-6 py-2">
                 {currentResonance > 1.3 ? "OPTIMAL_ALIGNMENT_DETECTED. EVERY FISCAL UNIT WILL YIELD MAXIMUM BUZZ_RETURNS." : 
                  currentResonance > 0.9 ? "NOMINAL_PRESENCE_CONFIRMED. STANDARD EFFICIENCY PROJECTED FOR THIS VECTOR." :
                  "SUB_OPTIMAL_STRATEGY. AUDIENCE RESISTANCE WILL DEGRADE CAMPAIGN IMPACT."}
               </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/[0.02] border-t border-white/5 p-10 flex justify-between items-center">
         <div className="space-y-2">
            <span className="text-[10px] font-black uppercase text-muted-foreground/20 tracking-[0.4em] italic leading-none">TOTAL_STRATEGIC_SPEND</span>
            <div className="text-5xl font-display font-black italic tracking-tighter text-foreground drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">
               {formatCurrency(0).toUpperCase()}
            </div>
         </div>
         <div className="flex gap-6">
            <Button 
               className="h-16 px-16 bg-primary text-black font-black uppercase italic tracking-[0.2em] text-[10px] rounded-none shadow-[0_0_30px_rgba(var(--primary),0.2)] hover:scale-105 transition-all duration-700"
               onClick={handleLaunch}
            >
               EXECUTE_STRATEGY
            </Button>
         </div>
      </div>
    </div>
  );
};
