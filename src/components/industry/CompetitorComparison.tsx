import React, { useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Cell } from 'recharts';
import { formatMoney } from '@/engine/utils';
import { cn } from '@/lib/utils';
import { Building2, Wallet, Film, Trophy, TrendingUp } from 'lucide-react';

interface CompetitorComparisonProps {
  className?: string;
}

export const CompetitorComparison: React.FC<CompetitorComparisonProps> = ({ className }) => {
  const gameState = useGameStore(s => s.gameState);
  
  if (!gameState) return null;

  const { studio, rivals } = useMemo(() => {
    return {
      studio: gameState.studio,
      rivals: Object.values(gameState.entities.rivals),
    };
  }, [gameState]);

  // Prepare bar chart data
  const financialData = useMemo(() => {
    const allStudios = [
      { name: studio.name.slice(0, 10), cash: gameState.finance.cash, prestige: studio.prestige, isPlayer: true },
      ...rivals.map(r => ({
        name: r.name.slice(0, 10),
        cash: r.cash,
        prestige: r.prestige,
        isPlayer: false,
      })),
    ];
    return allStudios.sort((a, b) => b.cash - a.cash);
  }, [studio, rivals, gameState.finance.cash]);

  // Prepare radar chart data for multi-dimensional comparison
  const radarData = useMemo(() => {
    const maxCash = Math.max(gameState.finance.cash, ...rivals.map(r => r.cash)) || 1;
    const maxProjects = Math.max(
      Object.keys(gameState.entities.projects).length,
      ...rivals.map(r => Object.keys(r.projects || {}).length)
    ) || 1;

    return [
      {
        metric: 'Cash',
        player: (gameState.finance.cash / maxCash) * 100,
        avgRival: rivals.reduce((sum, r) => sum + r.cash, 0) / (rivals.length || 1) / maxCash * 100,
      },
      {
        metric: 'Prestige',
        player: studio.prestige,
        avgRival: rivals.reduce((sum, r) => sum + r.prestige, 0) / (rivals.length || 1),
      },
      {
        metric: 'Projects',
        player: (Object.keys(gameState.entities.projects).length / maxProjects) * 100,
        avgRival: rivals.reduce((sum, r) => sum + Object.keys(r.projects || {}).length, 0) / (rivals.length || 1) / maxProjects * 100,
      },
      {
        metric: 'Strength',
        player: rivals.length > 0 
          ? 100 - (rivals.reduce((sum, r) => sum + r.strength, 0) / rivals.length) 
          : 50,
        avgRival: 50,
      },
    ];
  }, [studio, rivals, gameState]);

  const getRank = (value: number, values: number[], ascending = false) => {
    const sorted = [...values].sort((a, b) => ascending ? a - b : b - a);
    return sorted.indexOf(value) + 1;
  };

  const allCashValues = [gameState.finance.cash, ...rivals.map(r => r.cash)];
  const allPrestigeValues = [studio.prestige, ...rivals.map(r => r.prestige)];
  
  const cashRank = getRank(gameState.finance.cash, allCashValues);
  const prestigeRank = getRank(studio.prestige, allPrestigeValues);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Rank Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Cash Rank</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black font-display text-primary">#{cashRank}</span>
            <span className="text-xs text-muted-foreground">of {allCashValues.length}</span>
          </div>
        </div>
        
        <div className="p-3 rounded-lg bg-secondary/5 border border-secondary/20">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-4 h-4 text-secondary" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Prestige Rank</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black font-display text-secondary">#{prestigeRank}</span>
            <span className="text-xs text-muted-foreground">of {allPrestigeValues.length}</span>
          </div>
        </div>
      </div>

      {/* Financial Comparison Chart */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Financial Power Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financialData} layout="vertical" margin={{ left: 0, right: 20, top: 5, bottom: 5 }}>
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={80}
                  tick={{ fontSize: 10, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-card border border-border p-2 rounded-lg shadow-lg">
                          <p className={cn("text-xs font-bold", data.isPlayer ? "text-primary" : "text-foreground")}>
                            {data.name} {data.isPlayer && '(You)'}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            Cash: {formatMoney(data.cash)}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            Prestige: {data.prestige}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="cash" 
                  radius={[0, 4, 4, 0]} 
                  maxBarSize={20}
                  fill="hsl(var(--primary))"
                >
                  {financialData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.isPlayer ? 'hsl(var(--primary))' : 'hsl(var(--muted))'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Multi-dimensional Radar Chart */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Competitive Position
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis 
                  dataKey="metric" 
                  tick={{ fontSize: 9, fontWeight: 600, fill: 'hsl(var(--muted-foreground))' }}
                />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Your Studio"
                  dataKey="player"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Radar
                  name="Avg Rival"
                  dataKey="avgRival"
                  stroke="hsl(var(--muted-foreground))"
                  fill="hsl(var(--muted-foreground))"
                  fillOpacity={0.1}
                  strokeWidth={1}
                  strokeDasharray="4 4"
                />
                <Legend 
                  wrapperStyle={{ fontSize: '10px' }}
                  iconType="circle"
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Rival List */}
      <div className="space-y-2">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Active Rivals</h4>
        <div className="space-y-2">
          {rivals.slice(0, 5).map((rival, i) => (
            <div 
              key={rival.id} 
              className="flex items-center justify-between p-2 rounded-lg bg-background/50 hover:bg-background transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-muted-foreground">#{i + 1}</span>
                <div>
                  <p className="text-xs font-bold">{rival.name}</p>
                  <p className="text-[9px] text-muted-foreground uppercase">{rival.archetype}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-mono font-bold">{formatMoney(rival.cash)}</p>
                <p className="text-[9px] text-muted-foreground">{rival.prestige} prestige</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
