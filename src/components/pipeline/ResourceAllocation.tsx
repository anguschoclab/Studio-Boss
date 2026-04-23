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

interface AllocationEntry {
  name: string;
  fullName: string;
  weeklyCost: number;
  state: string;
  budget: number;
  accumulated: number;
  percentUsed: number;
}

export const ResourceAllocation: React.FC<ResourceAllocationProps> = ({ className }) => {
  const gameState = useGameStore(s => s.gameState);

  const { projects, finance } = useMemo(() => {
    if (!gameState) {
      return { projects: [], finance: { cash: 0 } };
    }
    const projectsArray = Object.values(gameState.entities.projects);
    return { projects: projectsArray, finance: gameState.finance };
  }, [gameState]);

  const allocationData = useMemo<AllocationEntry[]>(() => {
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
    const groups: Record<string, AllocationEntry[]> = {
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
    <Card className={cn("rounded-2xl border-white/5 bg-white/[0.01] backdrop-blur-xl", className)}>
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wallet className="w-4 h-4 text-primary" />
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 italic">
              Resource Allocation Matrix
            </CardTitle>
          </div>
          <div className="flex items-center gap-4">
            {isOverallocated && (
              <div className={cn(
                "flex items-center gap-2 px-3 py-1 rounded-none text-[9px] font-black uppercase tracking-widest",
                isCritical ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
              )}>
                <AlertTriangle className="w-3 h-3" />
                {isCritical ? 'CRITICAL BURN' : 'OVERALLOCATED'}
              </div>
            )}
            <span className="text-[11px] font-display font-black italic tracking-tighter text-muted-foreground/80">
              {formatMoney(totalWeeklyBurn)}/WK
            </span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-8">
        {/* Runway indicator */}
        <div className="flex items-center justify-between p-4 bg-black/40 border border-white/5">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
            LIQUIDITY RUNWAY
          </span>
          <div className="flex items-center gap-3">
            <div className={cn(
              "text-lg font-black font-display italic tracking-tighter",
              isCritical ? "text-red-400" : isOverallocated ? "text-amber-400" : "text-emerald-400"
            )}>
              {Math.floor(runway)} WEEKS
            </div>
            <div className={cn(
              "w-2.5 h-2.5",
              isCritical ? "bg-red-500 animate-pulse" : isOverallocated ? "bg-amber-500" : "bg-emerald-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]"
            )} />
          </div>
        </div>

        {/* Project burn chart */}
        {allocationData.length > 0 ? (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={allocationData} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={100}
                  tick={{ fontSize: 9, fontWeight: 900, fill: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as AllocationEntry;
                      return (
                        <div className="bg-black/90 border border-white/10 p-4 backdrop-blur-xl">
                          <p className="text-[10px] font-display font-black uppercase italic mb-1 text-primary">{data.fullName}</p>
                          <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest mb-3">{data.state}</p>
                          <div className="space-y-2">
                            <div className="flex justify-between gap-8 text-[10px]">
                              <span className="font-black text-muted-foreground/60">WEEKLY BURN:</span>
                              <span className="font-display font-black italic">{formatMoney(data.weeklyCost)}</span>
                            </div>
                            <div className="flex justify-between gap-8 text-[10px]">
                              <span className="font-black text-muted-foreground/60">BUZZ UTILIZATION:</span>
                              <span className={cn(
                                "font-display font-black italic",
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
                <Bar dataKey="weeklyCost" radius={[0, 0, 0, 0]} maxBarSize={16}>
                  {allocationData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.percentUsed > 90 ? '#ef4444' : entry.percentUsed > 70 ? '#f59e0b' : 'rgba(var(--primary), 0.6)'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center border border-dashed border-white/5">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/20 italic">ZERO ACTIVE PRODUCTION COSTS</p>
          </div>
        )}

        {/* State breakdown */}
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(stateGroups).map(([state, projects]) => {
            const total = projects.reduce((sum, p) => sum + p.weeklyCost, 0);
            if (total === 0) return null;
            
            return (
              <div key={state} className="p-4 bg-white/[0.02] border border-white/5 text-left group hover:bg-white/[0.04] transition-colors">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mb-2 group-hover:text-primary transition-colors">{state}</p>
                <p className="text-sm font-display font-black italic tracking-tighter mb-1">{formatMoney(total)}</p>
                <p className="text-[9px] font-black text-muted-foreground/20 uppercase tracking-widest">{projects.length} PROJECTS</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
