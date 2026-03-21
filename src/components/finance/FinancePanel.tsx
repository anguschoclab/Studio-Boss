import { useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { formatMoney } from '@/engine/utils';
import { calculateWeeklyCosts, calculateWeeklyRevenue } from '@/engine/systems/finance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const FinancePanel = () => {
  const gameState = useGameStore(s => s.gameState);

  const { cash, financeHistory, projects } = gameState;

  const weeklyCosts = useMemo(() => calculateWeeklyCosts(projects), [projects]);
  const weeklyRevenue = useMemo(() => calculateWeeklyRevenue(projects), [projects]);
  const netDelta = useMemo(() => weeklyRevenue - weeklyCosts, [weeklyRevenue, weeklyCosts]);

  const activeProjects = useMemo(() =>
    projects.filter(p => p.status === 'development' || p.status === 'production'),
    [projects]
  );

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Cash on Hand', value: formatMoney(cash), color: cash < 0 ? 'text-destructive' : 'text-primary' },
          { label: 'Weekly Revenue', value: `+${formatMoney(weeklyRevenue)}`, color: 'text-success' },
          { label: 'Weekly Costs', value: `-${formatMoney(weeklyCosts)}`, color: 'text-destructive' },
          { label: 'Net Delta', value: `${netDelta >= 0 ? '+' : ''}${formatMoney(netDelta)}`, color: netDelta >= 0 ? 'text-success' : 'text-destructive' },
        ].map(metric => (
          <Card key={metric.label} className="border-border/50 bg-card/40 backdrop-blur shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">{metric.label}</p>
              <p className={`text-2xl font-display font-black tracking-tight mt-1.5 ${metric.color}`}>{metric.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Cash Flow Chart */}
      <Card className="border-border/50 bg-card/30 backdrop-blur-sm shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-display uppercase tracking-wider text-muted-foreground">
            Cash Flow History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={financeHistory.slice(-24)}>
              <defs>
                <linearGradient id="cashGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(48, 96%, 53%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(48, 96%, 53%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="week"
                stroke="hsl(215, 20%, 35%)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
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
                  background: 'hsl(217, 33%, 10%)',
                  border: '1px solid hsl(217, 33%, 18%)',
                  borderRadius: '4px',
                  fontSize: '12px',
                }}
                formatter={(value: number) => [formatMoney(value), 'Cash']}
                labelFormatter={l => `Week ${l}`}
              />
              <Area
                type="monotone"
                dataKey="cash"
                stroke="hsl(48, 96%, 53%)"
                fill="url(#cashGrad)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Active Project Costs */}
      {activeProjects.length > 0 && (
        <Card className="border-border/50 bg-card/30 backdrop-blur-sm shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-display uppercase tracking-wider text-muted-foreground">
              Active Project Costs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {activeProjects.map(p => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0 hover:bg-muted/20 px-2 -mx-2 rounded transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground/90">{p.title}</span>
                    <span className="text-[9px] font-bold tracking-widest text-muted-foreground uppercase bg-muted/50 px-1.5 py-0.5 rounded">{p.status}</span>
                  </div>
                  <span className="text-sm text-destructive font-medium">-{formatMoney(p.weeklyCost)}/wk</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
