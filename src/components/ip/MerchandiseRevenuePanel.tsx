import React from 'react';
import { cn } from '@/lib/utils';
import { ShoppingBag, DollarSign, Package, TrendingUp, Star } from 'lucide-react';
import { Section } from '@/components/layout/Section';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { tokens } from '@/lib/tokens';

interface MerchandiseCategory {
  category: string;
  revenue: number;
  units: number;
  growth: number;
}

interface FranchiseMerch {
  franchiseId: string;
  franchiseName: string;
  totalRevenue: number;
  topCategory: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

interface MerchandiseRevenuePanelProps {
  merchandiseData: {
    byCategory: MerchandiseCategory[];
    byFranchise: FranchiseMerch[];
    totalRevenue: number;
    totalUnits: number;
  };
}

export const MerchandiseRevenuePanel: React.FC<MerchandiseRevenuePanelProps> = ({
  merchandiseData,
}) => {
  const { byCategory, byFranchise, totalRevenue, totalUnits } = merchandiseData;

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value}`;
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'platinum': return 'bg-purple-500';
      case 'gold': return 'bg-amber-500';
      case 'silver': return 'bg-slate-400';
      case 'bronze': return 'bg-amber-700';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className={cn('p-4', tokens.border.default)}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <DollarSign className="h-5 w-5 text-primary" />
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
              <Package className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className={cn('text-[10px] uppercase', tokens.text.caption)}>Units Sold</p>
              <p className="text-xl font-bold">{totalUnits.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card className={cn('p-4', tokens.border.default)}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <TrendingUp className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className={cn('text-[10px] uppercase', tokens.text.caption)}>Avg per Unit</p>
              <p className="text-xl font-bold">
                {totalUnits > 0 ? formatCurrency(totalRevenue / totalUnits) : '$0'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Section
        title="Revenue by Category"
        subtitle="Merchandise performance across product lines"
        icon={ShoppingBag}
      >
        {byCategory.length === 0 ? (
          <div className={cn('text-center py-8', tokens.border.default, 'border-dashed rounded-xl')}>
            <ShoppingBag className="h-10 w-10 mx-auto mb-3 opacity-20" />
            <p className={cn('text-sm', tokens.text.caption)}>
              No merchandise data available
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {byCategory.map((category) => (
              <Card
                key={category.category}
                className={cn('p-4', tokens.border.default)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-sm">{category.category}</h4>
                  <Badge 
                    variant={category.growth > 0 ? 'default' : 'secondary'}
                    className="text-[9px]"
                  >
                    {category.growth > 0 ? '+' : ''}{category.growth}%
                  </Badge>
                </div>
                <p className="text-xl font-bold">{formatCurrency(category.revenue)}</p>
                <p className={cn('text-[10px] mt-1', tokens.text.caption)}>
                  {category.units.toLocaleString()} units
                </p>
              </Card>
            ))}
          </div>
        )}
      </Section>

      {/* Franchise Performance */}
      <Section
        title="Franchise Merchandise"
        subtitle="Revenue by IP franchise"
        icon={Star}
      >
        {byFranchise.length === 0 ? (
          <div className={cn('text-center py-8', tokens.border.default, 'border-dashed rounded-xl')}>
            <Star className="h-10 w-10 mx-auto mb-3 opacity-20" />
            <p className={cn('text-sm', tokens.text.caption)}>
              No franchise merchandise data
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {byFranchise.map((franchise) => (
              <Card
                key={franchise.franchiseId}
                className={cn('p-4', tokens.border.default)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-3 h-3 rounded-full',
                      getTierColor(franchise.tier)
                    )} />
                    <div>
                      <h4 className="font-bold text-sm">{franchise.franchiseName}</h4>
                      <p className={cn('text-[10px]', tokens.text.caption)}>
                        Top: {franchise.topCategory}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{formatCurrency(franchise.totalRevenue)}</p>
                    <Badge variant="outline" className="text-[9px] capitalize">
                      {franchise.tier} Tier
                    </Badge>
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

export default MerchandiseRevenuePanel;
