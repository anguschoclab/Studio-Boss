import { calculateWeeklyCosts, calculateWeeklyRevenue, calculateStudioNetWorth, generateCashflowForecast, calculateProjectROI } from '@/engine/systems/finance';
import { LoanModal } from '@/components/finance/LoanModal';
import { useShallow } from 'zustand/react/shallow';
import { Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ComposedChart, Line, CartesianGrid } from 'recharts';
import { YearInReviewChart } from '@/components/finance/YearInReviewChart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { History, LayoutDashboard, ReceiptText, TrendingUp, Package, Coins, ShieldCheck, ArrowRightLeft, Banknote } from 'lucide-react';
import { RevenueStreamChart } from '@/components/finance/RevenueStreamChart';
import { ProfitWaterfallChart } from '@/components/finance/ProfitWaterfallChart';
import { CashEfficiencyGauge } from '@/components/finance/CashEfficiencyGauge';
import { MarketRatesWidget } from '@/components/finance/MarketRatesWidget';
import { useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { formatMoney } from '@/engine/utils';
import { KPIStatCard } from '@/components/shared/KPIStatCard';
import { CausalityTooltip } from '@/components/shared/CausalityTooltip';
import { cn } from '@/lib/utils';

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

  // Get latest snapshot causality data
  const latestSnapshot = financeHistory?.[financeHistory.length - 1];
  const causality = latestSnapshot?.causality;

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
      } as unknown as { week: number; projCash?: number; projRevenue?: number; projCosts?: number; histCash?: number; histRevenue?: number; histCosts?: number; isForecast?: boolean });
    }

    return [...history, ...projected];
  }, [financeHistory, forecast]);

  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-32">
      <div className="flex items-center justify-between border-b border-white/5 pb-16">
        <div className="flex items-center gap-10">
          <div className="w-20 h-20 rounded-none bg-primary/5 border border-primary/20 flex items-center justify-center shadow-[0_0_30px_rgba(var(--primary),0.15)]">
            <Coins className="h-10 w-10 text-primary" strokeWidth={1} />
          </div>
          <div className="space-y-3">
            <h2 className="text-7xl font-display font-black tracking-tighter uppercase italic leading-none drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
              FISCAL INTELLIGENCE
            </h2>
            <p className="text-[10px] font-black uppercase text-muted-foreground/20 tracking-[0.5em] italic">TREASURY MANAGEMENT // PREDICTIVE FISCAL ANALYSIS</p>
          </div>
        </div>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button 
              variant="outline" 
              className="font-display font-black uppercase tracking-[0.3em] text-[10px] h-14 px-10 gap-6 bg-white/[0.02] border-white/10 hover:bg-white hover:text-black transition-all duration-700 rounded-none shadow-[0_0_20px_rgba(255,255,255,0.05)]"
            >
              <ReceiptText className="w-5 h-5" />
              GENERAL LEDGER
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[450px] sm:w-[600px] border-l border-white/5 bg-black/95 backdrop-blur-3xl p-16">
            <SheetHeader className="border-b border-white/5 pb-16">
              <SheetTitle className="font-display text-5xl font-black uppercase italic tracking-tighter flex items-center gap-6 text-foreground leading-none">
                <Coins className="w-12 h-12 text-primary" />
                STUDIO LEDGER
              </SheetTitle>
              <SheetDescription className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/20 italic mt-6">
                HISTORICAL BENCHMARK DATA // SECURE EXECUTIVE ACCESS
              </SheetDescription>
            </SheetHeader>
            <div className="mt-16 space-y-10 overflow-y-auto max-h-[calc(100vh-350px)] pr-8 custom-scrollbar">
              {(useGameStore().snapshots || []).slice().reverse().map((s, i) => (
                <div key={i} className="bg-white/[0.01] border border-white/5 p-10 group hover:bg-white/[0.04] hover:border-primary/40 transition-all duration-700 rounded-none shadow-xl">
                  <div className="flex justify-between items-start mb-10">
                    <div className="space-y-3">
                      <p className="text-[10px] text-muted-foreground/20 uppercase font-black tracking-[0.4em] leading-none italic">FISCAL YEAR</p>
                      <p className="text-6xl font-display font-black text-foreground italic leading-none drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">Y{s.year}</p>
                    </div>
                    <div className="flex items-center gap-3 px-4 py-2 border border-primary/20 bg-primary/5 text-[9px] font-black tracking-[0.3em] uppercase italic text-primary rounded-none shadow-[0_0_15px_rgba(var(--primary),0.1)]">
                      <ShieldCheck className="w-3 h-3" />
                      VERIFIED SNAPSHOT
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <p className="text-[10px] text-muted-foreground/20 uppercase font-black tracking-[0.4em] flex items-center gap-4 italic">
                        <TrendingUp className="w-3.5 h-3.5 text-primary/40" /> TOTAL EQUITY
                      </p>
                      <p className="text-2xl font-display font-black text-foreground tracking-tighter italic leading-none">{formatMoney(s.funds).toUpperCase()}</p>
                    </div>
                    <div className="space-y-4">
                      <p className="text-[10px] text-muted-foreground/20 uppercase font-black tracking-[0.4em] flex items-center gap-4 italic">
                        <Package className="w-3.5 h-3.5 text-primary/40" /> IP VOLUME
                      </p>
                      <p className="text-2xl font-display font-black tracking-tighter text-foreground italic leading-none">{s.completedProjects} TITLES</p>
                    </div>
                  </div>
                </div>
              ))}
              {((useGameStore().snapshots || []).length === 0) && (
                <div className="py-32 flex flex-col items-center text-center space-y-8 opacity-20">
                  <History className="w-16 h-16 text-muted-foreground" strokeWidth={1} />
                  <div className="space-y-3">
                    <p className="text-xs font-black uppercase tracking-[0.5em] italic">NO HISTORICAL DATA</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] max-w-[240px] leading-relaxed">BENCHMARKS ARE GENERATED AT THE CLOSE OF EACH FISCAL YEAR (WEEK 52).</p>
                  </div>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <Tabs defaultValue="current" className="space-y-16">
        <TabsList className="bg-white/[0.02] border border-white/5 p-1 h-16 rounded-none w-fit">
          <TabsTrigger value="current" className="gap-6 font-display font-black uppercase tracking-[0.3em] text-[10px] h-14 px-12 data-[state=active]:bg-primary data-[state=active]:text-black transition-all duration-700 rounded-none italic">
            <LayoutDashboard className="w-4 h-4" />
            ACTIVE OPERATIONS
          </TabsTrigger>
            <TabsTrigger value="history" className="gap-6 font-display font-black uppercase tracking-[0.3em] text-[10px] h-14 px-12 data-[state=active]:bg-primary data-[state=active]:text-black transition-all duration-700 rounded-none italic">
            <History className="w-4 h-4" />
            PERFORMANCE AUDIT
          </TabsTrigger>
          <TabsTrigger value="capital" className="gap-6 font-display font-black uppercase tracking-[0.3em] text-[10px] h-14 px-12 data-[state=active]:bg-primary data-[state=active]:text-black transition-all duration-700 rounded-none italic">
            <Banknote className="w-4 h-4" />
            CAPITAL MARKETS
          </TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-16 m-0 outline-none animate-in fade-in duration-1000">

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-10">
        <CausalityTooltip
          value={cash}
          causality={causality}
          label="AVAILABLE LIQUID CASH"
        >
          <KPIStatCard
            label="AVAILABLE LIQUID CASH"
            value={formatMoney(cash).toUpperCase()}
            variant={cash < 0 ? 'destructive' : 'primary'}
            tooltip="Total liquid capital available for studio operations."
          />
        </CausalityTooltip>
        <KPIStatCard
          label="TOTAL STUDIO EQUITY"
          value={formatMoney(studioNetWorth).toUpperCase()}
          variant="muted"
          tooltip="Estimated total value of all studio assets."
        />
        <CausalityTooltip
          value={netDelta}
          causality={causality}
          label="WEEKLY CASH BURN"
        >
          <KPIStatCard
            label="WEEKLY CASH BURN"
            value={`${netDelta >= 0 ? '+' : ''}${formatMoney(netDelta).toUpperCase()}`}
            subLabel="P&L MOMENTUM"
            variant={netDelta >= 0 ? 'success' : 'destructive'}
            tooltip="Weekly profit or loss from operations."
          />
        </CausalityTooltip>
        <KPIStatCard 
          label="FORECAST LIQUIDITY" 
          value={formatMoney(forecast.length > 0 ? forecast[forecast.length - 1].projected : 0).toUpperCase()} 
          subLabel="12-WEEK OUTLOOK"
          variant="secondary"
          tooltip="Projected cash position in 12 weeks."
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-16">
        {/* Cash Flow Chart */}
        <div className="xl:col-span-2 flex flex-col gap-16">
          <MarketRatesWidget />
          
          <div className="glass-card p-12 flex flex-col h-[500px] border border-white/5 rounded-none bg-black/40 shadow-2xl">
            <div className="flex items-center justify-between mb-16 pb-8 border-b border-white/5">
              <div className="space-y-2">
                <h3 className="text-3xl font-display font-black uppercase tracking-tighter italic leading-none text-foreground drop-shadow-[0_0_10px_rgba(255,255,255,0.05)]">LIQUIDITY CURVE</h3>
                <p className="text-[10px] font-black uppercase text-muted-foreground/20 tracking-[0.4em] italic">12-WEEK HISTORICAL VS 12-WEEK PROJECTED VECTOR</p>
              </div>
              <div className="flex items-center gap-10 text-[9px] font-black tracking-[0.3em] uppercase text-muted-foreground/30 italic">
                 <div className="flex items-center gap-4"><div className="w-3 h-3 rounded-none bg-primary shadow-[0_0_15px_rgba(var(--primary),0.5)]"></div> HISTORY</div>
                 <div className="flex items-center gap-4"><div className="w-5 h-0.5 bg-primary/40 border-t border-dashed border-primary"></div> FORECAST</div>
              </div>
            </div>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
                  <XAxis dataKey="week" stroke="rgba(255,255,255,0.1)" fontSize={9} fontWeight={900} tickLine={false} axisLine={false} tickFormatter={v => `W${v}`} />
                  <YAxis stroke="rgba(255,255,255,0.1)" fontSize={9} fontWeight={900} tickFormatter={v => formatMoney(v).toUpperCase()} tickLine={false} axisLine={false} />
                  <Tooltip
                    cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
                    contentStyle={{ background: 'rgba(0, 0, 0, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0px', fontSize: '9px', backdropFilter: 'blur(40px)', padding: '20px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
                    itemStyle={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.3em', color: '#fff', marginBottom: '8px' }}
                    labelStyle={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.4em', color: 'rgba(255,255,255,0.3)', marginBottom: '16px', fontStyle: 'italic' }}
                    formatter={(value: number, name: string) => [formatMoney(value).toUpperCase(), name === 'histCash' ? 'ACTUAL CASH' : 'PROJECTED CASH']}
                  />
                  
                  {/* Historical Cash Area */}
                  <Area type="monotone" dataKey="histCash" stroke="rgba(var(--primary), 1)" strokeWidth={3} fill="rgba(var(--primary), 0.05)" />
                  
                  {/* Forecast Cash Line */}
                  <Line type="monotone" dataKey="projCash" stroke="rgba(var(--primary), 0.4)" strokeWidth={3} strokeDasharray="12 12" dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Active Project Costs */}
        <div className="xl:col-span-1">
          <div className="glass-card flex flex-col h-full overflow-hidden border border-white/5 rounded-none bg-black/40 shadow-2xl">
            <div className="p-10 border-b border-white/5 bg-white/[0.01]">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/30 flex justify-between items-end italic">
                <span>DIRECT BURN RATES</span>
                <span className="text-red-400 tracking-tighter text-2xl font-display font-black">-{formatMoney(weeklyCosts).toUpperCase()}/WK</span>
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="flex flex-col divide-y divide-white/5">
                {activeProjects.length > 0 ? activeProjects.map(p => (
                  <div key={p.id} className="p-10 hover:bg-white/[0.03] transition-all duration-700 group">
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-xl font-display font-black uppercase tracking-tight group-hover:text-primary transition-all duration-700 italic leading-none drop-shadow-[0_0_10px_rgba(255,255,255,0.05)]">{p.title}</span>
                      <span className="text-md font-display font-black text-red-400 tracking-tighter italic leading-none">-{formatMoney(p.weeklyCost).toUpperCase()}</span>
                    </div>
                    <div className="flex items-center gap-8">
                       <div className="text-[9px] font-black tracking-[0.3em] text-muted-foreground/20 uppercase italic h-6 px-4 border border-white/5 bg-white/[0.01] flex items-center justify-center rounded-none group-hover:text-muted-foreground/60 transition-all duration-700">
                         {p.state.replace('_', ' ').toUpperCase()}
                       </div>
                       <div className="flex-1 h-[2px] bg-white/5 rounded-none overflow-hidden">
                          <div className="h-full bg-red-400/30 w-1/2 shadow-[0_0_10px_rgba(244,63,94,0.3)]" />
                       </div>
                    </div>
                  </div>
                )) : (
                  <div className="py-32 flex flex-col items-center text-center space-y-8 opacity-20">
                    <TrendingUp className="w-16 h-16 text-muted-foreground" strokeWidth={1} />
                    <div className="space-y-3 px-12">
                      <p className="text-xs font-black uppercase tracking-[0.5em] italic">NO ACTIVE BURN</p>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed">YOUR STUDIO CURRENTLY HAS NO ACTIVE PROJECTS INCURRING WEEKLY PRODUCTION COSTS.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Deep Economic Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="glass-card p-12 bg-black/40 border border-white/5 rounded-none shadow-2xl">
           <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/20 mb-12 pb-6 border-b border-white/5 italic flex items-center gap-4">
            <ArrowRightLeft className="w-4 h-4 text-primary/40" />
            REVENUE MIX // 12W ANALYSIS
           </h3>
           <div className="h-[250px]">
              <RevenueStreamChart data={gameState?.finance?.weeklyHistory || []} />
           </div>
        </div>

        <div className="glass-card p-12 bg-black/40 border border-white/5 rounded-none shadow-2xl">
           <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/20 mb-12 pb-6 border-b border-white/5 italic flex items-center gap-4">
            <TrendingUp className="w-4 h-4 text-emerald-400/40" />
            WEEKLY P&L WATERFALL
           </h3>
           <div className="h-[250px]">
              <ProfitWaterfallChart snapshot={gameState?.finance?.weeklyHistory?.slice(-1)[0]} />
           </div>
        </div>

        <div className="glass-card p-12 bg-black/40 border border-white/5 rounded-none shadow-2xl">
           <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/20 mb-12 pb-6 border-b border-white/5 italic flex items-center gap-4">
            <ShieldCheck className="w-4 h-4 text-secondary/40" />
            FISCAL EFFICIENCY COEFFICIENT
           </h3>
           <div className="h-[250px] flex items-center justify-center">
              <CashEfficiencyGauge score={gameState?.studio?.prestige || 75} />
           </div>
        </div>
      </div>

      {/* Project ROI Analytics */}
      <div className="glass-card overflow-hidden border border-white/5 rounded-none bg-black/40 shadow-2xl">
        <div className="p-10 border-b border-white/5 bg-white/[0.01]">
           <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground italic flex items-center gap-4">
            <ShieldCheck className="w-4 h-4 text-primary/40" />
            PROPERTY YIELD & ROI AUDIT
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/5">
          {releasedProjects.length > 0 ? releasedProjects.slice(0, 8).map(p => {
            const roi = calculateProjectROI(p);
            const isProfitable = roi > 1;
            
            return (
              <div key={p.id} className="p-10 hover:bg-white/[0.04] transition-all duration-700 group">
                  <div className="flex items-start justify-between mb-10">
                    <div className="space-y-4">
                      <h4 className="font-display font-black text-2xl tracking-tighter uppercase italic group-hover:text-primary transition-all duration-700 truncate max-w-[180px] leading-none drop-shadow-[0_0_10px_rgba(255,255,255,0.05)]">{p.title}</h4>
                      <div className="text-[9px] font-black tracking-[0.3em] text-muted-foreground/20 uppercase border border-white/5 bg-white/[0.01] px-3 py-1.5 rounded-none h-fit w-fit italic group-hover:text-muted-foreground/60 transition-all duration-700">
                        {p.distributionStatus?.toUpperCase() || ''}
                      </div>
                    </div>
                    <div className={cn("text-[9px] font-black tracking-[0.4em] uppercase h-8 px-5 flex items-center border border-transparent rounded-none italic shadow-lg", isProfitable ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/20" : "bg-red-400/10 text-red-400 border-red-400/20")}>
                      {isProfitable ? 'YIELD' : 'LOSS'}
                    </div>
                  </div>
                  
                  <div className="space-y-8">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-black text-muted-foreground/10 uppercase tracking-[0.3em] italic">GROSS YIELD</span>
                      <span className="text-xl font-display font-black text-emerald-400 tracking-tighter italic leading-none drop-shadow-[0_0_10px_rgba(16,185,129,0.2)]">{formatMoney(p.revenue).toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-black text-muted-foreground/10 uppercase tracking-[0.3em] italic">TOTAL SPEND</span>
                      <span className="text-xl font-display font-black text-red-400 tracking-tighter italic leading-none drop-shadow-[0_0_10px_rgba(244,63,94,0.2)]">{formatMoney(p.budget + (p.marketingBudget||0)).toUpperCase()}</span>
                    </div>
                    <div className="pt-8 border-t border-white/5 flex justify-between items-center">
                      <span className="text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 italic">YIELD RATIO</span>
                      <span className={cn("text-4xl font-display font-black tracking-tighter italic leading-none", isProfitable ? "text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "text-red-400 drop-shadow-[0_0_15px_rgba(244,63,94,0.3)]")}>
                        {roi.toFixed(2)}x
                      </span>
                    </div>
                  </div>
              </div>
            )
          }) : (
             <div className="col-span-full">
               <div className="py-48 flex flex-col items-center text-center space-y-10 opacity-20">
                 <Coins className="w-20 h-20 text-muted-foreground" strokeWidth={1} />
                 <div className="space-y-4 px-12">
                   <p className="text-sm font-black uppercase tracking-[0.6em] italic">NO ACTIVE CATALOG</p>
                   <p className="text-xs font-black uppercase tracking-[0.3em] leading-relaxed max-w-[400px]">PROPERTIES WILL APPEAR HERE FOR ROI AUDITING ONCE THEY HAVE CONCLUDED THEIR PRIMARY DISTRIBUTION WINDOWS.</p>
                 </div>
               </div>
             </div>
          )}
        </div>
      </div>

        </TabsContent>

        <TabsContent value="history" className="m-0 outline-none animate-in fade-in duration-1000">
          <YearInReviewChart />
        </TabsContent>

        <TabsContent value="capital" className="m-0 outline-none animate-in fade-in duration-1000">
          <LoanModal />
        </TabsContent>
      </Tabs>
    </div>
  );
};
