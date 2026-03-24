import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, TrendingUp, TrendingDown, Minus, Snowflake } from 'lucide-react';
import { GenreTrend } from '@/engine/types';

export function TrendBoard() {
  const trends = useGameStore(state => state.gameState?.market.trends) || [];
  
  if (trends.length === 0) {
    return (
      <Card className="border-border/40 bg-card/40 backdrop-blur-md shadow-sm">
        <CardHeader>
          <CardTitle className="font-display tracking-tight">Market Trends</CardTitle>
          <CardDescription>Audience tastes are currently unpredictable.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const getTrendIcon = (t: GenreTrend) => {
    switch(t.direction) {
      case 'rising': return <TrendingUp className="w-4 h-4 text-green-500 drop-shadow-[0_0_4px_rgba(34,197,94,0.4)]" />;
      case 'cooling': return <TrendingDown className="w-4 h-4 text-blue-400 drop-shadow-[0_0_4px_rgba(96,165,250,0.4)]" />;
      case 'dead': return <Snowflake className="w-4 h-4 text-slate-300" />;
      case 'stable': 
        if (t.heat > 80) return <Flame className="w-4 h-4 text-orange-500 drop-shadow-[0_0_4px_rgba(249,115,22,0.4)] animate-pulse" />;
        return <Minus className="w-4 h-4 text-muted-foreground" />;
      default: return null;
    }
  };

  const getHeatBadge = (heat: number) => {
    if (heat > 80) return <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/30 hover:bg-orange-500/20 text-[10px] uppercase font-bold tracking-widest px-1.5 py-0 shadow-[0_0_8px_rgba(249,115,22,0.2)]">Sizzling</Badge>;
    if (heat > 50) return <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0 bg-secondary/20 text-secondary hover:bg-secondary/30">Warm</Badge>;
    if (heat > 20) return <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0 border-border/60">Cool</Badge>;
    return <Badge variant="destructive" className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0 bg-destructive/10 text-destructive border-destructive/30 hover:bg-destructive/20 shadow-[0_0_8px_rgba(239,68,68,0.2)]">Cold</Badge>;
  };

  return (
    <Card className="h-full border-border/40 bg-card/40 backdrop-blur-md shadow-sm hover:shadow-md hover:bg-card/60 transition-all duration-300">
      <CardHeader className="pb-3 border-b border-border/30">
        <CardTitle className="text-sm font-display font-black uppercase tracking-widest text-foreground/80 flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-400 drop-shadow-[0_0_5px_rgba(251,146,60,0.5)] animate-pulse" /> Market Pulse
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-3">
        <div className="space-y-2">
          {trends.map(t => (
            <div key={t.genre} className="flex items-center justify-between p-2.5 rounded-lg bg-card/50 border border-border/40 shadow-sm hover:border-primary/30 transition-colors group">
              <div className="flex items-center gap-2.5">
                <span className="font-semibold text-sm group-hover:text-primary transition-colors">{t.genre}</span>
                {getTrendIcon(t)}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-mono font-medium text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded shadow-inner">{(0.8 + ((t.heat / 100) * 0.7)).toFixed(2)}x</span>
                {getHeatBadge(t.heat)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
