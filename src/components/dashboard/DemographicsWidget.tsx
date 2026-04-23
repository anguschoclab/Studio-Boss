import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { useGameStore } from '@/store/gameStore';

export const DemographicsWidget: React.FC = () => {
  const gameState = useGameStore((state) => state.gameState);
  if (!gameState) return null;
  
  const { culture } = gameState;

  // Transform engine culture data into chart data
  const chartData = Object.entries(culture.genrePopularity)
    .map(([genre, popularity]) => ({
      genre: genre.toUpperCase(),
      popularity: Math.round(popularity * 100),
      fill: `var(--color-${genre})`, // We can map these to CSS variables later
    }))
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 5); // Show top 5 genres

  const chartConfig = {
    popularity: {
      label: "POPULARITY",
      color: "rgba(var(--primary), 1)",
    },
  };

  return (
    <Card className="col-span-1 lg:col-span-1 border-white/5 bg-white/[0.01] backdrop-blur-3xl transition-all duration-700 overflow-hidden group rounded-none">
      <CardHeader className="pb-8 border-b border-white/5 p-8">
        <CardTitle className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] flex items-center gap-4 italic leading-none group">
          <span className="w-2 h-2 rounded-none bg-primary shadow-[0_0_15px_rgba(var(--primary),0.6)] animate-pulse" />
          <span className="group-hover:text-primary transition-colors">Audience Vector Analysis</span>
        </CardTitle>
        <CardDescription className="text-[9px] uppercase tracking-[0.4em] font-black text-muted-foreground/20 mt-4 italic">GENRE DOMINANCE METRICS</CardDescription>
      </CardHeader>
      <CardContent className="p-8">
        <div className="h-[220px] w-full mt-4">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="rgba(var(--primary), 0.4)" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="rgba(var(--primary), 1)" stopOpacity={1} />
                  </linearGradient>
                </defs>
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="genre" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 9, fontWeight: 900, letterSpacing: '0.1em' }}
                  width={100}
                />
                <ChartTooltip
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  content={<ChartTooltipContent className="bg-black/90 border-white/10 backdrop-blur-3xl text-[9px] font-display font-black uppercase tracking-widest shadow-2xl rounded-none p-4" />}
                />
                <Bar 
                  dataKey="popularity" 
                  fill="url(#barGradient)"
                  radius={0} 
                  barSize={12}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};
