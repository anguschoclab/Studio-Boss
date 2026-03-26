import { useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { formatMoney } from '@/engine/utils';
import { calculateWeeklyCosts, calculateWeeklyRevenue, calculateStudioNetWorth, generateCashflowForecast, calculateProjectROI } from '@/engine/systems/finance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ComposedChart, Line } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { YearInReviewChart } from './YearInReviewChart';

export const FinancePanel = () => {
  const gameState = useGameStore(s => s.gameState);

  const cash = gameState?.cash ?? 0;
  const rawFinanceHistory = gameState?.studio.internal.financeHistory;
  const rawProjects = gameState?.studio.internal.projects;

  const projectsMemo = useMemo(() => rawProjects ?? [], [rawProjects]);
  const financeHistory = useMemo(() => rawFinanceHistory ?? [], [rawFinanceHistory]);

  const weeklyCosts = useMemo(() => calculateWeeklyCosts(projectsMemo), [projectsMemo]);
  const weeklyRevenue = useMemo(() => calculateWeeklyRevenue(projectsMemo), [projectsMemo]);
  const netDelta = useMemo(() => weeklyRevenue - weeklyCosts, [weeklyRevenue, weeklyCosts]);
  
  const studioNetWorth = useMemo(() => gameState ? calculateStudioNetWorth(gameState) : 0, [gameState]);
  const forecast = useMemo(() => gameState ? generateCashflowForecast(gameState, 12) : [], [gameState]);

  const activeProjects = useMemo(() =>
    projectsMemo.filter(p => p.status === 'development' || p.status === 'production'),
    [projectsMemo]
  );
  
  const releasedProjects = useMemo(() => 
    projectsMemo.filter(p => p.status === 'released' || p.status === 'post_release' || p.status === 'archived').sort((a,b) => (b.revenue || 0) - (a.revenue || 0)),
    [projectsMemo]
  );

  const chartData = useMemo(() => {
    // Combine history and forecast
    const history = financeHistory.slice(-24).map(h => ({
      ...h,
      isForecast: false,
      histCash: h.cash,
      histRevenue: h.revenue,
      histCosts: h.costs
    }));
    
    const projected = forecast.map(f => ({
      week: f.week,
      isForecast: true,
      projCash: f.projectedCash,
      projRevenue: f.projectedRevenue,
      projCosts: f.projectedCosts
    }));
    
    // Stitch the last history point to forecast so the line connects
    if (history.length > 0 && projected.length > 0) {
      const last = history[history.length - 1];
      projected.unshift({
        week: last.week,
        isForecast: true,
        projCash: last.histCash,
        projRevenue: last.histRevenue,
        projCosts: last.histCosts
      });
    }

    return [...history, ...projected];
  }, [financeHistory, forecast]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex items-center justify-between border-b border-border/40 pb-4 bg-gradient-to-r from-background to-transparent">
        <h2 className="text-3xl font-display font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 drop-shadow-sm">
          Financials & Forecasts
        </h2>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Available Cash', value: formatMoney(cash), color: cash < 0 ? 'text-destructive drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 'text-primary drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]', bg: 'from-card/80 to-card/40' },
          { label: 'Total Net Worth', value: formatMoney(studioNetWorth), color: 'text-foreground', bg: 'from-card/80 to-card/40' },
          { label: 'Projected Net Delta', value: `${netDelta >= 0 ? '+' : ''}${formatMoney(netDelta)}/wk`, color: netDelta >= 0 ? 'text-success drop-shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'text-destructive drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]', bg: netDelta >= 0 ? 'from-success/5 to-transparent' : 'from-destructive/5 to-transparent' },
          { label: '12-Wk Forecast Cash', value: formatMoney(forecast.length > 0 ? forecast[forecast.length - 1].projectedCash : 0), color: 'text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.4)]', bg: 'from-purple-500/5 to-transparent' },
        ].map((metric, i) => (
          <Card key={metric.label} className={`border-border/50 bg-card/60 bg-gradient-to-br ${metric.bg} backdrop-blur-md shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1 hover:border-primary/30 transition-all duration-300 relative overflow-hidden group cursor-default`} style={{ animationDelay: `${i * 100}ms` }}>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
            <CardContent className="p-5 relative z-10">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black drop-shadow-sm group-hover:text-foreground/80 transition-colors">{metric.label}</p>
              <p className={`text-2xl font-display font-black tracking-tighter mt-2 ${metric.color} transition-colors duration-300`}>{metric.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6 h-[400px]">
        {/* Cash Flow Chart */}
        <div className="col-span-2 flex flex-col h-full">
          <Card className="border-border/40 bg-card/60 bg-gradient-to-br from-card/80 to-transparent backdrop-blur-md shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 flex-1 flex flex-col">
            <CardHeader className="pb-4 border-b border-border/30 bg-background/40 backdrop-blur-sm shrink-0 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-display font-black uppercase tracking-widest text-foreground/80 drop-shadow-sm">
                Cashflow & Forecast
              </CardTitle>
              <div className="flex items-center gap-3 text-[10px] font-bold tracking-widest uppercase">
                 <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-success"></div> Revenue</div>
                 <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-destructive"></div> Costs</div>
                 <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-primary"></div> Cash History</div>
                 <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-purple-500"></div> Forecast</div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                     <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="week" stroke="hsl(215, 20%, 35%)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `W${v}`} />
                  <YAxis stroke="hsl(215, 20%, 35%)" fontSize={11} tickFormatter={v => formatMoney(v)} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(51, 65, 85, 0.6)', borderRadius: '8px', fontSize: '12px', backdropFilter: 'blur(12px)', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}
                    itemStyle={{ fontWeight: 600 }}
                    formatter={(value: number, name: string) => [formatMoney(value), name.replace('hist', '').replace('proj', 'Pred ')]}
                    labelFormatter={l => `Week ${l}`}
                  />
                  
                  {/* Historical Stack */}
                  <Area type="monotone" dataKey="histRevenue" stackId="1" stroke="hsl(142, 71%, 45%)" fill="url(#revGrad)" />
                  <Area type="monotone" dataKey="histCosts" stackId="2" stroke="hsl(0, 84%, 60%)" fill="url(#costGrad)" />
                  
                  {/* Historical Cash Line */}
                  <Line type="monotone" dataKey="histCash" stroke="hsl(48, 96%, 53%)" strokeWidth={3} dot={false} style={{ filter: 'drop-shadow(0 0 4px rgba(234,179,8,0.4))' }} />
                  
                  {/* Forecast Cash Line */}
                  <Line type="monotone" dataKey="projCash" stroke="#a855f7" strokeWidth={3} strokeDasharray="5 5" dot={false} style={{ filter: 'drop-shadow(0 0 4px rgba(168,85,247,0.4))' }} />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Active Project Costs */}
        <div className="col-span-1 flex flex-col h-full">
          <Card className="border-border/40 bg-card/60 bg-gradient-to-br from-card/80 to-transparent backdrop-blur-md shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 flex-1 flex flex-col overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/30 bg-background/40 backdrop-blur-sm shrink-0">
              <CardTitle className="text-xs font-display font-black uppercase tracking-widest text-foreground/80 drop-shadow-sm flex justify-between items-center">
                <span>Active Costs</span>
                <span className="text-destructive drop-shadow-[0_0_4px_rgba(239,68,68,0.3)] font-mono">-{formatMoney(weeklyCosts)}/wk</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-y-auto custom-scrollbar">
              <div className="flex flex-col divide-y divide-border/20">
                {activeProjects.length > 0 ? activeProjects.map(p => (
                  <div key={p.id} className="flex flex-col gap-1.5 p-4 hover:bg-muted/10 transition-colors group relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
                    <div className="flex items-center justify-between relative z-10">
                      <span className="text-sm font-black text-foreground/90 group-hover:text-primary transition-colors tracking-tight">{p.title}</span>
                      <span className="text-sm text-destructive font-bold drop-shadow-[0_0_2px_rgba(239,68,68,0.2)] font-mono">-{formatMoney(p.weeklyCost)}/wk</span>
                    </div>
                    <div className="flex items-center gap-2 relative z-10">
                       <span className="text-[9px] font-bold tracking-widest text-muted-foreground uppercase bg-background/50 backdrop-blur-sm border border-border/40 px-2 py-0.5 rounded-full shadow-sm">{p.status}</span>
                    </div>
                  </div>
                )) : (
                  <div className="p-8 text-center flex flex-col items-center justify-center h-full opacity-60">
                    <p className="text-xs font-black uppercase tracking-widest text-muted-foreground bg-muted/10 inline-block px-4 py-2 rounded-full border border-border/20 shadow-inner">No active burn</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Project ROI Analytics */}
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
               const isProfitable = roi > 1; // Assuming roi represents a raw multiplier where 1.0 is break-even (revenue / totalCost)
               
               return (
                 <div key={p.id} className="p-5 flex flex-col gap-3 hover:bg-muted/10 transition-colors group relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    <div className="flex items-start justify-between relative z-10">
                       <h4 className="font-bold text-[15px] tracking-tight group-hover:text-primary transition-colors">{p.title}</h4>
                       <Badge variant="outline" className={`text-[9px] uppercase font-black tracking-widest shadow-sm bg-background/50 backdrop-blur-sm ${isProfitable ? 'text-success border-success/30 shadow-[0_0_8px_rgba(34,197,94,0.2)]' : 'text-destructive border-destructive/30 shadow-[0_0_8px_rgba(239,68,68,0.2)]'}`}>
                         {isProfitable ? 'Profit' : 'Loss'}
                       </Badge>
                    </div>
                    <div className="space-y-1.5 relative z-10">
                      <div className="flex justify-between text-[11px] font-medium">
                         <span className="text-muted-foreground uppercase tracking-wider text-[9px] font-bold">Rev</span>
                         <span className="font-mono text-success drop-shadow-[0_0_2px_rgba(34,197,94,0.3)]">{formatMoney(p.revenue)}</span>
                      </div>
                      <div className="flex justify-between text-[11px] font-medium">
                         <span className="text-muted-foreground uppercase tracking-wider text-[9px] font-bold">Cost</span>
                         <span className="font-mono text-destructive drop-shadow-[0_0_2px_rgba(239,68,68,0.3)]">{formatMoney(p.budget + (p.marketingBudget||0))}</span>
                      </div>
                      <div className="mt-3 pt-3 border-t border-border/30 flex justify-between items-center group-hover:border-primary/20 transition-colors">
                         <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">ROI</span>
                         <span className={`text-xl font-display font-black drop-shadow-sm ${isProfitable ? 'text-success' : 'text-destructive'}`}>
                           {roi.toFixed(2)}x
                         </span>
                      </div>
                    </div>
                 </div>
               )
             }) : (
                <div className="col-span-full p-12 text-center bg-muted/5 opacity-70">
                  <p className="text-xs font-black uppercase tracking-widest text-muted-foreground border border-dashed border-border/40 inline-block px-6 py-3 rounded-xl">No projects released yet</p>
                </div>
             )}
           </div>
        </CardContent>
      </Card>

      {/* Historical Snapshots Section (Sprint G) */}
      <div className="pt-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border/40 to-transparent" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 whitespace-nowrap">Historical Performance</h3>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border/40 to-transparent" />
        </div>
        <YearInReviewChart />
      </div>
      
    </div>
  );
};
