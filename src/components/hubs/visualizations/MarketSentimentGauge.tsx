import React from 'react';
import { GaugeChart } from '@/components/charts/GaugeChart';
import { Card } from '@/components/ui/card';
import { tokens } from '@/lib/tokens';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react';

interface MarketSentimentGaugeProps {
  sentiment: number; // 0-100 (bearish to bullish)
  trend: 'bullish' | 'bearish' | 'neutral';
  volatility: number; // 0-100
  className?: string;
}

export const MarketSentimentGauge: React.FC<MarketSentimentGaugeProps> = ({
  sentiment,
  trend,
  volatility,
  className,
}) => {
  const getSentimentLabel = (value: number) => {
    if (value < 20) return 'Very Bearish';
    if (value < 40) return 'Bearish';
    if (value < 60) return 'Neutral';
    if (value < 80) return 'Bullish';
    return 'Very Bullish';
  };

  const getSentimentColor = (value: number) => {
    if (value < 40) return '#ef4444';
    if (value < 60) return '#94a3b8';
    return '#10b981';
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'bullish':
        return <TrendingUp className="h-5 w-5 text-emerald-500" />;
      case 'bearish':
        return <TrendingDown className="h-5 w-5 text-red-500" />;
      default:
        return <Minus className="h-5 w-5 text-slate-400" />;
    }
  };

  const color = getSentimentColor(sentiment);

  return (
    <Card className={cn('p-4', tokens.border.default, className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <div>
            <h4 className="font-bold text-sm">Market Sentiment</h4>
            <p className={cn('text-[10px]', tokens.text.caption)}>
              Industry outlook
            </p>
          </div>
        </div>
        {getTrendIcon()}
      </div>

      <div className="flex flex-col items-center">
        <GaugeChart
          value={sentiment}
          min={0}
          max={100}
          size={140}
          strokeWidth={10}
          color={color}
          label={getSentimentLabel(sentiment)}
          valueFormatter={(v) => `${v.toFixed(0)}`}
        />
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
        <div className="text-center">
          <p className={cn('text-[10px]', tokens.text.caption)}>Trend</p>
          <p className="text-sm font-medium capitalize">{trend}</p>
        </div>
        <div className="text-center">
          <p className={cn('text-[10px]', tokens.text.caption)}>Volatility</p>
          <p className={cn(
            'text-sm font-medium',
            volatility > 70 ? 'text-red-500' : 
            volatility > 40 ? 'text-amber-500' : 'text-emerald-500'
          )}>
            {volatility.toFixed(0)}%
          </p>
        </div>
      </div>
    </Card>
  );
};

export default MarketSentimentGauge;
