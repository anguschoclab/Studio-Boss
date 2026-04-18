import React from 'react';
import { FinancialOverviewWidget } from './FinancialOverviewWidget';
import { DemographicsWidget } from './DemographicsWidget';
import { StudioPulse } from './StudioPulse';
import { StudioHeader } from './StudioHeader';
import { StudioStatsGrid } from './StudioStatsGrid';
import { IntelligenceFeed } from './IntelligenceFeed';
import { useGameStore } from '@/store/gameStore';
import { useShallow } from 'zustand/react/shallow';

export const CommandCenter: React.FC = () => {
  const gameState = useGameStore(useShallow((state) => state.gameState));

  if (!gameState || !gameState.studio || !gameState.industry) return null;

  const projects = Object.values(gameState.entities?.projects || {});
  const normalizedTalents = gameState.entities?.talents || {};
  const normalizedRivals = gameState.entities?.rivals || {};
  const newsHistory = gameState?.industry?.newsHistory ?? [];
  const finance = gameState.finance;

  const activeProjectsCount = projects.filter(p => p.state !== 'released' && p.state !== 'post_release' && p.state !== 'archived').length;
  const releasedProjectsCount = projects.filter(p => p.state === 'released' || p.state === 'post_release').length;
  const talentCount = Object.keys(normalizedTalents).length;
  const rivalCount = Object.keys(normalizedRivals).length;
  
  // Calculate cash trend
  const cashHistory = finance.weeklyHistory?.slice(-8).map(h => h.cash) || [];
  const cashTrend = cashHistory.length > 1 
    ? (cashHistory[cashHistory.length - 1] - cashHistory[0]) / Math.abs(cashHistory[0] || 1) * 100
    : 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
      {/* Studio Executive Header */}
      <StudioHeader gameState={gameState} />

      {/* Studio Pulse Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <StudioPulse />
        </div>
        
        <StudioStatsGrid
          finance={finance}
          activeProjectsCount={activeProjectsCount}
          releasedProjectsCount={releasedProjectsCount}
          prestige={gameState.studio.prestige}
          talentCount={talentCount}
          rivalCount={rivalCount}
          cashHistory={cashHistory}
          cashTrend={cashTrend}
        />
      </div>

      {/* Strategic Visualization Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 text-left">
        <div className="lg:col-span-2 relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-transparent to-transparent rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          <FinancialOverviewWidget />
        </div>
        <div className="lg:col-span-1 relative group">
          <div className="absolute -inset-1 bg-gradient-to-l from-secondary/20 via-transparent to-transparent rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          <DemographicsWidget />
        </div>
      </div>
      
      {/* Recent Industry Intelligence */}
      <IntelligenceFeed newsHistory={newsHistory} />
    </div>
  );
};
