import { Card, CardContent } from '@/components/ui/card';
import { TooltipWrapper } from '@/components/ui/tooltip-wrapper';
import { formatMoney } from '@/engine/utils';

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
    <div className="grid grid-cols-4 gap-4">
      {metrics.map((metric, i) => (
        <TooltipWrapper key={metric.label} tooltip={metric.tooltip} side="top">
          <Card 
            className={`border-border/50 bg-card/60 bg-gradient-to-br ${metric.bg} backdrop-blur-md shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1 hover:border-primary/30 transition-all duration-300 relative overflow-hidden group cursor-help`} 
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
            <CardContent className="p-5 relative z-10">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black drop-shadow-sm group-hover:text-foreground/80 transition-colors">
                {metric.label}
              </p>
              <p className={`text-2xl font-display font-black tracking-tighter mt-2 ${metric.color} transition-colors duration-300`}>
                {metric.value}
              </p>
            </CardContent>
          </Card>
        </TooltipWrapper>
      ))}
    </div>
  );
};
