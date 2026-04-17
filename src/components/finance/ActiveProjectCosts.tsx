import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatMoney } from '@/engine/utils';
import { Project } from '@/engine/types';

interface ActiveProjectCostsProps {
  activeProjects: Project[];
  weeklyCosts: number;
}

export const ActiveProjectCosts = ({ activeProjects, weeklyCosts }: ActiveProjectCostsProps) => {
  return (
    <Card className="border-border/40 bg-card/60 bg-gradient-to-br from-card/80 to-transparent backdrop-blur-md shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 flex-1 flex flex-col overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/30 bg-background/40 backdrop-blur-sm shrink-0">
        <CardTitle className="text-xs font-display font-black uppercase tracking-widest text-foreground/80 drop-shadow-sm flex justify-between items-center">
          <span>Active Costs</span>
          <span className="text-destructive drop-shadow-[0_0_4px_rgba(239,68,68,0.3)] font-mono">
            -{formatMoney(weeklyCosts)}/wk
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-y-auto custom-scrollbar">
        <div className="flex flex-col divide-y divide-border/20">
          {activeProjects.length > 0 ? activeProjects.map(p => (
            <div key={p.id} className="flex flex-col gap-1.5 p-4 hover:bg-muted/10 transition-colors group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
              <div className="flex items-center justify-between relative z-10">
                <span className="text-sm font-black text-foreground/90 group-hover:text-primary transition-colors tracking-tight">
                  {p.title}
                </span>
                <span className="text-sm text-destructive font-bold drop-shadow-[0_0_2px_rgba(239,68,68,0.2)] font-mono">
                  -{formatMoney(p.weeklyCost)}/wk
                </span>
              </div>
              <div className="flex items-center gap-2 relative z-10">
                <span className="text-[9px] font-bold tracking-widest text-muted-foreground uppercase bg-background/50 backdrop-blur-sm border border-border/40 px-2 py-0.5 rounded-full shadow-sm">
                  {p.state}
                </span>
              </div>
            </div>
          )) : (
            <div className="p-8 text-center flex flex-col items-center justify-center h-full opacity-60">
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground bg-muted/10 inline-block px-4 py-2 rounded-full border border-border/20 shadow-inner">
                No active burn
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
