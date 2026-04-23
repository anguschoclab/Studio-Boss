import { calculateWeeklyCosts, calculateWeeklyRevenue, calculateStudioNetWorth, generateCashflowForecast, calculateProjectROI } from '@/engine/systems/finance';
import { useShallow } from 'zustand/react/shallow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ComposedChart, Line } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { YearInReviewChart } from '@/components/finance/YearInReviewChart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { History, LayoutDashboard, ReceiptText, TrendingUp, Package, Coins } from 'lucide-react';
import { TooltipWrapper } from '@/components/ui/tooltip-wrapper';
import { RevenueStreamChart } from '@/components/finance/RevenueStreamChart';
import { ProfitWaterfallChart } from '@/components/finance/ProfitWaterfallChart';
import { CashEfficiencyGauge } from '@/components/finance/CashEfficiencyGauge';
import { DistributionBadge } from '@/components/shared/DistributionBadge';
import { MarketRatesWidget } from '@/components/finance/MarketRatesWidget';
import { useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { formatMoney } from '@/engine/utils';
import { KPIStatCard } from '@/components/shared/KPIStatCard';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/components/shared/EmptyState';

export const FinancePanel = () => {
  const gameState = useGameStore(s => s.gameState);

  const cash = useGameStore(s => s.gameState?.finance?.cash ?? 0);
  const financeHistory = useGameStore(useShallow(s => s.gameState?.finance?.weeklyHistory ?? []));
  const projectsMemo = useGameStore(useShallow(s => Object.values(s.gameState?.studio.internal.projects || {})));

  const weeklyCosts = useMemo(() => calculateWeeklyCosts(projectsMemo), [projectsMemo]);
  const weeklyRevenue = useMemo(() => calculateWeeklyRevenue(projectsMemo), [projectsMemo]);
  const netDelta = useMemo(() => weeklyRevenue - weeklyCosts, [weeklyRevenue, weeklyCosts]);
  
  const studioNetWorth = useMemo(() => gameState ? calculateStudioNetWorth(gameState) : 0, [gameState]);
  const forecast = useMemo(() => gameState ? generateCashflowForecast(gameState, 12) : [], [gameState]);

  const activeProjects = useMemo(() =>
    projectsMemo.filter(p => p.state === 'development' || p.state === 'production'),
    [projectsMemo]
  );
  
  const releasedProjects = useMemo(() => 
    projectsMemo.filter(p => p.state === 'released' || p.state === 'post_release' || p.state === 'archived').sort((a,b) => (b.revenue || 0) - (a.revenue || 0)),
    [projectsMemo]
  );

  const chartData = useMemo(() => {
    if (!financeHistory || financeHistory.length === 0) return [];
    
    // Convert snapshots to chart format
    const history = financeHistory.map(h => ({
      week: h.week,
      isForecast: false,
      histCash: h.cash,
      histRevenue: h.revenue.theatrical + h.revenue.streaming + h.revenue.merch + h.revenue.passive,
      histCosts: h.expenses.production + h.expenses.marketing + h.expenses.burn + h.expenses.interest + h.expenses.royalties,
      ...h.revenue,
      ...h.expenses
    }));
    
    const projected = forecast.map(f => ({
      week: f.week,
      isForecast: true,
      projCash: f.projected,
      projRevenue: 0,
      projCosts: 0
    }));
    
    if (history.length > 0 && projected.length > 0) {
      const last = history[history.length - 1];
      projected.unshift({
        ...last,
        projCash: last.histCash,
        projRevenue: last.histRevenue,
        projCosts: last.histCosts,
        isForecast: true,
      } as any);
    }

    return [...history, ...projected];
  }, [financeHistory, forecast]);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-20">
      <div className="flex items-center justify-between border-b border-white/5 pb-12">
        <div className="flex items-center gap-8">
          <div className="w-16 h-16 rounded-none bg-primary/5 border border-primary/20 flex items-center justify-center shadow-[0_0_20px_rgba(var(--primary),0.1)]">
            <Coins className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h2 className="text-5xl font-display font-black tracking-tighter uppercase italic leading-none mb-3">
              Fiscal Intelligence
            </h2>
            <p className="text-[10px] font-black uppercase text-muted-foreground/20 tracking-[0.4em] italic">TREASURY MANAGEMENT // PREDICTIVE FISCAL ANALYSIS</p>
          </div>
        </div>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button 
              variant="outline" 
              className="font-display font-black uppercase tracking-[0.2em] text-[10px] h-12 px-8 gap-4 bg-white/[0.02] border-white/5 hover:bg-primary/10 hover:text-primary transition-all rounded-none"
            >
              <ReceiptText className="w-4 h-4" />
              GENERAL LEDGER
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[400px] sm:w-[540px] border-l border-white/5 bg-black/95 backdrop-blur-3xl p-12">
            <SheetHeader className="border-b border-white/5 pb-12">
              <SheetTitle className="font-display text-4xl font-black uppercase italic tracking-tighter flex items-center gap-4 text-foreground">
                <Coins className="w-10 h-10 text-primary" />
                STUDIO LEDGER
              </SheetTitle>
              <SheetDescription className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/20 italic mt-4">
                HISTORICAL BENCHMARK DATA // SECURE EXECUTIVE ACCESS
              </SheetDescription>
            </SheetHeader>
            <div className="mt-12 space-y-8 overflow-y-auto max-h-[calc(100vh-300px)] pr-6 custom-scrollbar">
              {(useGameStore().snapshots || []).slice().reverse().map((s, i) => (
                <div key={i} className="bg-white/[0.01] border border-white/5 p-8 group hover:bg-white/[0.03] hover:border-primary/20 transition-all duration-700 rounded-none">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <p className="text-[9px] text-muted-foreground/20 uppercase font-black tracking-[0.3em] leading-none mb-3 italic">FISCAL YEAR</p>
                      <p className="text-4xl font-display font-black text-foreground italic leading-none">Y{s.year}</p>
                    </div>
                    <Badge variant="outline" className="text-[8px] font-black tracking-[0.2em] uppercase bg-primary/5 text-primary border-primary/20 h-7 px-4 rounded-none">
                      VERIFIED SNAPSHOT
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <p className="text-[9px] text-muted-foreground/20 uppercase font-black tracking-[0.3em] mb-3 flex items-center gap-3 italic">
                        <TrendingUp className="w-3 h-3 text-primary/40" /> TOTAL EQUITY
                      </p>
                      <p className="text-xl font-display font-black text-foreground tracking-tighter italic leading-none">{formatMoney(s.funds)}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-muted-foreground/20 uppercase font-black tracking-[0.3em] mb-3 flex items-center gap-3 italic">
                        <Package className="w-3 h-3 text-primary/40" /> IP VOLUME
                      </p>
                      <p className="text-xl font-display font-black tracking-tighter text-foreground italic leading-none">{s.completedProjects} TITLES</p>
                    </div>
                  </div>
                </div>
              ))}
              {((useGameStore().snapshots || []).length === 0) && (
                <EmptyState 
                  icon={History} 
                  title="NO HISTORICAL DATA" 
                  message="Benchmarks are generated at the close of each fiscal year (Week 52)."
                  className="bg-transparent border-none py-20"
                />
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <Tabs defaultValue="current" className="space-y-12">
        <TabsList className="bg-white/[0.02] border border-white/5 p-1 h-14 rounded-none">
          <TabsTrigger value="current" className="gap-4 font-display font-black uppercase tracking-[0.2em] text-[10px] h-12 px-10 data-[state=active]:bg-primary data-[state=active]:text-black transition-all rounded-none">
            <LayoutDashboard className="w-4 h-4" />
            ACTIVE OPERATIONS
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-4 font-display font-black uppercase tracking-[0.2em] text-[10px] h-12 px-10 data-[state=active]:bg-primary data-[state=active]:text-black transition-all rounded-none">
            <History className="w-4 h-4" />
            PERFORMANCE AUDIT
          </TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-12 m-0 outline-none">

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
        <KPIStatCard 
          label="AVAILABLE LIQUID CASH" 
          value={formatMoney(cash)} 
          variant={cash < 0 ? 'destructive' : 'primary'}
          tooltip="Total liquid capital available for studio operations."
        />
        <KPIStatCard 
          label="TOTAL STUDIO EQUITY" 
          value={formatMoney(studioNetWorth)} 
          variant="muted"
          tooltip="Estimated total value of all studio assets."
        />
        <KPIStatCard 
          label="WEEKLY CASH BURN" 
          value={`${netDelta >= 0 ? '+' : ''}${formatMoney(netDelta)}`} 
          subLabel="P&L MOMENTUM"
          variant={netDelta >= 0 ? 'success' : 'destructive'}
          tooltip="Estimated weekly profit or loss."
        />
        <KPIStatCard 
          label="FORECAST LIQUIDITY" 
          value={formatMoney(forecast.length > 0 ? forecast[forecast.length - 1].projected : 0)} 
          subLabel="12-WEEK OUTLOOK"
          variant="secondary"
          tooltip="Projected cash position in 12 weeks."
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
        {/* Cash Flow Chart */}
        <div className="xl:col-span-2 flex flex-col gap-12">
          <MarketRatesWidget />
          
          <div className="glass-card p-12 flex flex-col h-[450px]">
            <div className="flex items-center justify-between mb-12 pb-6 border-b border-white/5">
              <div>
                <h3 className="text-2xl font-display font-black uppercase tracking-tighter italic leading-none mb-2 text-foreground">Liquidity Curve</h3>
                <p className="text-[10px] font-black uppercase text-muted-foreground/20 tracking-[0.3em] italic">12-WEEK HISTORICAL VS 12-WEEK PROJECTED VECTOR</p>
              </div>
              <div className="flex items-center gap-8 text-[9px] font-black tracking-[0.2em] uppercase text-muted-foreground/40 italic">
                 <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-none bg-primary shadow-[0_0_10px_rgba(var(--primary),0.4)]"></div> HISTORY</div>
                 <div className="flex items-center gap-3"><div className="w-3 h-0.5 bg-primary/40 border-t border-dashed border-primary"></div> FORECAST</div>
              </div>
            </div>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="week" stroke="rgba(255,255,255,0.05)" fontSize={10} fontWeight={900} tickLine={false} axisLine={false} tickFormatter={v => `W${v}`} />
                  <YAxis stroke="rgba(255,255,255,0.05)" fontSize={10} fontWeight={900} tickFormatter={v => formatMoney(v)} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ background: 'rgba(0, 0, 0, 0.95)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '0px', fontSize: '10px', backdropFilter: 'blur(32px)', padding: '16px' }}
                    itemStyle={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#fff' }}
                    formatter={(value: number, name: string) => [formatMoney(value), name === 'histCash' ? 'ACTUAL CASH' : 'PROJECTED CASH']}
                  />
                  
                  {/* Historical Cash Area */}
                  <Area type="monotone" dataKey="histCash" stroke="rgba(var(--primary), 1)" strokeWidth={2} fill="rgba(var(--primary), 0.05)" />
                  
                  {/* Forecast Cash Line */}
                  <Line type="monotone" dataKey="projCash" stroke="rgba(var(--primary), 0.4)" strokeWidth={2} strokeDasharray="8 8" dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Active Project Costs */}
        <div className="xl:col-span-1">
          <div className="glass-card flex flex-col h-full overflow-hidden">
            <div className="p-8 border-b border-white/5 bg-white/[0.01]">
              <h3 className="text-xs font-display font-black uppercase tracking-[0.2em] text-foreground flex justify-between items-center italic">
                <span>DIRECT BURN RATES</span>
                <span className="text-destructive tracking-tighter text-lg">-{formatMoney(weeklyCosts)}/WK</span>
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="flex flex-col divide-y divide-white/5">
                {activeProjects.length > 0 ? activeProjects.map(p => (
                  <div key={p.id} className="p-8 hover:bg-white/[0.02] transition-all group">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-md font-display font-black uppercase tracking-tight group-hover:text-primary transition-colors italic leading-none">{p.title}</span>
                      <span className="text-sm font-display font-black text-destructive tracking-tighter italic leading-none">-{formatMoney(p.weeklyCost)}</span>
                    </div>
                    <div className="flex items-center gap-6">
                       <Badge variant="outline" className="text-[8px] font-black tracking-[0.2em] text-muted-foreground/40 uppercase h-5 px-3 border-white/5 rounded-none">
                         {p.state.replace('_', ' ')}
                       </Badge>
                       <div className="flex-1 h-0.5 bg-white/5 rounded-none overflow-hidden">
                          <div className="h-full bg-destructive/40 w-1/2" />
                       </div>
                    </div>
                  </div>
                )) : (
                  <EmptyState 
                    icon={TrendingUp} 
                    title="NO ACTIVE BURN" 
                    message="Your studio currently has no active projects incurring weekly production costs."
                    className="h-full py-24 bg-transparent border-none shadow-none backdrop-blur-none"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Deep Economic Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="glass-card p-10 bg-white/[0.01]">
           <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/20 mb-10 pb-5 border-b border-white/5 italic">REVENUE MIX // 12W ANALYSIS</h3>
           <div className="h-[220px]">
              <RevenueStreamChart data={gameState?.finance?.weeklyHistory || []} />
           </div>
        </div>

        <div className="glass-card p-10 bg-white/[0.01]">
           <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/20 mb-10 pb-5 border-b border-white/5 italic">WEEKLY P&L WATERFALL</h3>
           <div className="h-[220px]">
              <ProfitWaterfallChart snapshot={gameState?.finance?.weeklyHistory?.slice(-1)[0]} />
           </div>
        </div>

        <div className="glass-card p-10 bg-white/[0.01]">
           <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/20 mb-10 pb-5 border-b border-white/5 italic">FISCAL EFFICIENCY COEFFICIENT</h3>
           <div className="h-[220px] flex items-center justify-center">
              <CashEfficiencyGauge score={gameState?.studio?.prestige || 75} />
           </div>
        </div>
      </div>

      {/* Project ROI Analytics */}
      <div className="glass-card overflow-hidden">
        <div className="p-8 border-b border-white/5 bg-white/[0.01]">
           <h3 className="text-xs font-display font-black uppercase tracking-[0.2em] text-foreground italic">
            PROPERTY YIELD & ROI AUDIT
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/5">
          {releasedProjects.length > 0 ? releasedProjects.slice(0, 8).map(p => {
            const roi = calculateProjectROI(p);
            const isProfitable = roi > 1;
            
            return (
              <div key={p.id} className="p-8 hover:bg-white/[0.02] transition-all group">
                  <div className="flex items-start justify-between mb-8">
                    <div>
                      <h4 className="font-display font-black text-xl tracking-tighter uppercase italic group-hover:text-primary transition-colors truncate max-w-[140px] leading-none">{p.title}</h4>
                      <Badge variant="outline" className="text-[8px] font-black tracking-[0.2em] text-muted-foreground/20 uppercase mt-3 border-white/5 rounded-none h-5 px-2">
                        {p.distributionStatus}
                      </Badge>
                    </div>
                    <Badge variant="outline" className={cn("text-[9px] font-black tracking-[0.2em] uppercase h-7 px-4 border-none rounded-none italic", isProfitable ? "bg-emerald-400/10 text-emerald-400" : "bg-red-400/10 text-red-400")}>
                      {isProfitable ? 'YIELD' : 'LOSS'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="flex justify-between items-end">
                      <span className="text-[9px] font-black text-muted-foreground/20 uppercase tracking-[0.2em] italic">GROSS YIELD</span>
                      <span className="text-md font-display font-black text-emerald-400 tracking-tight italic leading-none">{formatMoney(p.revenue)}</span>
                    </div>
                    <div className="flex justify-between items-end">
                      <span className="text-[9px] font-black text-muted-foreground/20 uppercase tracking-[0.2em] italic">TOTAL SPEND</span>
                      <span className="text-md font-display font-black text-red-400 tracking-tight italic leading-none">{formatMoney(p.budget + (p.marketingBudget||0))}</span>
                    </div>
                    <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic">YIELD RATIO</span>
                      <span className={cn("text-3xl font-display font-black tracking-tighter italic leading-none", isProfitable ? "text-emerald-400" : "text-red-400")}>
                        {roi.toFixed(2)}x
                      </span>
                    </div>
                  </div>
              </div>
            )
          }) : (
             <div className="col-span-full">
               <EmptyState 
                 icon={Coins} 
                 title="NO ACTIVE CATALOG" 
                 message="Properties will appear here for ROI auditing once they have concluded their primary distribution windows."
                 className="bg-transparent border-none py-24"
               />
             </div>
          )}
        </div>
      </div>

        </TabsContent>

        <TabsContent value="history" className="m-0 outline-none">
          <YearInReviewChart />
        </TabsContent>
      </Tabs>
    </div>
  );
};
