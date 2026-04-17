import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TooltipWrapper } from '@/components/ui/tooltip-wrapper';
import { DistributionBadge } from '@/components/shared/DistributionBadge';
import { formatMoney } from '@/engine/utils';
import { calculateProjectROI } from '@/engine/systems/finance';
import { Project } from '@/engine/types';

interface ProjectROIAnalyticsProps {
  releasedProjects: Project[];
}

export const ProjectROIAnalytics = ({ releasedProjects }: ProjectROIAnalyticsProps) => {
  return (
    <Card className="border-border/40 bg-card/60 backdrop-blur-md shadow-sm">
      <CardHeader className="pb-4 border-b border-border/30 bg-background/40">
        <CardTitle className="text-xs font-display font-black uppercase tracking-widest text-foreground/80">
          Project ROI Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-border/30">
          {releasedProjects.length > 0 ? releasedProjects.slice(0, 8).map(p => {
            const roi = calculateProjectROI(p);
            const isProfitable = roi > 1;

            return (
              <div key={p.id} className="p-5 flex flex-col gap-3 hover:bg-muted/10 transition-colors group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <div className="flex items-start justify-between relative z-10 gap-2">
                  <h4 className="font-bold text-[15px] tracking-tight group-hover:text-primary transition-colors truncate">
                    {p.title}
                  </h4>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <Badge 
                      variant="outline" 
                      className={`text-[9px] uppercase font-black tracking-widest shadow-sm bg-background/50 backdrop-blur-sm ${
                        isProfitable 
                          ? 'text-success border-success/30 shadow-[0_0_8px_rgba(34,197,94,0.2)]' 
                          : 'text-destructive border-destructive/30 shadow-[0_0_8px_rgba(239,68,68,0.2)]'
                      }`}
                    >
                      {isProfitable ? 'Profit' : 'Loss'}
                    </Badge>
                    <DistributionBadge status={p.distributionStatus} className="scale-75 origin-right" />
                  </div>
                </div>
                <div className="space-y-1.5 relative z-10">
                  <TooltipWrapper tooltip="Total project earnings from box office receipts, distribution deals, and licensing." side="bottom">
                    <div className="flex justify-between text-[11px] font-medium cursor-help">
                      <span className="text-muted-foreground uppercase tracking-wider text-[9px] font-bold">Rev</span>
                      <span className="font-mono text-success drop-shadow-[0_0_2px_rgba(34,197,94,0.3)]">
                        {formatMoney(p.revenue)}
                      </span>
                    </div>
                  </TooltipWrapper>
                  <TooltipWrapper tooltip="Total project expenditure including production budget, marketing spend, and talent fees." side="bottom">
                    <div className="flex justify-between text-[11px] font-medium cursor-help">
                      <span className="text-muted-foreground uppercase tracking-wider text-[9px] font-bold">Cost</span>
                      <span className="font-mono text-destructive drop-shadow-[0_0_2px_rgba(239,68,68,0.3)]">
                        {formatMoney(p.budget + (p.marketingBudget || 0))}
                      </span>
                    </div>
                  </TooltipWrapper>
                  <TooltipWrapper tooltip="Return on Investment ratio. Values above 1.0x signify capital growth." side="top">
                    <div className="mt-3 pt-3 border-t border-border/30 flex justify-between items-center group-hover:border-primary/20 transition-colors cursor-help">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">ROI</span>
                      <span className={`text-xl font-display font-black drop-shadow-sm ${isProfitable ? 'text-success' : 'text-destructive'}`}>
                        {roi.toFixed(2)}x
                      </span>
                    </div>
                  </TooltipWrapper>
                </div>
              </div>
            );
          }) : (
            <div className="col-span-full p-12 text-center bg-muted/5 opacity-70">
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground border border-dashed border-border/40 inline-block px-6 py-3 rounded-xl">
                No projects released yet
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
