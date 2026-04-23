import { Card, CardContent } from '@/components/ui/card';
import { TooltipWrapper } from '@/components/ui/tooltip-wrapper';
import { cn } from '@/lib/utils';

interface Metric {
  label: string;
  value: string;
  color: string;
  bg: string;
  tooltip: string;
}

interface SummaryCardsProps {
  metrics: Metric[];
}

export const SummaryCards = ({ metrics }: SummaryCardsProps) => {
  return (
    <div className="grid grid-cols-4 gap-8">
      {metrics.map((metric, i) => (
        <TooltipWrapper key={metric.label} tooltip={metric.tooltip} side="top">
          <Card 
            className={cn(
              "border-white/5 bg-white/[0.01] backdrop-blur-xl transition-all duration-700 relative overflow-hidden group cursor-help rounded-none hover:bg-white/[0.03] hover:border-primary/20 hover:shadow-[0_0_30px_rgba(var(--primary),0.05)]",
              metric.bg
            )}
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
            <CardContent className="p-8 relative z-10 space-y-4">
              <p className="text-[10px] text-muted-foreground/20 uppercase tracking-[0.3em] font-black italic leading-none group-hover:text-muted-foreground/40 transition-colors">
                {metric.label}
              </p>
              <p className={cn(
                "text-3xl font-display font-black tracking-tighter italic leading-none transition-colors duration-700",
                metric.color
              )}>
                {metric.value}
              </p>
            </CardContent>
          </Card>
        </TooltipWrapper>
      ))}
    </div>
  );
};
