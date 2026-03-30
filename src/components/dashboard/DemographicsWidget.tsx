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
    <Card className="col-span-1 lg:col-span-1 border-primary/10 bg-card/40 backdrop-blur-md hover:border-primary/20 hover:shadow-lg transition-all duration-300 group">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] group-hover:text-primary transition-colors">
          Audience Trends
        </CardTitle>
        <CardDescription>Current hottest genres</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full mt-4">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="genre" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                  width={80}
                />
                <ChartTooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent />} />
                <Bar 
                  dataKey="popularity" 
                  fill="hsl(var(--primary))" 
                  radius={[0, 4, 4, 0]} 
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};
