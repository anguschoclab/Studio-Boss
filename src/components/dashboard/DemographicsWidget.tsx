import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Cell } from 'recharts';
import { useGameStore } from '@/store/gameStore';

import { useShallow } from 'zustand/react/shallow';

export const DemographicsWidget: React.FC = () => {
  const genrePopularity = useGameStore(useShallow((state) => state.gameState?.studio?.culture?.genrePopularity));
  if (!genrePopularity) return null;

  // Transform engine culture data into chart data
  const chartData = Object.entries(genrePopularity)
    .map(([genre, popularity]) => ({
      genre: genre.charAt(0).toUpperCase() + genre.slice(1),
      popularity: Math.round(popularity * 100),
      fill: `var(--color-${genre})`, // We can map these to CSS variables later
    }))
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 5); // Show top 5 genres

  const chartConfig = {
    popularity: {
      label: "Popularity",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <Card aria-label="Demographics Chart" className="col-span-1 animate-in zoom-in-95 duration-500 lg:col-span-1 border border-white/10 bg-gradient-to-br from-card/80 via-card/60 to-card/40 backdrop-blur-3xl shadow-[0_16px_48px_rgba(0,0,0,0.5)] hover:border-white/30 hover:shadow-[0_24px_64px_rgba(0,0,0,0.6)] transition-all duration-700 relative overflow-hidden group h-full">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[140px] pointer-events-none group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-1000" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-secondary/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-secondary/10 transition-colors duration-1000" />
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />

      <CardHeader className="pb-6 border-b border-white/10 relative z-10 bg-gradient-to-b from-white/5 to-transparent p-6">
        <CardTitle className="text-sm font-black text-white/90 uppercase tracking-[0.25em] flex items-center justify-between">
          <span className="flex items-center gap-3">
            <div className="relative flex items-center justify-center p-1.5 rounded-lg bg-primary/20 border border-primary/30 shadow-[0_0_15px_hsl(var(--primary)_/_0.3)]">
              <div className="w-2 h-2 rounded-full bg-primary relative z-10 shadow-[0_0_12px_hsl(var(--primary))] animate-pulse" />
            </div>
            <span className="group-hover:text-white transition-colors tracking-widest drop-shadow-md">Audience Trends</span>
          </span>
          <span className="text-[10px] px-3 py-1.5 rounded-md bg-black/60 font-mono tracking-[0.2em] border border-white/10 shadow-[inset_0_1px_4px_rgba(0,0,0,0.5)] text-foreground/90 backdrop-blur-md">DATA</span>
        </CardTitle>
        <CardDescription className="text-xs uppercase tracking-[0.2em] font-bold mt-3 text-muted-foreground/80 group-hover:text-muted-foreground/90 transition-colors duration-500">
          Current hottest genres
        </CardDescription>
      </CardHeader>

      <CardContent className="relative z-10 pt-8 pb-8 px-8">
        <div className="h-[280px] w-full mt-2 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent pointer-events-none z-0" />
          <ChartContainer config={chartConfig} className="h-full w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
                    <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={1} />
                  </linearGradient>
                  <filter id="barShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="rgba(0,0,0,0.6)" />
                  </filter>
                  <filter id="barGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                <XAxis type="number" hide domain={[0, 100]} />
                <YAxis 
                  dataKey="genre" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'hsl(var(--foreground))', fontSize: 13, fontWeight: 800 }}
                  width={120}
                />
                <ChartTooltip
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  content={<ChartTooltipContent className="bg-black/90 border-white/20 backdrop-blur-3xl text-xs font-mono uppercase shadow-[0_16px_48px_rgba(0,0,0,0.6)] rounded-xl px-5 py-4" />}
                />
                <Bar 
                  dataKey="popularity" 
                  radius={[0, 12, 12, 0]}
                  barSize={28}
                  animationDuration={2000}
                  animationEasing="ease-out"
                  background={{ fill: 'rgba(255,255,255,0.03)', radius: [0, 12, 12, 0] as any }}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill="url(#barGradient)"
                      style={{ filter: 'url(#barShadow) url(#barGlow)' }}
                      className="hover:opacity-100 hover:brightness-125 hover:drop-shadow-[0_0_15px_hsl(var(--primary))] transition-all duration-300 cursor-pointer"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};
