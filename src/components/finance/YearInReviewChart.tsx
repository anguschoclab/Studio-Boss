import { useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { formatMoney } from '@/engine/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

export const YearInReviewChart = () => {
  const snapshots = useGameStore(s => s.snapshots);

  const chartData = useMemo(() => {
    return snapshots.map(s => ({
      name: `Year ${s.year}`,
      funds: s.funds,
      completed: s.completedProjects,
      active: s.activeProjects,
      prestige: s.totalPrestige
    }));
  }, [snapshots]);

  if (snapshots.length === 0) {
    return (
      <Card className="border-border/40 bg-card/60 backdrop-blur-md shadow-sm h-[300px] flex items-center justify-center">
        <div className="text-center opacity-60">
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground bg-muted/10 inline-block px-4 py-2 rounded-full border border-border/20 shadow-inner">
            No yearly data recorded yet
          </p>
          <p className="text-[10px] text-muted-foreground mt-2 font-medium tracking-wide">Snapshots are taken at the end of every fiscal year (Week 52)</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-border/40 bg-card/60 bg-gradient-to-br from-card/80 to-transparent backdrop-blur-md shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300">
      <CardHeader className="pb-4 border-b border-border/30 bg-background/40 backdrop-blur-sm">
        <CardTitle className="text-xs font-display font-black uppercase tracking-widest text-foreground/80 drop-shadow-sm flex justify-between items-center">
          <span>Historical Studio Performance</span>
          <span className="text-primary font-mono text-[10px] tracking-normal uppercase bg-primary/10 px-2 py-0.5 rounded border border-primary/20">{snapshots.length} Year{snapshots.length > 1 ? 's' : ''} Record</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="hsl(215, 20%, 35%)" 
              fontSize={11} 
              tickLine={false} 
              axisLine={false} 
              fontFamily="inherit"
              fontWeight="bold"
            />
            <YAxis 
              yAxisId="left"
              stroke="hsl(215, 20%, 35%)" 
              fontSize={11} 
              tickFormatter={v => formatMoney(v)} 
              tickLine={false} 
              axisLine={false} 
              fontFamily="inherit"
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              stroke="hsl(215, 20%, 35%)" 
              fontSize={11} 
              tickLine={false} 
              axisLine={false} 
              fontFamily="inherit"
            />
            <Tooltip
              contentStyle={{ 
                background: 'rgba(15, 23, 42, 0.9)', 
                border: '1px solid rgba(51, 65, 85, 0.6)', 
                borderRadius: '12px', 
                fontSize: '12px', 
                backdropFilter: 'blur(16px)', 
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                fontFamily: 'inherit',
                color: '#fff'
              }}
              itemStyle={{ fontWeight: 700 }}
              labelStyle={{ fontWeight: 900, marginBottom: '8px', color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.05em' }}
              formatter={(value: number, name: string) => {
                if (name === 'funds') return [formatMoney(value), 'Studio Funds'];
                if (name === 'completed') return [value, 'Projects Released'];
                return [value, name.charAt(0).toUpperCase() + name.slice(1)];
              }}
            />
            <Legend 
              verticalAlign="top" 
              height={36} 
              iconType="circle" 
              formatter={(value) => <span className="text-[10px] font-black uppercase tracking-widest text-foreground/70">{value === 'funds' ? 'Financial Growth' : value === 'completed' ? 'Output' : value}</span>}
            />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="funds" 
              stroke="hsl(48, 96%, 53%)" 
              strokeWidth={4} 
              dot={{ r: 6, fill: 'hsl(48, 96%, 53%)', strokeWidth: 2, stroke: '#fff' }} 
              activeDot={{ r: 8, strokeWidth: 0 }}
              style={{ filter: 'drop-shadow(0 0 8px rgba(234,179,8,0.5))' }}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="completed" 
              stroke="hsl(142, 71%, 45%)" 
              strokeWidth={3} 
              dot={{ r: 4, fill: 'hsl(142, 71%, 45%)' }}
              style={{ filter: 'drop-shadow(0 0 6px rgba(34,197,94,0.4))' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
