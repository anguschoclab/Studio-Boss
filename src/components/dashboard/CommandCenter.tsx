import React from 'react';
import { FinancialOverviewWidget } from './FinancialOverviewWidget';
import { DemographicsWidget } from './DemographicsWidget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGameStore } from '@/store/gameStore';
import { Badge } from '@/components/ui/badge';
import { Clapperboard, Users, Building2, TrendingUp } from 'lucide-react';

export const CommandCenter: React.FC = () => {
  const gameState = useGameStore((state) => state.gameState);
  if (!gameState) return null;

  const { studio, industry } = gameState;
  const { projects } = studio.internal;
  const { talentPool, rivals } = industry;

  const activeProjectsCount = projects.filter(p => p.status !== 'released' && p.status !== 'post_release' && p.status !== 'archived').length;
  const talentCount = talentPool.length;
  const rivalCount = rivals.length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Top KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/60 backdrop-blur-xl border-border/50 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 group overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors duration-300">Active Pipeline</CardTitle>
            <div className="p-2 bg-primary/10 rounded-md ring-1 ring-inset ring-primary/20 group-hover:bg-primary/20 transition-colors duration-300">
              <Clapperboard className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-black tracking-tight text-foreground/90">{activeProjectsCount}</div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mt-1.5">Projects in dev</p>
          </CardContent>
        </Card>

        <Card className="bg-card/60 backdrop-blur-xl border-border/50 shadow-sm hover:shadow-md hover:border-secondary/30 transition-all duration-300 group overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors duration-300">Talent Roster</CardTitle>
            <div className="p-2 bg-secondary/10 rounded-md ring-1 ring-inset ring-secondary/20 group-hover:bg-secondary/20 transition-colors duration-300">
              <Users className="h-4 w-4 text-secondary" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-black tracking-tight text-foreground/90">{talentCount}</div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mt-1.5">Contracted pool</p>
          </CardContent>
        </Card>

        <Card className="bg-card/60 backdrop-blur-xl border-border/50 shadow-sm hover:shadow-md hover:border-destructive/30 transition-all duration-300 group overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors duration-300">Active Rivals</CardTitle>
            <div className="p-2 bg-destructive/10 rounded-md ring-1 ring-inset ring-destructive/20 group-hover:bg-destructive/20 transition-colors duration-300">
              <Building2 className="h-4 w-4 text-destructive" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-black tracking-tight text-foreground/90">{rivalCount}</div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mt-1.5">Competing studios</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card/60 backdrop-blur-xl border-border/50 shadow-sm hover:shadow-md hover:border-chart-4/30 transition-all duration-300 group overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-chart-4/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors duration-300">Studio Rep</CardTitle>
            <div className="p-2 bg-chart-4/10 rounded-md ring-1 ring-inset ring-chart-4/20 group-hover:bg-chart-4/20 transition-colors duration-300">
              <TrendingUp className="h-4 w-4 text-chart-4" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-xl font-black tracking-tight text-foreground/90 mt-1">Respected</div>
            <Badge variant="outline" className="mt-2.5 bg-chart-4/10 text-chart-4 border-chart-4/30 text-[9px] uppercase tracking-widest font-bold">Tier 2</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Main Data Vis Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <FinancialOverviewWidget />
        <DemographicsWidget />
      </div>
      
      {/* We will add a 'Recent Activity / Action Items' widget row here next */}
    </div>
  );
};
