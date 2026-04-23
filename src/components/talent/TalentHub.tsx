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
import { Search, Filter, Users, Star, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/components/shared/EmptyState';

export const TalentHub = () => {
  const state = useGameStore(s => s.gameState);
  const talentPool = useMemo(() => Object.values(state?.industry.talentPool || {}), [state?.industry.talentPool]);
  
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
    <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-white/5 pb-6">
        <div className="w-12 h-12 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center">
          <Users className="h-6 w-6 text-secondary" />
        </div>
        <div>
          <h2 className="text-4xl font-display font-black tracking-tighter uppercase italic leading-none mb-1">Human Capital</h2>
          <p className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-[0.25em]">Global Roster • Studio Stable Management</p>
        </div>
      </div>

      <Tabs defaultValue="roster" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="w-fit bg-white/5 border border-white/5 mb-8 p-1 h-12">
          <TabsTrigger value="roster" className="gap-3 h-10 px-8 font-display font-black uppercase tracking-[0.15em] text-[10px] data-[state=active]:bg-secondary data-[state=active]:text-black transition-all">
            <Star className="h-3.5 w-3.5" /> Your Roster
          </TabsTrigger>
          <TabsTrigger value="sbdb" className="gap-3 h-10 px-8 font-display font-black uppercase tracking-[0.15em] text-[10px] data-[state=active]:bg-primary data-[state=active]:text-black transition-all">
            <Database className="h-3.5 w-3.5" /> Industry SBDB
          </TabsTrigger>
        </TabsList>

        {/* YOUR ROSTER */}
        <TabsContent value="roster" className="flex-1 flex flex-col overflow-hidden mt-0 outline-none">
          <div className="flex gap-3 flex-wrap mb-8">
            {(['all', 'actor', 'director', 'writer', 'producer'] as (TalentRole | 'all')[]).map(type => (
              <button
                key={type}
                onClick={() => setRosterFilter(type)}
                className={cn(
                  "px-5 py-2 text-[10px] uppercase font-black tracking-[0.2em] border transition-all duration-300",
                  rosterFilter === type
                    ? 'bg-secondary text-black border-secondary shadow-xl shadow-secondary/10'
                    : 'bg-white/5 text-muted-foreground/60 border-white/5 hover:bg-white/10 hover:text-foreground'
                )}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 overflow-y-auto pb-12 custom-scrollbar pr-4">
            {filteredRoster.map((talent: Talent) => (
              <TalentCard key={talent.id} talent={talent} />
            ))}
            {filteredRoster.length === 0 && (
              <div className="col-span-full">
                <EmptyState 
                  icon={Star} 
                  title="Roster Empty" 
                  message="No talent assets are currently contracted to your studio stable."
                  className="py-24 bg-white/[0.01]"
                />
              </div>
            )}
          </div>
        </TabsContent>

        {/* SBDB DATABASE */}
        <TabsContent value="sbdb" className="flex-1 flex flex-col overflow-hidden mt-0 outline-none">
          <div className="glass-card p-6 flex flex-col md:flex-row gap-6 items-center justify-between mb-8 bg-white/[0.02]">
            <div className="relative w-full md:w-96 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search Database..."
                className="pl-10 h-11 bg-black/40 border-white/5 focus-visible:border-primary/30 text-[10px] font-black uppercase tracking-widest"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[160px] h-11 bg-black/40 border-white/5 text-[10px] font-black uppercase tracking-widest">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 backdrop-blur-xl border-white/10">
                  <SelectItem value="all" className="text-[10px] font-black uppercase tracking-widest">All Roles</SelectItem>
                  <SelectItem value="actor" className="text-[10px] font-black uppercase tracking-widest">Actors</SelectItem>
                  <SelectItem value="director" className="text-[10px] font-black uppercase tracking-widest">Directors</SelectItem>
                  <SelectItem value="writer" className="text-[10px] font-black uppercase tracking-widest">Writers</SelectItem>
                  <SelectItem value="producer" className="text-[10px] font-black uppercase tracking-widest">Producers</SelectItem>
                </SelectContent>
              </Select>
              <Select value={tierFilter} onValueChange={setTierFilter}>
                <SelectTrigger className="w-[160px] h-11 bg-black/40 border-white/5 text-[10px] font-black uppercase tracking-widest">
                  <SelectValue placeholder="All Tiers" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 backdrop-blur-xl border-white/10">
                  <SelectItem value="all" className="text-[10px] font-black uppercase tracking-widest">All Tiers</SelectItem>
                  <SelectItem value="a-list" className="text-[10px] font-black uppercase tracking-widest">A-List (80+)</SelectItem>
                  <SelectItem value="b-list" className="text-[10px] font-black uppercase tracking-widest">B-List (60-79)</SelectItem>
                  <SelectItem value="rising" className="text-[10px] font-black uppercase tracking-widest">Rising Star (40-59)</SelectItem>
                  <SelectItem value="undiscovered" className="text-[10px] font-black uppercase tracking-widest">New Talent (&lt;40)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <ScrollArea className="flex-1 pr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-12">
              {filteredSBDB.map((talent) => (
                <TalentCard key={talent.id} talent={talent} showStarMeter={true} />
              ))}
            </div>
            {filteredSBDB.length === 0 && (
              <EmptyState 
                icon={Database} 
                title="No Records" 
                message="Your surveillance filters returned zero matches from the industry database."
                className="py-24 bg-white/[0.01]"
              />
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
      <TalentModal />
    </div>
  );
};
