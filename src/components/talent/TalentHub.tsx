import { useState, useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Talent, TalentRole } from '@/engine/types';
import { TalentModal } from './TalentProfileModal';
import { TalentCard } from './TalentCard';
import { TooltipWrapper } from '@/components/ui/tooltip-wrapper';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter, Users, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const TalentHub = () => {
  const state = useGameStore(s => s.gameState);
  const talentPool = useMemo(() => Object.values(state?.entities.talents || {}), [state?.entities.talents]);
  
  // Roster filters
  const [rosterFilter, setRosterFilter] = useState<TalentRole | 'all'>('all');
  
  // SBDB filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');

  const filteredRoster = useMemo(() => {
    return talentPool.filter(t => rosterFilter === 'all' || t.roles.includes(rosterFilter as TalentRole));
  }, [talentPool, rosterFilter]);

  const filteredSBDB = useMemo(() => {
    return talentPool.filter(t => {
      const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === 'all' || t.roles.includes(roleFilter as TalentRole);
      let matchesTier = true;
      if (tierFilter !== 'all') {
        const prestige = t.prestige;
        if (tierFilter === 'a-list') matchesTier = prestige >= 80;
        else if (tierFilter === 'b-list') matchesTier = prestige >= 60 && prestige < 80;
        else if (tierFilter === 'rising') matchesTier = prestige >= 40 && prestige < 60;
        else if (tierFilter === 'undiscovered') matchesTier = prestige < 40;
      }
      return matchesSearch && matchesRole && matchesTier;
    }).sort((a, b) => (b.starMeter || 0) - (a.starMeter || 0));
  }, [talentPool, search, roleFilter, tierFilter]);

  if (!state) return null;

  return (
    <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-secondary/10 border border-secondary/20 flex items-center justify-center">
          <Users className="h-5 w-5 text-secondary" />
        </div>
        <div>
          <h2 className="text-2xl font-black tracking-tighter uppercase leading-none">Talent</h2>
          <p className="text-[11px] font-black uppercase text-muted-foreground/60 tracking-[0.2em]">Roster Management • Industry Database</p>
        </div>
      </div>

      <Tabs defaultValue="roster" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="w-fit bg-muted/30 border border-border/40 mb-4">
          <TabsTrigger value="roster" className="gap-2 text-xs font-bold uppercase tracking-wider">
            <Star className="h-3.5 w-3.5" /> Your Roster
          </TabsTrigger>
          <TabsTrigger value="sbdb" className="gap-2 text-xs font-bold uppercase tracking-wider">
            <Search className="h-3.5 w-3.5" /> SBDB
          </TabsTrigger>
        </TabsList>

        {/* YOUR ROSTER */}
        <TabsContent value="roster" className="flex-1 flex flex-col overflow-hidden mt-0">
          <div className="flex gap-2 flex-wrap mb-4">
            {(['all', 'actor', 'director', 'writer', 'producer'] as (TalentRole | 'all')[]).map(type => (
              <TooltipWrapper key={type} tooltip={`Filter by ${type === 'all' ? 'all roles' : type}`} side="bottom">
                <button
                  onClick={() => setRosterFilter(type)}
                  className={cn(
                    "px-3.5 py-1.5 text-[10px] uppercase tracking-wider font-black rounded-full transition-all duration-300 border",
                    rosterFilter === type
                      ? 'bg-primary text-primary-foreground shadow-[0_0_15px_hsl(var(--primary)/0.4)] scale-105 border-primary/50'
                      : 'bg-muted/50 text-muted-foreground hover:bg-secondary/20 hover:text-foreground border-transparent hover:border-secondary/30'
                  )}
                >
                  {type}
                </button>
              </TooltipWrapper>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pb-6 custom-scrollbar pr-2">
            {filteredRoster.map((talent: Talent) => (
              <TalentCard key={talent.id} talent={talent} />
            ))}
            {filteredRoster.length === 0 && (
              <div className="col-span-full py-12 text-center text-muted-foreground">No talent found matching this filter.</div>
            )}
          </div>
        </TabsContent>

        {/* SBDB DATABASE */}
        <TabsContent value="sbdb" className="flex-1 flex flex-col overflow-hidden mt-0">
          <div className="glass-panel p-4 flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                aria-label="Search talent"
                placeholder="Search talent..."
                className="pl-10 bg-muted/30 border-border/40"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[140px] bg-muted/30 border-border/40">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="actor">Actors</SelectItem>
                  <SelectItem value="director">Directors</SelectItem>
                  <SelectItem value="writer">Writers</SelectItem>
                  <SelectItem value="producer">Producers</SelectItem>
                </SelectContent>
              </Select>
              <Select value={tierFilter} onValueChange={setTierFilter}>
                <SelectTrigger className="w-[140px] bg-muted/30 border-border/40">
                  <SelectValue placeholder="All Tiers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  <SelectItem value="a-list">A-List (80+)</SelectItem>
                  <SelectItem value="b-list">B-List (60-79)</SelectItem>
                  <SelectItem value="rising">Rising Star (40-59)</SelectItem>
                  <SelectItem value="undiscovered">New Talent (&lt;40)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-8">
              {filteredSBDB.map((talent) => (
                <TalentCard key={talent.id} talent={talent} showStarMeter={true} />
              ))}
            </div>
            {filteredSBDB.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <Users className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-lg font-medium">No talent found matching your criteria.</p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
      <TalentModal />
    </div>
  );
};
