import React, { useState, useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useUIStore, TalentSubTab } from '@/store/uiStore';
import { SubNav } from '@/components/navigation/SubNav';
import { Badge } from '@/components/ui/badge';
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
  Briefcase,
  AlertTriangle,
  Zap,
  Target,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Talent, TalentRole, Opportunity } from '@/engine/types';
import { selectOpportunities, selectTalentPool, selectLowMoraleTalent } from '@/store/selectors';
import { MoraleDashboard } from '@/components/talent/MoraleDashboard';
import { TalentPactPanel } from '@/components/talent/TalentPactPanel';
import { OfferHistoryLog } from '@/components/talent/OfferHistoryLog';
import { ScandalTracker } from './talent/ScandalTracker';

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
  
  const talentPool = useMemo(() => selectTalentPool(state), [state]);

  const moraleData = useMemo(() => {
    const low = selectLowMoraleTalent(state);
    const byTalent = talentPool.map(t => ({
      talentId: t.id,
      talentName: t.name,
      morale: t.psychology?.mood ?? 100,
      trend: 'stable' as const,
      factors: [],
      atRisk: (t.psychology?.mood ?? 100) < 40
    }));
    const averageMorale = talentPool.length > 0
      ? Math.round(talentPool.reduce((s, t) => s + (t.psychology?.mood ?? 100), 0) / talentPool.length)
      : 100;
    return { byTalent, averageMorale, atRiskCount: low.length };
  }, [talentPool, state]);
  
  const filteredTalent = useMemo(() => {
    return talentPool.filter(t => {
      const matchesFilter = filter === 'all' || t.roles.includes(filter);
      const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    }).sort((a, b) => (b.starMeter || 0) - (a.starMeter || 0));
  }, [talentPool, filter, search]);
  
  const roleFilters: (TalentRole | 'all')[] = ['all', 'actor', 'director', 'writer', 'producer'];
  
  return (
    <div className="h-full flex flex-col space-y-10 animate-in fade-in duration-700">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between bg-white/[0.02] p-10 rounded-none border border-white/5 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -mr-16 -mt-16" />
        
        <div className="flex gap-4 flex-wrap relative z-10">
          {roleFilters.map(role => (
            <button
              key={role}
              onClick={() => setFilter(role)}
              aria-pressed={filter === role}
              className={cn(
                'px-8 py-3 text-[10px] uppercase tracking-[0.3em] font-black rounded-none transition-all duration-700 border italic',
                filter === role
                  ? 'bg-primary text-black shadow-[0_0_20px_rgba(var(--primary),0.2)] border-primary'
                  : 'bg-white/[0.02] text-muted-foreground/40 hover:bg-white/10 hover:text-white border-white/5'
              )}
            >
              {role.toUpperCase()}
            </button>
          ))}
        </div>
        
        <div className="relative w-full md:w-80 relative z-10">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/20" />
          <input
            type="text"
            placeholder="SEARCH TALENT..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-12 pl-12 pr-4 text-[10px] bg-black/40 border border-white/10 rounded-none focus:outline-none focus:border-primary/50 uppercase font-black tracking-[0.2em] italic placeholder:text-muted-foreground/5 transition-all duration-700"
          />
        </div>
      </div>
      
      {/* Talent Grid */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-10">
          {filteredTalent.map((talent: Talent) => (
            <div 
              key={talent.id}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  selectTalent(talent.id);
                }
              }}
              onClick={() => selectTalent(talent.id)}
              className="group p-8 bg-white/[0.01] border border-white/5 rounded-none hover:border-primary/40 hover:bg-white/[0.03] transition-all duration-700 cursor-pointer shadow-xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                 <Zap className="w-12 h-12 text-primary" strokeWidth={1} />
              </div>
              
              <div className="flex flex-col gap-6 relative z-10">
                <div className="w-16 h-16 rounded-none bg-gradient-to-br from-primary/10 to-secondary/10 border border-white/5 flex items-center justify-center text-2xl font-display font-black italic shadow-2xl">
                  {talent.name.charAt(0)}
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-display font-black text-lg truncate group-hover:text-primary transition-all duration-700 uppercase italic leading-none mb-2 tracking-tight">{talent.name}</h4>
                    <p className="text-[9px] uppercase text-muted-foreground/30 font-black tracking-[0.2em] italic">
                      {talent.roles.join(' / ').toUpperCase()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-secondary/5 border border-secondary/20 px-3 h-5 flex items-center justify-center text-[9px] font-black uppercase tracking-widest text-secondary italic rounded-none">
                      <Star className="h-3 w-3 mr-2" />
                      {talent.prestige}
                    </div>
                    {talent.starMeter && (
                      <div className="bg-primary/5 border border-primary/20 px-3 h-5 flex items-center justify-center text-[9px] font-black uppercase tracking-widest text-primary italic rounded-none shadow-[0_0_10px_rgba(var(--primary),0.1)]">
                        <TrendingUp className="h-3 w-3 mr-2" />
                        {talent.starMeter}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredTalent.length === 0 && (
          <div className="flex flex-col items-center justify-center py-40 text-muted-foreground/10 space-y-8">
            <Users className="w-24 h-24" strokeWidth={1} />
            <p className="text-xl font-display font-black uppercase tracking-[0.4em] italic">NO ASSETS FOUND</p>
          </div>
        )}
      </div>

      {moraleData.byTalent.length > 0 && (
        <MoraleDashboard moraleData={moraleData} />
      )}
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
    <div className="h-full flex flex-col space-y-10 animate-in fade-in duration-700">
      <div className="flex items-center gap-4 bg-white/[0.02] border border-white/5 p-2 rounded-none w-fit shadow-xl">
        <button
          onClick={() => setActiveTab('scripts')}
          aria-pressed={activeTab === 'scripts'}
          className={cn(
            'px-10 py-3 text-[10px] font-black uppercase tracking-[0.3em] rounded-none transition-all duration-700 italic',
            activeTab === 'scripts'
              ? 'bg-primary text-black shadow-lg shadow-primary/10'
              : 'text-muted-foreground/40 hover:text-white hover:bg-white/5'
          )}
        >
          <Newspaper className="h-3.5 w-3.5 inline mr-3" strokeWidth={3} />
          SCRIPT MARKETPLACE
        </button>
        <button
          onClick={() => setActiveTab('talent')}
          aria-pressed={activeTab === 'talent'}
          className={cn(
            'px-10 py-3 text-[10px] font-black uppercase tracking-[0.3em] rounded-none transition-all duration-700 italic',
            activeTab === 'talent'
              ? 'bg-primary text-black shadow-lg shadow-primary/10'
              : 'text-muted-foreground/40 hover:text-white hover:bg-white/5'
          )}
        >
          <Sparkles className="h-3.5 w-3.5 inline mr-3" strokeWidth={3} />
          TALENT PACKAGES
        </button>
      </div>
      
      <div className="flex-1 overflow-hidden">
        {activeTab === 'scripts' ? (
          <div className="h-full overflow-y-auto custom-scrollbar pr-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-10">
              {opportunities.length === 0 ? (
                <div className="col-span-full py-40 text-center space-y-8 opacity-10">
                  <Sparkles className="w-20 h-20 mx-auto" strokeWidth={1} />
                  <p className="text-xl font-display font-black uppercase tracking-[0.4em] italic">
                    NO ACTIVE FLOW
                  </p>
                </div>
              ) : (
                opportunities.map(opp => {
                  const hasBids = Object.keys(opp.bids || {}).length > 0;
                  return (
                    <div 
                      key={opp.id}
                      className="p-10 bg-white/[0.01] border border-white/5 rounded-none hover:border-primary/40 hover:bg-white/[0.03] transition-all duration-700 cursor-pointer shadow-2xl relative overflow-hidden group"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedAuction(opp);
                        }
                      }}
                      onClick={() => setSelectedAuction(opp)}
                    >
                      <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-20 transition-opacity">
                         <Target className="w-12 h-12 text-primary" strokeWidth={1} />
                      </div>
                      
                      <div className="space-y-6 relative z-10">
                        <div className="flex justify-between items-start">
                          <h4 className="text-xl font-display font-black uppercase italic tracking-tighter leading-none group-hover:text-primary transition-all duration-700 mb-2">{opp.title}</h4>
                          <div className="text-[9px] font-black border border-white/10 px-3 h-5 flex items-center justify-center uppercase tracking-widest italic rounded-none text-muted-foreground/40">{opp.type.toUpperCase()}</div>
                        </div>
                        <p className="text-xs text-muted-foreground/60 line-clamp-2 italic uppercase tracking-wider leading-relaxed pr-10">"{opp.flavor.toUpperCase()}"</p>
                        <div className="flex items-center gap-4 pt-2">
                          <div className="text-[9px] font-black bg-secondary/5 text-secondary border border-secondary/20 px-3 h-5 flex items-center justify-center uppercase tracking-widest italic rounded-none">{opp.genre.toUpperCase()}</div>
                          {hasBids && (
                            <div className="text-[9px] font-black bg-primary/10 text-primary border border-primary/20 px-3 h-5 flex items-center justify-center uppercase tracking-widest italic rounded-none shadow-[0_0_15px_rgba(var(--primary),0.2)]">
                              <Gavel className="h-3 w-3 mr-2" strokeWidth={3} />
                              BIDDING ACTIVE
                            </div>
                          )}
                        </div>
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
                const { enqueueModal } = useUIStore.getState();
                enqueueModal('CREATE_PACKAGE', null);
              }}
              onViewPackage={(id) => {
                const { enqueueModal } = useUIStore.getState();
                enqueueModal('PACKAGE_DETAIL', { packageId: id });
              }}
              onBidPackage={(id) => {
                const { enqueueModal } = useUIStore.getState();
                enqueueModal('PACKAGE_DETAIL', { packageId: id });
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
  const currentWeek = gameState?.week ?? 0;

  const pacts = useMemo(() => {
    const deals = gameState?.deals?.activeDeals || [];
    const talents = gameState?.entities?.talents || {};
    return deals.map(deal => {
      const talent = talents[deal.talentId || ''];
      const weeksRemaining = Math.max(0, (deal.endDate || 0) - currentWeek);
      const durationWeeks = Math.max(1, (deal.endDate || 0) - (deal.startDate || 0));
      return {
        id: deal.id ?? '',
        talentId: deal.talentId || '',
        talentName: talent?.name || deal.talentId || 'Unknown',
        pactType: (deal.type || 'first_look') as 'overall_deal' | 'first_look' | 'exclusive' | 'consulting',
        weeklyCost: deal.weeklyOverhead || 0,
        durationWeeks,
        weeksRemaining,
        benefits: deal.exclusivity ? ['Exclusivity'] : [],
        status: weeksRemaining < 4 ? 'expiring' as const : 'active' as const,
      };
    });
  }, [gameState, currentWeek]);

  const offerHistory = useMemo(() => {
    const contracts = Object.values(gameState?.entities?.contracts || {});
    const talents = gameState?.entities?.talents || {};
    const projects = gameState?.entities?.projects || {};
    return contracts.map(c => {
      const talent = talents[c.talentId];
      const project = projects[c.projectId];
      return {
        offerId: c.id,
        talentName: talent?.name || c.talentId,
        talentId: c.talentId,
        role: c.role || 'actor',
        projectTitle: project?.title,
        initialOffer: c.fee,
        finalAmount: c.fee,
        status: 'accepted' as const,
        actions: [{
          type: 'accepted' as const,
          date: currentWeek,
          amount: c.fee,
          by: 'player' as const,
        }],
        weeksActive: 0,
      };
    });
  }, [gameState, currentWeek]);

  return (
    <div className="h-full overflow-y-auto custom-scrollbar space-y-10 pr-6 pb-20">
      <TalentPactPanel pacts={pacts} />
      <OfferHistoryLog offers={offerHistory} />
    </div>
  );
};

// Agencies Panel
const AgenciesPanel = () => {
  const gameState = useGameStore(s => s.gameState);
  const agencies = gameState?.industry?.agencies || [];
  const agents = gameState?.industry?.agents || [];
  
  return (
    <div className="h-full overflow-y-auto custom-scrollbar pr-6">
      <div className="space-y-6 pb-20">
        {agencies.sort((a, b) => b.leverage - a.leverage).map((agency, i) => {
          const agencyAgents = agents.filter(ag => ag.agencyId === agency.id);
          
          return (
            <div 
              key={agency.id}
              className="p-8 bg-white/[0.01] border border-white/5 rounded-none hover:border-secondary/40 hover:bg-white/[0.03] transition-all duration-700 shadow-xl group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-100 transition-opacity">
                 <Building2 className="w-16 h-16 text-secondary" strokeWidth={1} />
              </div>
              
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="flex items-center gap-6">
                  <span className="text-4xl font-display font-black italic opacity-5 group-hover:opacity-20 transition-opacity">#{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <h4 className="text-xl font-display font-black uppercase italic tracking-tighter leading-none group-hover:text-secondary transition-colors mb-2">{agency.name}</h4>
                    <p className="text-[10px] uppercase font-black text-muted-foreground/30 tracking-[0.4em] italic">
                      {agency.archetype.toUpperCase()} CULTURE
                    </p>
                  </div>
                </div>
                <div className="bg-secondary/5 border border-secondary/20 px-4 h-6 flex items-center justify-center text-[10px] font-black font-mono text-secondary italic rounded-none shadow-[0_0_15px_rgba(var(--secondary),0.1)]">
                  LEV {agency.leverage}
                </div>
              </div>
              
              <div className="flex items-center gap-8 text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] italic relative z-10">
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4" />
                  {agencyAgents.length} AGENTS
                </div>
                <div className="flex items-center gap-3">
                  <Briefcase className="h-4 w-4" />
                  {agency.culture.toUpperCase()}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Scandals Panel
const ScandalsPanel = () => {
  const gameState = useGameStore(s => s.gameState);
  const talents = useMemo(() => Object.values(gameState?.entities?.talents || {}), [gameState]);

  const activeScandals = useMemo(() => (gameState?.industry?.scandals || []).map(s => {
    const talent = talents.find(t => t.id === s.talentId);
    return {
      talentId: s.talentId,
      talentName: talent?.name || 'Unknown',
      scandalType: s.type as 'controversy' | 'legal_issue' | 'personal_drama' | 'professional_dispute',
      severity: s.severity > 75 ? 'career_ending' as const : s.severity > 50 ? 'major' as const : s.severity > 25 ? 'moderate' as const : 'minor' as const,
      headline: `${talent?.name || 'Talent'} scandal`,
      weekStarted: (gameState?.week || 1) - Math.floor((100 - s.weeksRemaining)),
      weeksRemaining: s.weeksRemaining,
      publicSentiment: s.severity > 60 ? 'outraged' as const : 'divided' as const,
      pressCoverage: Math.round(s.severity * 0.5),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      effects: [] as any[],
      hasInsurance: false,
    };
  }), [gameState, talents]);

  return (
    <div className="h-full overflow-y-auto custom-scrollbar pb-20 pr-6">
      <ScandalTracker activeScandals={activeScandals} scandalHistory={[]} />
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
    const activeScandals = gameState?.industry?.scandals?.length || 0;
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
      scandals: activeScandals > 0 ? activeScandals : null,
    };
  }, [gameState]);
  
  const tabs = [
    { 
      id: 'roster', 
      label: 'YOUR ROSTER', 
      icon: <Users className="h-3.5 w-3.5" />,
      badge: badgeCounts.roster,
      description: 'Signed talent and contract management'
    },
    { 
      id: 'marketplace', 
      label: 'MARKETPLACE', 
      icon: <Sparkles className="h-3.5 w-3.5" />,
      badge: badgeCounts.marketplace,
      description: 'Available IP opportunities and talent packages'
    },
    { 
      id: 'negotiations', 
      label: 'NEGOTIATIONS', 
      icon: <Handshake className="h-3.5 w-3.5" />,
      badge: badgeCounts.negotiations,
      description: 'Active deals and pending offers'
    },
    { 
      id: 'agencies', 
      label: 'AGENCIES', 
      icon: <Building2 className="h-3.5 w-3.5" />,
      badge: badgeCounts.agencies,
      description: 'Agency power rankings and relationships'
    },
    {
      id: 'scandals',
      label: 'SCANDALS',
      icon: <AlertTriangle className="h-3.5 w-3.5" />,
      badge: badgeCounts.scandals,
      description: 'Active PR crises and talent controversies'
    },
  ];
  
  const getHeaderContent = () => {
    switch (activeSubTab) {
      case 'roster':
        return {
          icon: <Users className="h-8 w-8 text-secondary" />,
          title: 'TALENT ROSTER',
          subtitle: 'YOUR SIGNED TALENT AND CONTRACT MANAGEMENT'
        };
      case 'marketplace':
        return {
          icon: <Sparkles className="h-8 w-8 text-primary" />,
          title: 'IP MARKETPLACE',
          subtitle: 'SCRIPT OPPORTUNITIES AND TALENT PACKAGES'
        };
      case 'negotiations':
        return {
          icon: <Handshake className="h-8 w-8 text-primary" />,
          title: 'DEAL NEGOTIATIONS',
          subtitle: 'ACTIVE OFFERS, COUNTERS, AND DEAL FLOW'
        };
      case 'agencies':
        return {
          icon: <Building2 className="h-8 w-8 text-secondary" />,
          title: 'AGENCY NETWORK',
          subtitle: 'POWER RANKINGS AND RELATIONSHIP STATUS'
        };
      case 'scandals':
        return {
          icon: <AlertTriangle className="h-8 w-8 text-red-500" />,
          title: 'SCANDAL TRACKER',
          subtitle: 'ACTIVE PR CRISES AND TALENT CONTROVERSIES'
        };
      default:
        return { icon: null, title: '', subtitle: '' };
    }
  };
  
  const header = getHeaderContent();
  
  return (
    <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* Executive Header */}
      <div className="flex items-center gap-8 mb-10 bg-white/[0.02] p-10 rounded-none border border-white/5 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 blur-[120px] -mr-32 -mt-32" />
        <div className="w-16 h-16 rounded-none bg-secondary/5 border border-secondary/20 flex items-center justify-center shadow-2xl relative z-10">
          {header.icon}
        </div>
        <div className="relative z-10">
          <h2 className="text-5xl font-display font-black tracking-tighter uppercase italic leading-none mb-3 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">{header.title}</h2>
          <p className="text-[10px] font-black uppercase text-muted-foreground/30 tracking-[0.4em] italic">
            {header.subtitle}
          </p>
        </div>
      </div>
      
      {/* Sub Navigation */}
      <div className="mb-10">
        <SubNav 
          tabs={tabs}
          activeTab={activeSubTab}
          onChange={(id) => setActiveSubTab(id as TalentSubTab)}
          variant="pills"
        />
      </div>
      
      {/* Content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <React.Suspense fallback={<div className="flex items-center justify-center h-64 font-display font-black text-muted-foreground/10 animate-pulse uppercase tracking-[0.5em] italic">INITIALIZING MODULE...</div>}>
          {activeSubTab === 'roster' && <RosterPanel />}
          {activeSubTab === 'marketplace' && <MarketplacePanel />}
          {activeSubTab === 'negotiations' && <NegotiationsPanel />}
          {activeSubTab === 'agencies' && <AgenciesPanel />}
          {activeSubTab === 'scandals' && <ScandalsPanel />}
        </React.Suspense>
      </div>
    </div>
  );
};

export default TalentHub;
