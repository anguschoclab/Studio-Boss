import React from 'react';
import { cn } from '@/lib/utils';
import { Globe, TrendingUp, Tv } from 'lucide-react';
import { Section } from '@/components/layout/Section';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { tokens } from '@/lib/tokens';

interface SyndicationMarket {
  region: string;
  revenue: number;
  deals: number;
  trend: 'up' | 'down' | 'stable';
  growth: number; // percentage
}

interface SyndicationRevenuePanelProps {
  syndicationData: {
    byRegion: SyndicationMarket[];
    totalRevenue: number;
    totalDeals: number;
    topPerformingRegion: string;
  };
}

export const SyndicationRevenuePanel: React.FC<SyndicationRevenuePanelProps> = ({
  syndicationData,
}) => {
  const { byRegion, totalRevenue, totalDeals, topPerformingRegion } = syndicationData;

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value}`;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className={cn('p-4', tokens.border.default)}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Globe className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className={cn('text-[10px] uppercase', tokens.text.caption)}>Total Revenue</p>
              <p className="text-xl font-bold">{formatCurrency(totalRevenue)}</p>
            </div>
          </div>
        </Card>

        <Card className={cn('p-4', tokens.border.default)}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <Tv className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className={cn('text-[10px] uppercase', tokens.text.caption)}>Active Deals</p>
              <p className="text-xl font-bold">{totalDeals}</p>
            </div>
          </div>
        </Card>

        <Card className={cn('p-4', tokens.border.default)}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <TrendingUp className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className={cn('text-[10px] uppercase', tokens.text.caption)}>Top Region</p>
              <p className="text-xl font-bold">{topPerformingRegion || 'N/A'}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Regional Breakdown */}
      <Section
        title="Syndication by Region"
        subtitle="Revenue distribution across global markets"
        icon={Globe}
      >
        {byRegion.length === 0 ? (
          <div className={cn('text-center py-8', tokens.border.default, 'border-dashed rounded-xl')}>
            <Globe className="h-10 w-10 mx-auto mb-3 opacity-20" />
            <p className={cn('text-sm', tokens.text.caption)}>
              No syndication deals active
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {byRegion.map((market) => (
              <Card
                key={market.region}
                className={cn('p-4', tokens.border.default)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Globe className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{market.region}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[9px]">
                          {market.deals} deals
                        </Badge>
                        <span className={cn('text-[10px]', tokens.text.caption)}>
                          {market.growth > 0 ? '+' : ''}{market.growth}% vs last period
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-lg font-bold">{formatCurrency(market.revenue)}</p>
                    <p className={cn(
                      'text-[10px]',
                      market.trend === 'up' ? 'text-emerald-500' :
                      market.trend === 'down' ? 'text-red-500' : 'text-muted-foreground'
                    )}>
                      {market.trend === 'up' ? '↗ Growing' :
                       market.trend === 'down' ? '↘ Declining' : '→ Stable'}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
};

export default SyndicationRevenuePanel;
