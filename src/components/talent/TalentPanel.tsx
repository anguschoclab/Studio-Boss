import { useState, useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Talent, TalentRole } from '@/engine/types';
import { TalentModal } from './TalentProfileModal';
import { TalentCard } from './TalentCard';
import { TooltipWrapper } from '@/components/ui/tooltip-wrapper';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';

export const TalentPanel = () => {
  const state = useGameStore(s => s.gameState);
  const talentPool = useMemo(() => Object.values(state?.entities?.talents || {}), [state?.entities?.talents]);
  const [roleFilter, setRoleFilter] = useState<TalentRole | 'all'>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMegaProducers, setShowMegaProducers] = useState(false);

  const filteredTalent = useMemo(() => {
    return talentPool.filter(t => {
      const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'all' || t.roles.includes(roleFilter as TalentRole);
      
      let matchesTier = true;
      if (tierFilter !== 'all') {
        const prestige = t.prestige;
        if (tierFilter === 'a-list') matchesTier = prestige >= 80;
        else if (tierFilter === 'b-list') matchesTier = prestige >= 60 && prestige < 80;
        else if (tierFilter === 'rising') matchesTier = prestige >= 40 && prestige < 60;
        else if (tierFilter === 'undiscovered') matchesTier = prestige < 40;
      }

      const isMegaProducer = state?.deals.activeDeals.some(d => d.talentId === t.id && d.type === 'overall_deal');
      const matchesMega = !showMegaProducers || isMegaProducer;
      
      return matchesSearch && matchesRole && matchesTier && matchesMega;
    }).sort((a, b) => (b.starMeter || 0) - (a.starMeter || 0));
  }, [talentPool, searchQuery, roleFilter, tierFilter, showMegaProducers, state?.deals.activeDeals]);

  return (
    <div className="space-y-4 h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-border/40 gap-4">
        <h2 className="text-2xl font-display font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 drop-shadow-sm">Talent Roster</h2>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input 
              placeholder="Search talent..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs bg-muted/20 border-border/40 focus:ring-primary/20"
            />
          </div>

          <Select value={tierFilter} onValueChange={setTierFilter}>
            <SelectTrigger className="w-40 h-9 text-[10px] font-black uppercase tracking-widest bg-muted/20 border-border/40">
              <SelectValue placeholder="All Tiers" />
            </SelectTrigger>
            <SelectContent className="bg-slate-950 border-slate-800">
              <SelectItem value="all">All Tiers</SelectItem>
              <SelectItem value="a-list">A-List (80+)</SelectItem>
              <SelectItem value="b-list">B-List (60-79)</SelectItem>
              <SelectItem value="rising">Rising Star (40-59)</SelectItem>
              <SelectItem value="undiscovered">Undiscovered (&lt;40)</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex flex-wrap gap-1.5 h-auto py-1 items-center px-2 bg-muted/10 rounded-lg border border-border/20">
            {(['all', 'actor', 'director', 'writer', 'producer'] as (TalentRole | 'all')[]).map(type => (
              <TooltipWrapper key={type} tooltip={`Filter by ${type}`} side="bottom">
                <button 
                  onClick={() => setRoleFilter(type)}
                  className={`px-3 py-1.5 min-w-[3rem] text-[9px] uppercase tracking-wider font-black rounded-md transition-all ${
                    roleFilter === type
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {type}
                </button>
              </TooltipWrapper>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pb-6 custom-scrollbar pr-2">
        {filteredTalent.map((talent: Talent) => (
          <TalentCard key={talent.id} talent={talent} />
        ))}
        {filteredTalent.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            No talent found matching this filter.
          </div>
        )}
      </div>
      <TalentModal />
    </div>
  );
};
