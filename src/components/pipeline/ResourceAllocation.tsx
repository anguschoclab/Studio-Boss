import React, { useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatMoney } from '@/engine/utils';
import { cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Wallet, AlertTriangle } from 'lucide-react';

interface ResourceAllocationProps {
  className?: string;
}

export const ResourceAllocation: React.FC<ResourceAllocationProps> = ({ className }) => {
  const gameState = useGameStore(s => s.gameState);

  const { projects, finance } = useMemo(() => {
    if (!gameState) {
      return { projects: [], finance: { cash: 0 } };
    }
    const projects = Object.values(gameState.entities.projects);
    return { projects, finance: gameState.finance };
  }, [gameState]);

  const allocationData = useMemo(() => {
    const activeProjects = projects.filter(p =>
      p.state === 'production' || p.state === 'development' || p.state === 'marketing'
    );

    return activeProjects.map(p => ({
      name: p.title.length > 15 ? p.title.slice(0, 15) + '...' : p.title,
      fullName: p.title,
      weeklyCost: p.weeklyCost || 0,
      state: p.state,
      budget: p.budget,
      accumulated: p.accumulatedCost || 0,
      percentUsed: p.budget > 0 ? ((p.accumulatedCost || 0) / p.budget) * 100 : 0,
    }));
  }, [projects]);

  const totalWeeklyBurn = allocationData.reduce((sum, p) => sum + p.weeklyCost, 0);
  const runway = totalWeeklyBurn > 0 ? finance.cash / totalWeeklyBurn : 999;

  // Group by state for stacked view
  const stateGroups = useMemo(() => {
    const groups: Record<string, typeof allocationData> = {
      development: [],
      production: [],
      marketing: [],
    };

    allocationData.forEach(p => {
      if (groups[p.state]) {
        groups[p.state].push(p);
      }
    });

    return groups;
  }, [allocationData]);

  if (!gameState) return null;

  const isOverallocated = runway < 8;
  const isCritical = runway < 4;

  return (
    <Card className={cn("border-border/50", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-primary" />
            <CardTitle className="text-xs font-black uppercase tracking-wider">
              Resource Allocation
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {isOverallocated && (
              <div className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold",
                isCritical ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400"
              )}>
                <AlertTriangle className="w-3 h-3" />
                {isCritical ? 'Critical' : 'Warning'}
              </div>
            )}
            <span className="text-xs font-mono font-bold text-muted-foreground">
              {formatMoney(totalWeeklyBurn)}/wk
            </span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Runway indicator */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Cash Runway
          </span>
          <div className="flex items-center gap-2">
            <div className={cn(
              "text-sm font-black font-display",
              isCritical ? "text-red-400" : isOverallocated ? "text-amber-400" : "text-emerald-400"
            )}>
              {Math.floor(runway)} weeks
            </div>
            <div className={cn(
              "w-2 h-2 rounded-full",
              isCritical ? "bg-red-500 animate-pulse" : isOverallocated ? "bg-amber-500" : "bg-emerald-500"
            )} />
          </div>
        </div>

        {/* Project burn chart */}
        {allocationData.length > 0 ? (
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={allocationData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={80}
                  tick={{ fontSize: 9, fontWeight: 700 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-card border border-border p-2 rounded-lg shadow-lg">
                          <p className="text-xs font-bold mb-1">{data.fullName}</p>
                          <p className="text-[10px] text-muted-foreground">{data.state}</p>
                          <div className="mt-2 space-y-1">
                            <div className="flex justify-between text-[10px]">
                              <span>Weekly Cost:</span>
                              <span className="font-mono font-bold">{formatMoney(data.weeklyCost)}</span>
                            </div>
                            <div className="flex justify-between text-[10px]">
                              <span>Budget Used:</span>
                              <span className={cn(
                                "font-mono font-bold",
                                data.percentUsed > 90 ? "text-red-400" : data.percentUsed > 70 ? "text-amber-400" : "text-emerald-400"
                              )}>
                                {Math.round(data.percentUsed)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="weeklyCost" radius={[0, 4, 4, 0]} maxBarSize={20}>
                  {allocationData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.percentUsed > 90 ? '#ef4444' : entry.percentUsed > 70 ? '#f59e0b' : '#22c55e'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-32 flex items-center justify-center text-muted-foreground">
            <p className="text-sm">No active production costs</p>
          </div>
        )}

        {/* State breakdown */}
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(stateGroups).map(([state, projects]) => {
            const total = projects.reduce((sum, p) => sum + p.weeklyCost, 0);
            if (total === 0) return null;
            
            return (
              <div key={state} className="p-2 rounded-lg bg-background/50 text-center">
                <p className="text-[9px] font-bold uppercase text-muted-foreground mb-1">{state}</p>
                <p className="text-xs font-mono font-bold">{formatMoney(total)}</p>
                <p className="text-[9px] text-muted-foreground">{projects.length} projects</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
