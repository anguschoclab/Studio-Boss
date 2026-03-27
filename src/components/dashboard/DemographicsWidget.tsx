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
    <Card className="col-span-1 lg:col-span-1 border-border/50 bg-card/60 backdrop-blur-xl shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-bl from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <CardHeader className="pb-2 relative z-10">
        <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest group-hover:text-foreground transition-colors duration-300">
          Audience Trends
        </CardTitle>
        <CardDescription className="text-xl font-black tracking-tighter mt-1 bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70">
          Hottest Genres
        </CardDescription>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="h-[220px] w-full mt-4">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="genre" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'hsl(var(--foreground))', fontSize: 11, fontWeight: 700, opacity: 0.8 }}
                  width={85}
                  dx={-5}
                />
                <ChartTooltip cursor={{ fill: 'hsl(var(--muted))', opacity: 0.5 }} content={<ChartTooltipContent />} />
                <Bar 
                  dataKey="popularity" 
                  fill="hsl(var(--primary))" 
                  radius={[0, 6, 6, 0]}
                  barSize={24}
                  animationDuration={1500}
                  animationEasing="ease-out"
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};
