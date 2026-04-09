import React, { useState, useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { MarketingAngle, MarketingCampaign, AudienceQuadrant } from '@/engine/types';
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
import { Progress } from '@/components/ui/progress';
import { Target, TrendingUp, AlertCircle, Users, Sparkles, DollarSign } from 'lucide-react';
import { calculateAudienceIndex } from '@/engine/systems/demographics';
import { formatCurrency } from '@/lib/utils';
import { TooltipWrapper } from '@/components/ui/tooltip-wrapper';
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
      launchMarketingCampaign(projectId, selectedTier as any, selectedAngle, selectedQuadrant);
    } else {
      launchAwardsCampaign(projectId, selectedTier as any);
    }
    if (onClose) onClose();
  };

  const currentResonance = resonanceScores[selectedQuadrant] || 1.0;

  return (
    <Card className="w-full max-w-4xl mx-auto glass-panel border-white/10 overflow-hidden text-left shadow-2xl">
      <CardHeader className="bg-gradient-to-r from-primary/20 to-secondary/10 border-b border-white/5 p-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shadow-inner">
                <Target className="w-6 h-6 text-primary" />
             </div>
             <div>
                <CardTitle className="text-3xl font-black uppercase italic tracking-tighter leading-none">Campaign Center</CardTitle>
                <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mt-1">Strategic Command • {project.title}</p>
             </div>
          </div>
          <div className="flex flex-col items-end">
             <Badge variant="outline" className="text-primary border-primary bg-primary/5 font-mono">
               {formatCurrency(studioCash)}
             </Badge>
             <span className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-wider mt-1">Available Liquidity</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Left Column: Strategic Controls */}
          <div className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
                <Users className="w-3 h-3" /> Objective
              </label>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant={campaignType === 'marketing' ? 'default' : 'outline'} 
                  className={cn("h-12 font-black uppercase italic tracking-wider", campaignType === 'marketing' && "bg-primary text-black")}
                  onClick={() => { setCampaignType('marketing'); setSelectedTier('Standard'); }}
                >
                  <DollarSign className="w-4 h-4 mr-2" /> Revenue
                </Button>
                <Button 
                  variant={campaignType === 'awards' ? 'default' : 'outline'} 
                   className={cn("h-12 font-black uppercase italic tracking-wider", campaignType === 'awards' && "bg-amber-500 text-black border-amber-500")}
                  onClick={() => { setCampaignType('awards'); setSelectedTier('Grassroots'); }}
                >
                  <Sparkles className="w-4 h-4 mr-2" /> Prestige
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-3 h-3" /> Campaign Scale
              </label>
              <Select value={selectedTier} onValueChange={setSelectedTier}>
                <SelectTrigger className="h-14 bg-white/5 border-white/10 font-bold uppercase tracking-widest">
                  <SelectValue placeholder="Select Tier" />
                </SelectTrigger>
                <SelectContent>
                  {campaignType === 'marketing' ? (
                    <>
                      <SelectItem value="Standard">Standard ($2M)</SelectItem>
                      <SelectItem value="Tentpole">Tentpole ($10M)</SelectItem>
                      <SelectItem value="Saturation">Saturation ($50M)</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="Grassroots">Grassroots ($0.25M)</SelectItem>
                      <SelectItem value="Trade">Trade ($1M)</SelectItem>
                      <SelectItem value="Blitz">Blitz ($5M)</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            {campaignType === 'marketing' && (
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
                  <Target className="w-3 h-3" /> Creative Angle
                </label>
                <Select value={selectedAngle} onValueChange={(v) => setSelectedAngle(v as MarketingAngle)}>
                  <SelectTrigger className="h-14 bg-white/5 border-white/10 font-bold uppercase tracking-widest">
                    <SelectValue placeholder="Select Angle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SELL_THE_SPECTACLE">Sell the Spectacle</SelectItem>
                    <SelectItem value="SELL_THE_STORY">Sell the Story</SelectItem>
                    <SelectItem value="SELL_THE_STARS">Sell the Stars</SelectItem>
                    <SelectItem value="FAMILY_ADVENTURE">Family Adventure</SelectItem>
                    <SelectItem value="CONTROVERSY">Controversy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Right Column: Audience Resonance & Intelligence */}
          <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-8 space-y-8 shadow-inner">
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Audience Intelligence</h4>
              <div className="grid grid-cols-2 gap-3">
                {QUADRANTS.map(q => {
                  const isSelected = selectedQuadrant === q.key;
                  const score = resonanceScores[q.key] || 1.0;
                  return (
                    <button 
                      key={q.key}
                      onClick={() => campaignType === 'marketing' && setSelectedQuadrant(q.key)}
                      disabled={campaignType !== 'marketing'}
                      className={cn(
                        "p-4 rounded-2xl border transition-all text-left space-y-1 relative group",
                        isSelected ? "bg-primary/20 border-primary shadow-lg scale-105 z-10" : "bg-black/20 border-white/5 hover:border-white/20",
                        campaignType !== 'marketing' && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <p className={cn("text-[9px] font-black uppercase tracking-widest", isSelected ? "text-primary" : "text-muted-foreground")}>{q.label}</p>
                      <div className="flex items-center gap-2">
                         <span className="text-xl font-black italic tracking-tighter text-white">{score.toFixed(2)}x</span>
                         <div className={cn("w-2 h-2 rounded-full", score > 1.2 ? "bg-green-500" : score > 0.8 ? "bg-amber-500" : "bg-red-500")} />
                      </div>
                      {isSelected && <Target className="absolute top-3 right-3 w-3 h-3 text-primary animate-pulse" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5">
               <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Projected Efficiency</span>
                  <span className={cn("text-lg font-black italic tracking-tighter", currentResonance >= 1.2 ? "text-green-400" : "text-white")}>
                    {(currentResonance * 100).toFixed(0)}%
                  </span>
               </div>
               <Progress value={currentResonance * 50} className="h-2 bg-black/40" />
               <p className="text-[10px] leading-relaxed text-muted-foreground italic">
                 {currentResonance > 1.3 ? "Excellent alignment. Every dollar will yield massive buzz returns." : 
                  currentResonance > 0.9 ? "Strong presence. Standard efficiency expected for this demographic." :
                  "Mismatched strategy. Audience resistance will bleed your budget."}
               </p>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="bg-black/40 border-t border-white/5 p-8 flex justify-between items-center">
         <div className="space-y-1">
            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Total Strategic Spend</span>
            <div className="text-3xl font-black italic tracking-tighter text-white font-mono">
               {formatCurrency(0)} {/* Simplified: Just for look, cost is taken on launch */}
            </div>
         </div>
         <div className="flex gap-4">
            <Button variant="ghost" onClick={onClose} className="uppercase font-black tracking-widest text-xs h-14 px-8">Abort</Button>
            <Button 
               className="h-14 px-12 bg-primary text-black font-black uppercase italic tracking-wider hover:scale-105 transition-transform"
               onClick={handleLaunch}
            >
               Execute Strategy
            </Button>
         </div>
      </CardFooter>
    </Card>
  );
};
