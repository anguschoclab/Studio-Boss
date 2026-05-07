import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame, TrendingUp, TrendingDown, Minus, Snowflake, Activity, Zap } from 'lucide-react';
import { GenreTrend } from '@/engine/types';

export function TrendBoard() {
  const trends = useGameStore(state => state.gameState?.market.trends) || [];
  
  if (trends.length === 0) {
    return (
      <Card className="rounded-none border-white/5 bg-white/[0.01] backdrop-blur-3xl shadow-2xl">
        <CardHeader>
          <CardTitle className="font-display font-black uppercase italic tracking-[0.2em] text-primary/60">MARKET_SENTIMENT_SCAN</CardTitle>
          <CardDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30 italic">AUDIENCE_TASTES_CURRENTLY_UNPREDICTABLE.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const getTrendIcon = (t: GenreTrend) => {
    switch(t.direction) {
      case 'rising': return <TrendingUp className="w-3.5 h-3.5 text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]" strokeWidth={3} />;
      case 'cooling': return <TrendingDown className="w-3.5 h-3.5 text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.4)]" strokeWidth={3} />;
      case 'dead': return <Snowflake className="w-3.5 h-3.5 text-slate-500" strokeWidth={3} />;
      case 'stable': 
        if (t.heat > 80) return <Flame className="w-3.5 h-3.5 text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.4)] animate-pulse" strokeWidth={3} />;
        return <Minus className="w-3.5 h-3.5 text-muted-foreground/40" strokeWidth={3} />;
      default: return null;
    }
  };

  const getHeatBadge = (heat: number) => {
    if (heat > 80) return <div className="px-2 py-0.5 bg-orange-500 text-black text-[8px] font-black uppercase tracking-[0.2em] italic shadow-2xl">SIZZLING</div>;
    if (heat > 50) return <div className="px-2 py-0.5 bg-primary text-black text-[8px] font-black uppercase tracking-[0.2em] italic shadow-2xl">WARM</div>;
    if (heat > 20) return <div className="px-2 py-0.5 bg-white/10 text-white/40 border border-white/10 text-[8px] font-black uppercase tracking-[0.2em] italic">STABLE</div>;
    return <div className="px-2 py-0.5 bg-rose-950 text-rose-500 border border-rose-500/30 text-[8px] font-black uppercase tracking-[0.2em] italic shadow-2xl">COLLAPSED</div>;
  };

  return (
    <Card className="h-full rounded-none border-white/5 bg-white/[0.01] backdrop-blur-3xl shadow-2xl hover:bg-white/[0.03] transition-all duration-700 overflow-hidden relative group">
      <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
        <Activity className="h-32 w-32 text-primary" strokeWidth={1} />
      </div>
      <CardHeader className="pb-6 border-b border-white/5 relative z-10">
        <CardTitle className="text-sm font-display font-black uppercase italic tracking-[0.4em] text-primary/60 flex items-center gap-4">
          <Zap className="w-4 h-4 text-primary fill-current" strokeWidth={3} /> MARKET_PULSE_ARRAY
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-8 relative z-10">
        <div className="space-y-4">
          {trends.map(t => (
            <div key={t.genre} className="flex items-center justify-between p-4 rounded-none bg-white/[0.02] border border-white/5 hover:border-primary/40 transition-all duration-700 group/item">
              <div className="flex items-center gap-4">
                <span className="font-display font-black text-xs uppercase italic tracking-widest text-foreground/80 group-hover/item:text-primary transition-colors">{t.genre}</span>
                {getTrendIcon(t)}
              </div>
              <div className="flex items-center gap-6">
                <span className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-widest italic">
                  VAL: <span className="text-foreground">{(0.8 + ((t.heat / 100) * 0.7)).toFixed(2)}X</span>
                </span>
                {getHeatBadge(t.heat)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
