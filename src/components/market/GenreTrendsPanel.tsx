import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, Flame, Snowflake, AlertCircle } from 'lucide-react';
import { Section } from '@/components/layout/Section';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { tokens } from '@/lib/tokens';

interface GenreTrend {
  genre: string;
  heat: number; // 0-100
  direction: 'hot' | 'rising' | 'stable' | 'cooling' | 'dead';
  weeksRemaining: number;
  description?: string;
}

interface GenreTrendsPanelProps {
  trends: GenreTrend[];
  onGenreClick?: (genre: string) => void;
}

export const GenreTrendsPanel: React.FC<GenreTrendsPanelProps> = ({
  trends,
  onGenreClick,
}) => {
  const hotGenres = trends.filter(t => t.direction === 'hot' || t.direction === 'rising');
  const stableGenres = trends.filter(t => t.direction === 'stable');
  const coolingGenres = trends.filter(t => t.direction === 'cooling' || t.direction === 'dead');

  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case 'hot':
      case 'rising':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'cooling':
      case 'dead':
        return <TrendingDown className="h-4 w-4 text-blue-500" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getDirectionColor = (direction: string) => {
    switch (direction) {
      case 'hot': return 'bg-red-500';
      case 'rising': return 'bg-amber-500';
      case 'stable': return 'bg-blue-500';
      case 'cooling': return 'bg-slate-400';
      case 'dead': return 'bg-slate-600';
      default: return 'bg-muted';
    }
  };

  const getDirectionBadge = (direction: string) => {
    switch (direction) {
      case 'hot':
        return (
          <Badge className="text-[9px] bg-red-500/20 text-red-500">
            <Flame className="h-3 w-3 mr-1" />
            Hot
          </Badge>
        );
      case 'rising':
        return (
          <Badge className="text-[9px] bg-amber-500/20 text-amber-500">
            <TrendingUp className="h-3 w-3 mr-1" />
            Rising
          </Badge>
        );
      case 'stable':
        return (
          <Badge variant="outline" className="text-[9px]">
            <Minus className="h-3 w-3 mr-1" />
            Stable
          </Badge>
        );
      case 'cooling':
        return (
          <Badge className="text-[9px] bg-blue-500/20 text-blue-500">
            <Snowflake className="h-3 w-3 mr-1" />
            Cooling
          </Badge>
        );
      case 'dead':
        return (
          <Badge variant="secondary" className="text-[9px]">
            <AlertCircle className="h-3 w-3 mr-1" />
            Dead
          </Badge>
        );
    }
  };

  const renderGenreCard = (trend: GenreTrend) => (
    <Card
      key={trend.genre}
      className={cn(
        'p-4 cursor-pointer hover:shadow-md transition-all',
        tokens.border.default
      )}
      onClick={() => onGenreClick?.(trend.genre)}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {getDirectionIcon(trend.direction)}
          <h4 className="font-bold text-sm">{trend.genre}</h4>
        </div>
        {getDirectionBadge(trend.direction)}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-[10px]">
          <span className={tokens.text.caption}>Market Heat</span>
          <span className="font-medium">{trend.heat}/100</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={cn('h-full rounded-full', getDirectionColor(trend.direction))}
            style={{ width: `${trend.heat}%` }}
          />
        </div>
      </div>

      <p className={cn('text-[10px] mt-3', tokens.text.caption)}>
        {trend.weeksRemaining} weeks remaining in current cycle
      </p>

      {trend.description && (
        <p className="text-[10px] mt-2 text-muted-foreground italic">
          "{trend.description}"
        </p>
      )}
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Hot/Rising Genres */}
      {hotGenres.length > 0 && (
        <Section
          title="Hot Genres"
          subtitle="Trending upward - development recommended"
          icon={Flame}
        >
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {hotGenres.map(renderGenreCard)}
          </div>
        </Section>
      )}

      {/* Stable Genres */}
      {stableGenres.length > 0 && (
        <Section
          title="Stable Markets"
          subtitle="Consistent performance"
          icon={Minus}
        >
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {stableGenres.map(renderGenreCard)}
          </div>
        </Section>
      )}

      {/* Cooling/Dead Genres */}
      {coolingGenres.length > 0 && (
        <Section
          title="Cooling Markets"
          subtitle="Declining interest - approach with caution"
          icon={Snowflake}
        >
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {coolingGenres.map(renderGenreCard)}
          </div>
        </Section>
      )}

      {trends.length === 0 && (
        <div className={cn('text-center py-12', tokens.border.default, 'border-dashed rounded-xl')}>
          <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p className={tokens.text.label}>No Market Data Available</p>
          <p className={cn('text-sm mt-2', tokens.text.caption)}>
            Genre trends will appear as the market develops
          </p>
        </div>
      )}
    </div>
  );
};

export default GenreTrendsPanel;
