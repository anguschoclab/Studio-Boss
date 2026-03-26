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
        <Card className="bg-card/40 border-muted">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Pipeline</CardTitle>
            <Clapperboard className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProjectsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Projects in development</p>
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-muted">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Talent Roster</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{talentCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Contracted & Freelance</p>
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-muted">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Rivals</CardTitle>
            <Building2 className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rivalCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Competing studios</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card/40 border-muted">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Studio Rep</CardTitle>
            <TrendingUp className="h-4 w-4 text-chart-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Respected</div>
            <Badge variant="outline" className="mt-1 bg-chart-4/10 text-chart-4 border-chart-4/20">Tier 2</Badge>
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
