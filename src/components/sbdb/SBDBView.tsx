import React, { useState, useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter, Users } from 'lucide-react';
import { TalentRole } from '@/engine/types';
import { TalentCard } from '../talent/TalentCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TooltipWrapper } from '@/components/ui/tooltip-wrapper';

export const SBDBView = () => {
  const gameState = useGameStore(s => s.gameState);
  
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');
  
  const talentPool = useMemo(() => Object.values(gameState?.industry.talentPool || {}), [gameState]);
  
  const filteredTalent = useMemo(() => {
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

  if (!gameState) return null;

  return (
    <div className="flex flex-col h-full space-y-6 p-1">
      {/* SBDB Header */}
      <div className="flex flex-col space-y-1">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-black tracking-tighter uppercase italic">SBDB</h1>
        </div>
        <p className="text-muted-foreground text-sm font-medium">
          The definitive industry database of talent, producers, and stars.
        </p>
      </div>

      {/* SBDB Toolbar */}
      <div className="glass-panel p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <TooltipWrapper tooltip="Search by talent name or professional alias" side="bottom">
            <Input 
              placeholder="Search SBDB..." 
              className="pl-10 bg-white/5 border-white/10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </TooltipWrapper>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <TooltipWrapper tooltip="Filter by primary industry role" side="bottom">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[140px] bg-white/5 border-white/10">
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
          </TooltipWrapper>

          <TooltipWrapper tooltip="Filter by career tier and prestige level" side="bottom">
            <Select value={tierFilter} onValueChange={setTierFilter}>
              <SelectTrigger className="w-[140px] bg-white/5 border-white/10">
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
          </TooltipWrapper>

          <Button 
            variant="outline" 
            size="icon" 
            tooltip="Open advanced filtering and sorting options"
            aria-label="Filter talent" 
            className="border-white/10"
          >
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Talent Grid */}
      <ScrollArea className="flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-8">
          {filteredTalent.map((talent) => (
            <TalentCard 
              key={talent.id}
              talent={talent} 
              showStarMeter={true}
            />
          ))}
        </div>
        
        {filteredTalent.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Users className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-lg font-medium">No talent found matching your criteria.</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
