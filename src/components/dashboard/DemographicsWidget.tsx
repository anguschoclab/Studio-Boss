import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Cell } from 'recharts';
import { useGameStore } from '@/store/gameStore';

export const DemographicsWidget: React.FC = () => {
  const gameState = useGameStore((state) => state.gameState);
  if (!gameState) return null;
  
  const { culture } = gameState;

  // Transform engine culture data into chart data
  const chartData = Object.entries(culture.genrePopularity)
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
    <Card className="col-span-1 lg:col-span-1 border border-white/10 bg-gradient-to-br from-card/60 to-card/20 backdrop-blur-xl shadow-2xl hover:border-white/20 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-500 relative overflow-hidden group h-full">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-primary/10 transition-colors duration-700" />
      <CardHeader className="pb-4 border-b border-white/10 relative z-10 bg-white/5">
        <CardTitle className="text-xs font-black text-muted-foreground/80 uppercase tracking-[0.2em] flex items-center justify-between">
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_hsl(var(--primary) / 0.8)] animate-pulse" />
            <span className="group-hover:text-foreground/90 transition-colors tracking-widest drop-shadow-sm">Audience Trends</span>
          </span>
          <span className="text-[9px] px-2.5 py-1 rounded-full bg-white/10 font-mono tracking-widest border border-white/5 shadow-inner">DATA</span>
        </CardTitle>
        <CardDescription className="text-[10px] uppercase tracking-[0.2em] font-bold mt-2 text-muted-foreground/60">
          Current hottest genres
        </CardDescription>
      </CardHeader>
      <CardContent className="relative z-10 pt-6">
        <div className="h-[220px] w-full mt-2">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={1} />
                  </linearGradient>
                  <filter id="barShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="rgba(0,0,0,0.3)" />
                  </filter>
                </defs>
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="genre" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'hsl(var(--foreground))', fontSize: 11, fontWeight: 800 }}
                  width={90}
                />
                <ChartTooltip
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  content={<ChartTooltipContent className="bg-card/95 border-white/20 backdrop-blur-xl text-xs font-mono uppercase shadow-2xl rounded-xl px-4 py-3" />}
                />
                <Bar 
                  dataKey="popularity" 
                  radius={[0, 6, 6, 0]}
                  barSize={20}
                  animationDuration={1500}
                  animationEasing="ease-out"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill="url(#barGradient)"
                      style={{ filter: 'url(#barShadow)' }}
                      className="hover:opacity-80 transition-opacity duration-300 cursor-pointer"
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
