import { useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { formatMoney } from '@/engine/utils';
import { calculateWeeklyCosts, calculateWeeklyRevenue } from '@/engine/systems/finance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const FinancePanel = () => {
  const gameState = useGameStore(s => s.gameState);

  const cash = gameState?.cash ?? 0;
  const financeHistory = gameState?.financeHistory ?? [];
  const projects = gameState?.projects ?? [];

  const weeklyCosts = useMemo(() => calculateWeeklyCosts(projects), [projects]);
  const weeklyRevenue = useMemo(() => calculateWeeklyRevenue(projects), [projects]);
  const netDelta = useMemo(() => weeklyRevenue - weeklyCosts, [weeklyRevenue, weeklyCosts]);

  const activeProjects = useMemo(() =>
    projects.filter(p => p.status === 'development' || p.status === 'production'),
    [projects]
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between border-b border-border/40 pb-4">
        <h2 className="text-3xl font-display font-black tracking-tight text-foreground/90 drop-shadow-sm">
          Financials
        </h2>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Cash on Hand', value: formatMoney(cash), color: cash < 0 ? 'text-destructive drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 'text-primary drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]', bg: 'from-card/80 to-card/40' },
          { label: 'Weekly Revenue', value: `+${formatMoney(weeklyRevenue)}`, color: 'text-success drop-shadow-[0_0_8px_rgba(34,197,94,0.4)]', bg: 'from-success/10 to-transparent' },
          { label: 'Weekly Costs', value: `-${formatMoney(weeklyCosts)}`, color: 'text-destructive drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]', bg: 'from-destructive/10 to-transparent' },
          { label: 'Net Delta', value: `${netDelta >= 0 ? '+' : ''}${formatMoney(netDelta)}`, color: netDelta >= 0 ? 'text-success drop-shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'text-destructive drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]', bg: netDelta >= 0 ? 'from-success/5 to-transparent' : 'from-destructive/5 to-transparent' },
        ].map((metric, i) => (
          <Card key={metric.label} className={`border-border/40 bg-card/60 bg-gradient-to-br ${metric.bg} backdrop-blur-md shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group`} style={{ animationDelay: `${i * 100}ms` }}>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
            <CardContent className="p-5">
              <p className="text-[10px] text-muted-foreground/80 uppercase tracking-widest font-black drop-shadow-sm">{metric.label}</p>
              <p className={`text-3xl font-display font-black tracking-tighter mt-2 ${metric.color} transition-colors duration-300`}>{metric.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6 h-[400px]">
        {/* Cash Flow Chart */}
        <div className="col-span-2 flex flex-col h-full">
          <Card className="border-border/40 bg-card/60 bg-gradient-to-br from-card/80 to-transparent backdrop-blur-md shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 flex-1 flex flex-col">
            <CardHeader className="pb-4 border-b border-border/30 bg-background/40 backdrop-blur-sm shrink-0">
              <CardTitle className="text-xs font-display font-black uppercase tracking-widest text-foreground/80 drop-shadow-sm">
                Cash Flow History
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={financeHistory.slice(-24)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="cashGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(48, 96%, 53%)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="hsl(48, 96%, 53%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="week"
                    stroke="hsl(215, 20%, 35%)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={v => `W${v}`}
                  />
                  <YAxis
                    stroke="hsl(215, 20%, 35%)"
                    fontSize={11}
                    tickFormatter={v => formatMoney(v)}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(15, 23, 42, 0.9)',
                      border: '1px solid rgba(51, 65, 85, 0.5)',
                      borderRadius: '8px',
                      fontSize: '12px',
                      backdropFilter: 'blur(8px)',
                      boxShadow: '0 8px 30px rgb(0,0,0,0.2)',
                    }}
                    itemStyle={{ color: 'hsl(48, 96%, 53%)', fontWeight: 'bold' }}
                    formatter={(value: number) => [formatMoney(value), 'Cash']}
                    labelFormatter={l => `Week ${l}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="cash"
                    stroke="hsl(48, 96%, 53%)"
                    fill="url(#cashGrad)"
                    strokeWidth={3}
                    style={{ filter: 'drop-shadow(0 0 8px rgba(234,179,8,0.4))' }}
                  />
                </AreaChart>
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
                <span className="text-destructive drop-shadow-[0_0_4px_rgba(239,68,68,0.3)]">-{formatMoney(weeklyCosts)}/wk</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-y-auto custom-scrollbar">
              <div className="flex flex-col divide-y divide-border/20">
                {activeProjects.length > 0 ? activeProjects.map(p => (
                  <div key={p.id} className="flex flex-col gap-1.5 p-4 hover:bg-muted/10 transition-colors group">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-foreground/90 group-hover:text-primary transition-colors">{p.title}</span>
                      <span className="text-sm text-destructive font-bold drop-shadow-[0_0_2px_rgba(239,68,68,0.2)]">-{formatMoney(p.weeklyCost)}/wk</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="text-[9px] font-bold tracking-widest text-muted-foreground/80 uppercase bg-background/50 backdrop-blur-sm border border-border/40 px-2 py-0.5 rounded-full shadow-sm">{p.status}</span>
                    </div>
                  </div>
                )) : (
                  <div className="p-8 text-center">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/50 bg-muted/10 inline-block px-4 py-2 rounded-full border border-border/20">No active projects</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
