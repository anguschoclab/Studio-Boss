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
    <Card className="col-span-1 lg:col-span-1 border-white/5 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-md shadow-xl hover:border-white/10 transition-colors duration-500">
      <CardHeader className="pb-2 border-b border-white/5">
        <CardTitle className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2 group">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="group-hover:text-foreground transition-colors">Audience Trends</span>
        </CardTitle>
        <CardDescription className="text-[10px] uppercase tracking-widest font-medium">Current hottest genres</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full mt-4">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={1} />
                  </linearGradient>
                </defs>
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="genre" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'hsl(var(--foreground))', fontSize: 11, fontWeight: 700 }}
                  width={80}
                />
                <ChartTooltip
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  content={<ChartTooltipContent className="bg-card/90 border-white/10 backdrop-blur-md text-xs font-mono uppercase" />}
                />
                <Bar 
                  dataKey="popularity" 
                  fill="url(#barGradient)"
                  radius={[0, 4, 4, 0]} 
                  barSize={16}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};
