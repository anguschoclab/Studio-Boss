import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, TrendingUp, TrendingDown, Minus, Snowflake } from 'lucide-react';
import { GenreTrend } from '@/engine/types';

export function TrendBoard() {
  const trends = useGameStore(state => state.gameState?.trends) || [];
  
  if (trends.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Market Trends</CardTitle>
          <CardDescription>Audience tastes are currently unpredictable.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const getTrendIcon = (t: GenreTrend) => {
    switch(t.direction) {
      case 'rising': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'cooling': return <TrendingDown className="w-4 h-4 text-blue-400" />;
      case 'dead': return <Snowflake className="w-4 h-4 text-slate-300" />;
      case 'stable': 
        if (t.heat > 80) return <Flame className="w-4 h-4 text-orange-500" />;
        return <Minus className="w-4 h-4 text-neutral-400" />;
      default: return null;
    }
  };

  const getHeatBadge = (heat: number) => {
    if (heat > 80) return <Badge className="bg-orange-500 hover:bg-orange-600">Sizzling</Badge>;
    if (heat > 50) return <Badge variant="secondary">Warm</Badge>;
    if (heat > 20) return <Badge variant="outline">Cool</Badge>;
    return <Badge variant="destructive">Ice Cold</Badge>;
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-400" /> Market Trends
        </CardTitle>
        <CardDescription>Tracking audience tastes and box office multipliers.</CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="space-y-3">
          {trends.map(t => (
            <div key={t.genre} className="flex items-center justify-between p-2 rounded bg-muted/50 border">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{t.genre}</span>
                {getTrendIcon(t)}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground mr-1">Mult: {(0.8 + ((t.heat / 100) * 0.7)).toFixed(2)}x</span>
                {getHeatBadge(t.heat)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
