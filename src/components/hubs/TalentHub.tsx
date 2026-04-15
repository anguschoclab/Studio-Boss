import React, { useState, useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useUIStore, TalentSubTab } from '@/store/uiStore';
import { SubNav } from '@/components/navigation/SubNav';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/sonner';
import {
  Users,
  Search,
  Handshake,
  Building2,
  Sparkles,
  Star,
  Gavel,
  TrendingUp,
  Newspaper,
  Briefcase
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Talent, TalentRole, Opportunity } from '@/engine/types';
import { selectOpportunities } from '@/store/selectors';

// Lazy load components
const LiveAuctionDashboard = React.lazy(() => import('@/components/talent/LiveAuctionDashboard').then(m => ({ default: m.LiveAuctionDashboard })));
const AgencyPackagesPanel = React.lazy(() => import('@/components/agencies/AgencyPackagesPanel').then(m => ({ default: m.AgencyPackagesPanel })));
const SkeletonPage = React.lazy(() => import('@/components/shared/SkeletonCard').then(m => ({ default: m.SkeletonPage })));

// Roster View
const RosterPanel = () => {
  const state = useGameStore(s => s.gameState);
  const { selectTalent } = useUIStore();
  const [filter, setFilter] = useState<TalentRole | 'all'>('all');
  const [search, setSearch] = useState('');
  
  const talentPool = useMemo(() => 
    Object.values(state?.entities.talents || {}),
    [state?.entities.talents]
  );
  
  const filteredTalent = useMemo(() => {
    return talentPool.filter(t => {
      const matchesFilter = filter === 'all' || t.roles.includes(filter);
      const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    }).sort((a, b) => (b.starMeter || 0) - (a.starMeter || 0));
  }, [talentPool, filter, search]);
  
  const roleFilters: (TalentRole | 'all')[] = ['all', 'actor', 'director', 'writer', 'producer'];
  
  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-white/5 p-4 rounded-xl border border-white/5">
        <div className="flex gap-2 flex-wrap">
          {roleFilters.map(role => (
            <button
              key={role}
              onClick={() => setFilter(role)}
              className={cn(
                'px-3.5 py-1.5 text-[10px] uppercase tracking-wider font-black rounded-full transition-all duration-300 border',
                filter === role
                  ? 'bg-primary text-primary-foreground shadow-[0_0_15px_hsl(var(--primary)/0.4)] scale-105 border-primary/50'
                  : 'bg-muted/50 text-muted-foreground hover:bg-secondary/20 hover:text-foreground border-transparent hover:border-secondary/30'
              )}
            >
              {role}
            </button>
          ))}
        </div>
        
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search talent..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-10 pr-3 text-[11px] bg-black/40 border border-white/10 rounded-md focus:outline-none focus:border-primary/50"
          />
        </div>
      </div>
      
      {/* Talent Grid */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
          {filteredTalent.map((talent: Talent) => (
            <div 
              key={talent.id}
              onClick={() => selectTalent(talent.id)}
              className="group p-4 bg-card/40 border border-border/40 rounded-xl hover:border-primary/30 hover:bg-card/60 transition-all cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-lg font-black">
                  {talent.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm truncate group-hover:text-primary transition-colors">{talent.name}</h4>
                  <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">
                    {talent.roles.join(' / ')}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="text-[9px]">
                      <Star className="h-3 w-3 mr-1" />
                      {talent.prestige}
                    </Badge>
                    {talent.starMeter && (
                      <Badge variant="outline" className="text-[9px]">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {talent.starMeter}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredTalent.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Users className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-sm font-bold uppercase tracking-widest">No talent found</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Marketplace View (IP Opportunities + Talent Packages)
const MarketplacePanel = () => {
  const gameState = useGameStore(s => s.gameState);
  const opportunities = selectOpportunities(gameState);
  const [selectedAuction, setSelectedAuction] = useState<Opportunity | null>(null);
  const [activeTab, setActiveTab] = useState<'scripts' | 'talent'>('scripts');
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setActiveTab('scripts')}
          className={cn(
            'px-4 py-2 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all',
            activeTab === 'scripts'
              ? 'bg-primary/20 text-primary'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Newspaper className="h-3.5 w-3.5 inline mr-2" />
          Script Marketplace
        </button>
        <button
          onClick={() => setActiveTab('talent')}
          className={cn(
            'px-4 py-2 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all',
            activeTab === 'talent'
              ? 'bg-primary/20 text-primary'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Sparkles className="h-3.5 w-3.5 inline mr-2" />
          Talent Packages
        </button>
      </div>
      
      <div className="flex-1 overflow-hidden">
        {activeTab === 'scripts' ? (
          <div className="h-full overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
              {opportunities.length === 0 ? (
                <div className="col-span-full py-20 text-center">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                    No active opportunities
                  </p>
                </div>
              ) : (
                opportunities.map(opp => {
                  const hasBids = Object.keys(opp.bids || {}).length > 0;
                  return (
                    <div 
                      key={opp.id}
                      className="p-4 bg-card/40 border border-border/40 rounded-xl hover:border-primary/30 transition-all cursor-pointer"
                      onClick={() => setSelectedAuction(opp)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-sm">{opp.title}</h4>
                        <Badge variant="outline" className="text-[9px]">{opp.type}</Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-2">{opp.flavor}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <Badge variant="secondary" className="text-[9px]">{opp.genre}</Badge>
                        {hasBids && (
                          <Badge className="text-[9px] bg-amber-500/20 text-amber-500">
                            <Gavel className="h-3 w-3 mr-1" />
                            Bidding Active
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          <React.Suspense fallback={<SkeletonPage contentCards={3} />}>
            <AgencyPackagesPanel
              agencies={gameState?.industry?.agencies || []}
              packages={(gameState?.market?.opportunities || []).filter((o) => o.type === 'package' && o.origin === 'agency_package')}
              onCreatePackage={() => {
                toast.info('Package creation coming soon', {
                  description: 'Select agency, tier, and talent to create a package'
                });
              }}
              onViewPackage={(id) => {
                toast.info('Package details coming soon', {
                  description: `View package ${id} - package detail modal coming soon`
                });
              }}
              onBidPackage={(id) => {
                toast.info('Bidding mechanics coming soon', {
                  description: `Bid on package ${id} - bidding mechanics coming soon`
                });
              }}
            />
          </React.Suspense>
        )}
      </div>
      
      {selectedAuction && (
        <LiveAuctionDashboard 
          opportunity={selectedAuction}
          onClose={() => setSelectedAuction(null)}
        />
      )}
    </div>
  );
};

// Negotiations Panel
const NegotiationsPanel = () => {
  const gameState = useGameStore(s => s.gameState);
  const activeDeals = gameState?.deals?.activeDeals || [];

  if (activeDeals.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <Handshake className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-bold uppercase tracking-widest">Active Negotiations</p>
          <p className="text-sm mt-2">No pending offers or counter-offers</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold uppercase tracking-wider">Active Negotiations</h3>
        <Badge variant="outline">{activeDeals.length} Active</Badge>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto">
        {activeDeals.map((deal: any) => (
          <div
            key={deal.id}
            className="p-4 rounded-lg bg-secondary/50 border border-border hover:border-primary/50 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-bold text-sm">{deal.projectTitle || 'Unnamed Project'}</p>
                <p className="text-xs text-muted-foreground">{deal.buyerName || 'Unknown Buyer'}</p>
              </div>
              <Badge variant={deal.status === 'pending' ? 'default' : 'secondary'}>
                {deal.status || 'Pending'}
              </Badge>
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
              <span>Week {deal.startWeek || 0}</span>
              <span>•</span>
              <span>{deal.contractType || 'Standard Deal'}</span>
            </div>

            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="text-xs">
                Renegotiate
              </Button>
              <Button size="sm" variant="ghost" className="text-xs text-destructive">
                Terminate
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Agencies Panel
const AgenciesPanel = () => {
  const gameState = useGameStore(s => s.gameState);
  const agencies = gameState?.industry?.agencies || [];
  const agents = gameState?.industry?.agents || [];
  
  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      <div className="space-y-3 pb-4">
        {agencies.sort((a, b) => b.leverage - a.leverage).map((agency, i) => {
          const agencyAgents = agents.filter(ag => ag.agencyId === agency.id);
          
          return (
            <div 
              key={agency.id}
              className="p-4 bg-card/40 border border-border/40 rounded-xl hover:border-primary/30 transition-all"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-black font-mono opacity-20">#{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <h4 className="font-bold text-sm">{agency.name}</h4>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                      {agency.archetype} Culture
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-[10px] font-mono">
                  LEV {agency.leverage}
                </Badge>
              </div>
              
              <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {agencyAgents.length} Agents
                </div>
                <div className="flex items-center gap-1">
                  <Briefcase className="h-3 w-3" />
                  {agency.culture}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const TalentHub: React.FC = () => {
  const { activeSubTab, setActiveSubTab } = useUIStore();
  const gameState = useGameStore(s => s.gameState);
  
  // Calculate badge counts
  const badgeCounts = useMemo(() => {
    const talents = Object.values(gameState?.entities?.talents || {}).length;
    const opportunities = selectOpportunities(gameState);
    const agencies = gameState?.industry?.agencies?.length || 0;
    // Count active bids/negotiations from marketplace opportunities
    const opportunitiesWithBids = opportunities.filter((opp: Opportunity) => {
      const hasBids = Object.keys(opp.bids || {}).length > 0;
      const userHasBid = opp.bids && Object.values(opp.bids).some(
        (bid) => bid.amount > 0
      );
      return hasBids || userHasBid;
    });
    const negotiations = opportunitiesWithBids.length;
    
    return {
      roster: talents > 0 ? talents : null,
      marketplace: opportunities.length > 0 ? opportunities.length : null,
      negotiations: negotiations > 0 ? negotiations : null,
      agencies: agencies > 0 ? agencies : null,
    };
  }, [gameState]);
  
  const tabs = [
    { 
      id: 'roster', 
      label: 'Your Roster', 
      icon: <Users className="h-3.5 w-3.5" />,
      badge: badgeCounts.roster,
      description: 'Signed talent and contract management'
    },
    { 
      id: 'marketplace', 
      label: 'Marketplace', 
      icon: <Sparkles className="h-3.5 w-3.5" />,
      badge: badgeCounts.marketplace,
      description: 'Available IP opportunities and talent packages'
    },
    { 
      id: 'negotiations', 
      label: 'Negotiations', 
      icon: <Handshake className="h-3.5 w-3.5" />,
      badge: badgeCounts.negotiations,
      description: 'Active deals and pending offers'
    },
    { 
      id: 'agencies', 
      label: 'Agencies', 
      icon: <Building2 className="h-3.5 w-3.5" />,
      badge: badgeCounts.agencies,
      description: 'Agency power rankings and relationships'
    },
  ];
  
  const getHeaderContent = () => {
    switch (activeSubTab) {
      case 'roster':
        return {
          icon: <Users className="h-6 w-6 text-secondary" />,
          title: 'Talent Roster',
          subtitle: 'Your signed talent and contract management'
        };
      case 'marketplace':
        return {
          icon: <Sparkles className="h-6 w-6 text-primary" />,
          title: 'IP Marketplace',
          subtitle: 'Script opportunities and talent packages'
        };
      case 'negotiations':
        return {
          icon: <Handshake className="h-6 w-6 text-primary" />,
          title: 'Deal Negotiations',
          subtitle: 'Active offers, counters, and deal flow'
        };
      case 'agencies':
        return {
          icon: <Building2 className="h-6 w-6 text-secondary" />,
          title: 'Agency Network',
          subtitle: 'Power rankings and relationship status'
        };
      default:
        return { icon: null, title: '', subtitle: '' };
    }
  };
  
  const header = getHeaderContent();
  
  return (
    <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4 bg-gradient-to-r from-white/5 to-transparent p-5 rounded-xl border border-white/5">
        <div className="w-12 h-12 rounded-lg bg-secondary/10 border border-secondary/20 flex items-center justify-center shadow-[0_0_15px_hsl(var(--secondary)/0.2)]">
          {header.icon}
        </div>
        <div>
          <h2 className="text-2xl font-black tracking-tighter uppercase leading-none">{header.title}</h2>
          <p className="text-[11px] font-black uppercase text-muted-foreground/60 tracking-[0.2em] mt-1">
            {header.subtitle}
          </p>
        </div>
      </div>
      
      {/* Sub Navigation */}
      <div className="mb-4">
        <SubNav 
          tabs={tabs}
          activeTab={activeSubTab}
          onChange={(id) => setActiveSubTab(id as TalentSubTab)}
          variant="pills"
        />
      </div>
      
      {/* Content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <React.Suspense fallback={<div className="flex items-center justify-center h-64">Loading...</div>}>
          {activeSubTab === 'roster' && <RosterPanel />}
          {activeSubTab === 'marketplace' && <MarketplacePanel />}
          {activeSubTab === 'negotiations' && <NegotiationsPanel />}
          {activeSubTab === 'agencies' && <AgenciesPanel />}
        </React.Suspense>
      </div>
    </div>
  );
};

export default TalentHub;
