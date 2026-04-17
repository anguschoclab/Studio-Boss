import { calculateWeeklyCosts, calculateWeeklyRevenue, calculateStudioNetWorth, generateCashflowForecast } from '@/engine/systems/finance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ComposedChart, Line } from 'recharts';
import { YearInReviewChart } from '@/components/finance/YearInReviewChart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { History, LayoutDashboard, ReceiptText, TrendingUp, Package, Coins } from 'lucide-react';
import { MarketRatesWidget } from '@/components/finance/MarketRatesWidget';
import { SummaryCards } from '@/components/finance/SummaryCards';
import { ActiveProjectCosts } from '@/components/finance/ActiveProjectCosts';
import { EconomicAnalytics } from '@/components/finance/EconomicAnalytics';
import { ProjectROIAnalytics } from '@/components/finance/ProjectROIAnalytics';
import { useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useShallow } from 'zustand/react/shallow';
import { formatMoney } from '@/engine/utils';
import { selectProjects } from '@/store/selectors';
import { useFinanceHistory } from '@/hooks/useFinanceHistory';

const EMPTY_HISTORY: import('@/engine/types/state.types').FinancialSnapshot[] = [];
const EMPTY_PROJECTS: import('@/engine/types').Project[] = [];

export const FinancePanel = () => {
  // Use atomic selectors to prevent unnecessary re-renders when unrelated gameState parts change
  const cash = useGameStore(s => s.gameState?.finance?.cash ?? 0);
  const prestige = useGameStore(s => s.gameState?.studio?.prestige ?? 75);
  const snapshots = useGameStore(useShallow(s => s.snapshots || []));

  // Use useShallow for arrays/objects extracted from state
  // ⚡ Bolt: Removed inline array allocation using Object.values() to prevent unnecessary re-renders
  const projectsMemo = useGameStore(useShallow(s => s.gameState ? selectProjects(s.gameState) : EMPTY_PROJECTS));
  
  // Data Shedding: Use TanStack Query for historical data
  const financeHistory = useFinanceHistory() ?? EMPTY_HISTORY;

  // Need entire gameState for complex calculations like Net Worth and Forecasts
  // ⚡ The Framerate Fanatic: Moved complex calculations inside the Zustand selector with useShallow to prevent React from re-rendering unless the final computed numbers actually change.
  const { weeklyCosts, netDelta, studioNetWorth, forecast } = useGameStore(useShallow(s => {
    const state = s.gameState;
    if (!state) return { weeklyCosts: 0, netDelta: 0, studioNetWorth: 0, forecast: [] };
    const costs = calculateWeeklyCosts(state);
    const rev = calculateWeeklyRevenue(state);
    return {
      weeklyCosts: costs,
      netDelta: rev - costs,
      studioNetWorth: calculateStudioNetWorth(state),
      forecast: generateCashflowForecast(state, 12)
    };
  }));

  const activeProjects = useMemo(() =>
    projectsMemo.filter(p => p.state === 'development' || p.state === 'production'),
    [projectsMemo]
  );
  
  const releasedProjects = useMemo(() => 
    projectsMemo.filter(p => p.state === 'released' || p.state === 'post_release' || p.state === 'archived').sort((a,b) => (b.revenue || 0) - (a.revenue || 0)),
    [projectsMemo]
  );

  const latestFinanceSnapshot = useMemo(() =>
    financeHistory.length > 0 ? financeHistory[financeHistory.length - 1] : null,
    [financeHistory]
  );

  const chartData = useMemo(() => {
    if (!financeHistory || financeHistory.length === 0) return [];
    
    // Convert snapshots to chart format
    const history = financeHistory.map((h: any) => ({
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex items-center justify-between border-b border-border/40 pb-4 bg-gradient-to-r from-background to-transparent">
        <h2 className="text-3xl font-display font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 drop-shadow-sm">
          Financials & Forecasts
        </h2>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              tooltip="Access comprehensive historical financial records and audit logs"
              className="font-display font-black uppercase tracking-widest text-[10px] gap-2 hover:bg-primary/10 hover:text-primary transition-all"
            >
              <ReceiptText className="w-3 h-3" />
              View Full Ledger
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[400px] sm:w-[540px] border-l border-border/40 bg-background/95 backdrop-blur-xl">
            <SheetHeader className="border-b border-border/20 pb-6">
              <SheetTitle className="font-display text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                <Coins className="w-6 h-6 text-primary" />
                Studio Ledger
              </SheetTitle>
              <SheetDescription className="text-xs font-medium tracking-wide">
                Historical record of yearly performance and financial benchmarks.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-8 space-y-4 overflow-y-auto max-h-[calc(100vh-180px)] pr-2 custom-scrollbar">
              {snapshots.slice().reverse().map((s, i) => (
                <Card key={i} className="border-border/40 bg-card/40 backdrop-blur-md shadow-sm group hover:border-primary/30 transition-all duration-300">
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div className="space-y-1">
                        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Fiscal Year</p>
                        <p className="text-2xl font-display font-black text-foreground">{s.year}</p>
                      </div>
                      <Badge variant="outline" className="text-[9px] font-black tracking-widest uppercase bg-primary/5 text-primary border-primary/20">
                        Snapshot Taken
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-background/40 p-3 rounded-lg border border-border/20">
                        <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mb-1 flex items-center gap-1">
                          <TrendingUp className="w-2 h-2" /> Total Funds
                        </p>
                        <p className="text-sm font-bold font-mono text-success">{formatMoney(s.funds)}</p>
                      </div>
                      <div className="bg-background/40 p-3 rounded-lg border border-border/20">
                        <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mb-1 flex items-center gap-1">
                          <Package className="w-2 h-2" /> Projects
                        </p>
                        <p className="text-sm font-bold font-mono">{s.completedProjects} Completed</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {(snapshots.length === 0) && (
                <div className="text-center py-12 opacity-50 px-8">
                   <History className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                   <p className="text-sm font-bold uppercase tracking-widest mb-2">No Records Yet</p>
                   <p className="text-[10px] font-medium leading-relaxed">The ledger is updated automatically at the end of every fiscal year (Week 52).</p>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <Tabs defaultValue="current" className="space-y-6">
        <TabsList className="bg-muted/30 backdrop-blur-md border border-border/40 p-1">
          <TabsTrigger value="current" className="gap-2 font-display font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all px-6">
            <LayoutDashboard className="w-3 h-3" />
            Current Operations
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2 font-display font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all px-6">
            <History className="w-3 h-3" />
            Historical Trends
          </TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-6 m-0 outline-none">

      {/* Summary Cards */}
      <SummaryCards metrics={[
        { label: 'Available Cash', value: formatMoney(cash), color: cash < 0 ? 'text-destructive drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 'text-primary drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]', bg: 'from-card/80 to-card/40', tooltip: 'Total liquid capital available for studio operations and project funding.' },
        { label: 'Total Net Worth', value: formatMoney(studioNetWorth), color: 'text-foreground', bg: 'from-card/80 to-card/40', tooltip: 'Estimated total value of all studio assets, including cash, IP, and talent contracts.' },
        { label: 'Projected Net Delta', value: `${netDelta >= 0 ? '+' : ''}${formatMoney(netDelta)}/wk`, color: netDelta >= 0 ? 'text-success drop-shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'text-destructive drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]', bg: netDelta >= 0 ? 'from-success/5 to-transparent' : 'from-destructive/5 to-transparent', tooltip: 'Estimated weekly profit or loss based on current revenue streams and production burn.' },
        { label: '12-Wk Forecast Cash', value: formatMoney(forecast.length > 0 ? forecast[forecast.length - 1].projected : 0), color: 'text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.4)]', bg: 'from-purple-500/5 to-transparent', tooltip: 'Projected cash position in 12 weeks based on current trajectory and known milestones.' },
      ]} />

      <div className="grid grid-cols-3 gap-6 h-[400px]">
        {/* Cash Flow Chart */}
        <div className="col-span-2 flex flex-col h-full">
          <div className="mb-6">
            <MarketRatesWidget />
          </div>
          
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
          <ActiveProjectCosts activeProjects={activeProjects} weeklyCosts={weeklyCosts} />
        </div>
      </div>
      
      {/* Deep Economic Analytics */}
      <EconomicAnalytics 
        financeHistory={financeHistory} 
        latestFinanceSnapshot={latestFinanceSnapshot} 
        prestige={prestige} 
      />

      {/* Project ROI Analytics */}
      <ProjectROIAnalytics releasedProjects={releasedProjects} />

        </TabsContent>

        <TabsContent value="history" className="m-0 outline-none">
          <YearInReviewChart />
        </TabsContent>
      </Tabs>
    </div>
  );
};
