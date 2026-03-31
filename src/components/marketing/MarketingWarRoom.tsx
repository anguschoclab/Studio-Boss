import React, { useState, useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Project, MarketingAngle, MarketingCampaign } from '@/engine/types';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
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
import { Globe, Home, Target, TrendingUp, AlertCircle } from 'lucide-react';
import { evaluateMarketingEfficiency } from '@/engine/systems/marketing/efficiencyEvaluator';
import { formatCurrency } from '@/lib/utils'; // Assuming this exists

interface MarketingWarRoomProps {
  projectId: string;
  onClose?: () => void;
}

export const MarketingWarRoom: React.FC<MarketingWarRoomProps> = ({ projectId, onClose }) => {
  const gameState = useGameStore(s => s.gameState);
  const updateProject = useGameStore(s => s.updateProject);
  const studioCash = gameState?.finance.cash || 0;

  const project = useMemo(() => 
    Object.values(gameState?.studio.internal.projects || {}).find(p => p.id === projectId),
    [gameState, projectId]
  );

  const [domesticBudget, setDomesticBudget] = useState(project?.marketingCampaign?.domesticBudget || 0);
  const [foreignBudget, setForeignBudget] = useState(project?.marketingCampaign?.foreignBudget || 0);
  const [angle, setAngle] = useState<MarketingAngle>(project?.marketingCampaign?.primaryAngle || 'SELL_THE_STORY');

  if (!project) return null;

  const totalMarketingBudget = domesticBudget + foreignBudget;
  const isOverBudget = totalMarketingBudget > studioCash;

  const efficiencyPreview = useMemo(() => {
    const tempCampaign: MarketingCampaign = {
      domesticBudget,
      foreignBudget,
      primaryAngle: angle,
      weeksInMarketing: project.marketingCampaign?.weeksInMarketing || 1
    };
    return evaluateMarketingEfficiency(project, tempCampaign);
  }, [project, domesticBudget, foreignBudget, angle]);

  const handleSave = () => {
    if (isOverBudget) return;
    
    updateProject(projectId, {
      marketingCampaign: {
        domesticBudget,
        foreignBudget,
        primaryAngle: angle,
        weeksInMarketing: project.marketingCampaign?.weeksInMarketing || 1
      }
    });
    
    if (onClose) onClose();
  };

  return (
    <Card className="w-full max-w-4xl mx-auto glass-panel border-white/10 overflow-hidden">
      <CardHeader className="bg-primary/10 border-b border-white/5">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl font-black uppercase italic tracking-tighter">Marketing War Room</CardTitle>
            <p className="text-muted-foreground text-sm font-medium">Project: {project.title}</p>
          </div>
          <Badge variant="outline" className={isOverBudget ? "text-destructive border-destructive" : "text-primary border-primary"}>
            Studio Cash: {formatCurrency ? formatCurrency(studioCash) : `$${(studioCash / 1_000_000).toFixed(1)}M`}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Budget Controls */}
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between">
                <label className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                  <Home className="w-4 h-4" /> Domestic Spend
                </label>
                <span className="font-mono text-primary">{formatCurrency ? formatCurrency(domesticBudget) : `$${(domesticBudget / 1_000_000).toFixed(1)}M`}</span>
              </div>
              <Slider 
                value={[domesticBudget]} 
                max={Math.min(studioCash, project.budget * 2)} 
                step={100000} 
                onValueChange={([v]) => setDomesticBudget(v)}
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between">
                <label className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                  <Globe className="w-4 h-4" /> Foreign Spend
                </label>
                <span className="font-mono text-primary">{formatCurrency ? formatCurrency(foreignBudget) : `$${(foreignBudget / 1_000_000).toFixed(1)}M`}</span>
              </div>
              <Slider 
                value={[foreignBudget]} 
                max={Math.min(studioCash, project.budget * 2)} 
                step={100000} 
                onValueChange={([v]) => setForeignBudget(v)}
              />
            </div>

            <div className="space-y-4">
              <label className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                <Target className="w-4 h-4" /> Primary Angle
              </label>
              <Select value={angle} onValueChange={(v) => setAngle(v as MarketingAngle)}>
                <SelectTrigger className="w-full bg-white/5 border-white/10">
                  <SelectValue placeholder="Select Angle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SELL_THE_SPECTACLE">Sell the Spectacle</SelectItem>
                  <SelectItem value="SELL_THE_STORY">Sell the Story</SelectItem>
                  <SelectItem value="SELL_THE_STARS">Sell the Stars</SelectItem>
                  <SelectItem value="FAMILY_ADVENTURE">Family Adventure</SelectItem>
                  <SelectItem value="AWARDS_PUSH">Awards Push</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Projections & Feedback */}
          <div className="glass-panel p-6 bg-white/5 space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> Efficiency Multiplier
                </h4>
                <span className={`text-xl font-black ${efficiencyPreview.multiplier >= 1 ? 'text-green-400' : 'text-red-400'}`}>
                  {efficiencyPreview.multiplier.toFixed(2)}x
                </span>
              </div>
              <Progress value={efficiencyPreview.multiplier * 50} className="h-2" />
            </div>

            <div className="p-4 rounded bg-black/40 border border-white/5">
              <p className="text-sm leading-relaxed italic text-white/80">
                "{efficiencyPreview.feedbackText}"
              </p>
            </div>

            {isOverBudget && (
              <div className="flex items-center gap-2 text-destructive text-xs font-bold uppercase p-3 bg-destructive/10 border border-destructive/20 rounded">
                <AlertCircle className="w-4 h-4" />
                Warning: Total spend exceeds available studio cash.
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="bg-white/5 p-6 flex justify-between border-t border-white/10">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground font-bold uppercase">Total Campaign Cost</span>
          <span className={`text-2xl font-black ${isOverBudget ? 'text-destructive' : 'text-white'}`}>
            {formatCurrency ? formatCurrency(totalMarketingBudget) : `$${(totalMarketingBudget / 1_000_000).toFixed(1)}M`}
          </span>
        </div>
        <div className="flex gap-3">
          {onClose && <Button variant="ghost" onClick={onClose}>Cancel</Button>}
          <Button 
            disabled={isOverBudget} 
            className="bg-primary text-primary-foreground font-bold uppercase px-8"
            onClick={handleSave}
          >
            Finalize Strategy
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
