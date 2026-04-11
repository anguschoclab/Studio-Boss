import React, { useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heatmap } from '@/components/shared/Heatmap';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface MarketTrendsHeatmapProps {
  className?: string;
}

const GENRES = ['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Sci-Fi', 'Thriller'];
const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'];

export const MarketTrendsHeatmap: React.FC<MarketTrendsHeatmapProps> = ({ className }) => {
  const gameState = useGameStore(s => s.gameState);

  // Generate heatmap data based on genre trends and market saturation
  const heatmapData = useMemo(() => {
    if (!gameState) {
      return [];
    }
    const { trends = [] } = gameState.market;
    const marketSentiment = gameState.finance?.marketState?.sentiment || 50;
    const { genrePopularity = {} } = gameState.studio?.culture || {};

    const data: { id: string; row: string; col: string; value: number; tooltip: string }[] = [];

    GENRES.forEach(genre => {
      QUARTERS.forEach(quarter => {
        // Calculate opportunity score based on multiple factors
        const trendData = trends.find(t => t.genre.toLowerCase() === genre.toLowerCase());
        const popularity = genrePopularity[genre as keyof typeof genrePopularity] || 50;

        // Count active projects in this genre
        const genreProjects = Object.values(gameState.entities.projects).filter(
          p => p.genre.toLowerCase() === genre.toLowerCase() &&
               p.state !== 'archived' && p.state !== 'post_release'
        ).length;

        // Calculate saturation (how crowded the market is)
        const rivalProjects = Object.values(gameState.entities.rivals).reduce(
          (sum, rival) => sum + Object.values(rival.projects || {})
            .filter(p => p.genre?.toLowerCase() === genre.toLowerCase()).length,
          0
        );
        const saturation = Math.min(100, (genreProjects + rivalProjects) * 10);

        // Combine factors for opportunity score
        const heat = trendData?.heat || 50;
        const opportunity = Math.max(0, Math.min(100,
          (popularity * 0.3) + (heat * 0.4) - (saturation * 0.3) + (marketSentiment * 0.1)
        ));

        let status = 'Stable';
        if (opportunity > 70) status = 'Hot';
        else if (opportunity > 50) status = 'Growing';
        else if (opportunity < 30) status = 'Cooling';
        else if (saturation > 70) status = 'Oversaturated';

        data.push({
          id: `${genre}-${quarter}`,
          row: genre,
          col: quarter,
          value: opportunity,
          tooltip: `${genre} in ${quarter}: ${status} (${Math.round(opportunity)}% opportunity)\nActive Projects: ${genreProjects + rivalProjects}\nPopularity: ${popularity}%`,
        });
      });
    });

    return data;
  }, [gameState]);

  // Find hot genres
  const hotGenres = useMemo(() => {
    const avgByGenre: Record<string, number> = {};
    GENRES.forEach(genre => {
      const genreData = heatmapData.filter(d => d.row === genre);
      avgByGenre[genre] = genreData.reduce((sum, d) => sum + d.value, 0) / (genreData.length || 1);
    });

    return Object.entries(avgByGenre)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  }, [heatmapData]);

  // Find cooling genres
  const coolingGenres = useMemo(() => {
    const avgByGenre: Record<string, number> = {};
    GENRES.forEach(genre => {
      const genreData = heatmapData.filter(d => d.row === genre);
      avgByGenre[genre] = genreData.reduce((sum, d) => sum + d.value, 0) / (genreData.length || 1);
    });

    return Object.entries(avgByGenre)
      .sort((a, b) => a[1] - b[1])
      .slice(0, 3);
  }, [heatmapData]);

  if (!gameState) return null;

  return (
    <Card className={cn("border-border/50", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Genre Opportunity Matrix
          </CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-[10px] text-muted-foreground">
          Heatmap shows genre opportunity scores by quarter. Darker colors indicate better opportunities.
        </p>
        
        <Heatmap
          data={heatmapData}
          rows={GENRES}
          cols={QUARTERS}
          colorScale="sequential"
          cellSize="md"
          className="w-full"
        />
        
        {/* Trending Summary */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/30">
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] font-bold uppercase text-emerald-400">Hot Genres</span>
            </div>
            <div className="space-y-1">
              {hotGenres.map(([genre, score]) => (
                <div key={genre} className="flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground">{genre}</span>
                  <span className="font-mono font-bold text-emerald-400">{Math.round(score)}%</span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <TrendingDown className="w-3.5 h-3.5 text-red-400" />
              <span className="text-[10px] font-bold uppercase text-red-400">Cooling</span>
            </div>
            <div className="space-y-1">
              {coolingGenres.map(([genre, score]) => (
                <div key={genre} className="flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground">{genre}</span>
                  <span className="font-mono font-bold text-red-400">{Math.round(score)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
