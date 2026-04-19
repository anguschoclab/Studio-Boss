import React from 'react';
import { cn } from '@/lib/utils';
import { Coins, Film, Tv, Music, BookOpen, TrendingUp } from 'lucide-react';
import { Section } from '@/components/layout/Section';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { tokens } from '@/lib/tokens';

interface PassiveIncomeStream {
  type: 'library' | 'syndication' | 'music' | 'publishing' | 'merchandise' | 'streaming_back_catalog';
  source: string;
  weeklyRevenue: number;
  totalToDate: number;
  growth: number; // percentage
  trend: 'up' | 'stable' | 'down';
}

interface PassiveIncomePanelProps {
  streams: PassiveIncomeStream[];
  totalWeekly: number;
  totalYTD: number;
  topPerformingSource: string;
}

export const PassiveIncomePanel: React.FC<PassiveIncomePanelProps> = ({
  streams,
  totalWeekly,
  totalYTD,
  topPerformingSource,
}) => {
  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value}`;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'library':
      case 'streaming_back_catalog':
        return <Film className="h-4 w-4" />;
      case 'syndication':
        return <Tv className="h-4 w-4" />;
      case 'music':
        return <Music className="h-4 w-4" />;
      case 'publishing':
        return <BookOpen className="h-4 w-4" />;
      default:
        return <Coins className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'library': return 'bg-blue-500';
      case 'syndication': return 'bg-purple-500';
      case 'music': return 'bg-pink-500';
      case 'publishing': return 'bg-amber-500';
      case 'merchandise': return 'bg-emerald-500';
      case 'streaming_back_catalog': return 'bg-cyan-500';
      default: return 'bg-slate-500';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-emerald-500" />;
      case 'down': return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
      default: return <div className="h-4 w-4 rounded-full bg-slate-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Summary Card */}
      <Card className={cn('p-6', tokens.border.default)}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-lg">Passive Income Dashboard</h3>
            <p className={cn('text-sm', tokens.text.caption)}>
              {streams.length} active revenue streams
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2">
              <Coins className="h-6 w-6 text-emerald-500" />
              <span className="text-3xl font-bold text-emerald-500">
                {formatCurrency(totalWeekly)}
              </span>
            </div>
            <p className={cn('text-xs', tokens.text.caption)}>/week</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center pt-4 border-t border-border/30">
          <div>
            <p className="text-2xl font-bold text-emerald-500">{formatCurrency(totalYTD)}</p>
            <p className={cn('text-[10px]', tokens.text.caption)}>Year to Date</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{streams.length}</p>
            <p className={cn('text-[10px]', tokens.text.caption)}>Revenue Streams</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{topPerformingSource || 'N/A'}</p>
            <p className={cn('text-[10px]', tokens.text.caption)}>Top Source</p>
          </div>
        </div>
      </Card>

      {/* Income Streams */}
      <Section
        title="Revenue Streams"
        subtitle="Breakdown by income source"
        icon={Coins}
      >
        {streams.length === 0 ? (
          <div className={cn('text-center py-8', tokens.border.default, 'border-dashed rounded-xl')}>
            <Coins className="h-10 w-10 mx-auto mb-3 opacity-20" />
            <p className={cn('text-sm', tokens.text.caption)}>
              No passive income streams yet
            </p>
            <p className={cn('text-xs mt-1', tokens.text.caption)}>
              Build your library to generate ongoing revenue
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {streams
              .sort((a, b) => b.weeklyRevenue - a.weeklyRevenue)
              .map((stream) => (
              <Card
                key={`${stream.type}-${stream.source}`}
                className={cn('p-4', tokens.border.default)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'p-2 rounded-lg',
                      getTypeColor(stream.type).replace('bg-', 'bg-').replace('500', '500/10')
                    )}>
                      {React.cloneElement(getTypeIcon(stream.type) as React.ReactElement, {
                        className: `h-5 w-5 ${getTypeColor(stream.type).replace('bg-', 'text-')}`
                      })}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{stream.source}</h4>
                      <p className={cn('text-[10px]', tokens.text.caption)}>
                        {stream.type.replace('_', ' ')}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <p className="text-lg font-bold">{formatCurrency(stream.weeklyRevenue)}</p>
                      {getTrendIcon(stream.trend)}
                    </div>
                    <p className={cn('text-[10px]', tokens.text.caption)}>
                      {stream.growth > 0 ? '+' : ''}{stream.growth}% vs last period
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-border/30">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className={tokens.text.caption}>
                      Total to date: {formatCurrency(stream.totalToDate)}
                    </span>
                    <Badge variant="outline" className="text-[9px]">
                      {((stream.weeklyRevenue / totalWeekly) * 100).toFixed(1)}% of total
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Section>

      {/* Visual Breakdown */}
      {streams.length > 0 && (
        <Section
          title="Revenue Mix"
          subtitle="Distribution by category"
          icon={TrendingUp}
        >
          <div className="h-4 bg-muted rounded-full overflow-hidden flex">
            {streams.map((stream, idx) => {
              const percentage = (stream.weeklyRevenue / totalWeekly) * 100;
              return (
                <div
                  key={idx}
                  className={cn('h-full', getTypeColor(stream.type))}
                  style={{ width: `${percentage}%` }}
                  title={`${stream.source}: ${percentage.toFixed(1)}%`}
                />
              );
            })}
          </div>
          <div className="flex flex-wrap gap-3 mt-3">
            {streams.map((stream) => (
              <div key={stream.source} className="flex items-center gap-1 text-[10px]">
                <div className={cn('w-2 h-2 rounded-full', getTypeColor(stream.type))} />
                <span>{stream.source}</span>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
};

export default PassiveIncomePanel;
