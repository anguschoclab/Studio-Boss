import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { Button } from '@/components/ui/button';
import { Plus, Search, Filter, Newspaper, Clock, TrendingUp, Sparkles, Zap } from 'lucide-react';
import { Opportunity } from '@/engine/types';
import { selectOpportunities } from '@/store/selectors';
import { TrendBoard } from '@/components/trends/TrendBoard';
import { NewsFeed } from '@/components/news/NewsFeed';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export const DiscoveryBoard = () => {
  const opportunities = useGameStore(s => selectOpportunities(s.gameState));
  const { openCreateProject } = useUIStore();

  return (
    <div className="h-full flex flex-col lg:flex-row gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 overflow-hidden">
      {/* Main Market Area */}
      <div className="flex-1 flex flex-col space-y-6 overflow-hidden">
        {/* Trade Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white/5 p-5 rounded-xl border border-white/5 backdrop-blur-sm">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Newspaper className="h-5 w-5 text-amber-500" />
              </div>
              <h2 className="text-2xl font-black tracking-tighter uppercase leading-none">The Trades</h2>
            </div>
            <p className="text-[11px] font-black uppercase text-muted-foreground/60 tracking-[0.2em]">Intellectual Property Marketplace • Hot Assets</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative w-48 hidden xl:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input className="h-8 pl-9 text-[10px] bg-white/5 border-white/5 uppercase font-black" placeholder="Search Listings..." />
            </div>
            <Button onClick={openCreateProject} size="sm" className="h-8 px-4 text-[10px] font-black uppercase tracking-widest gap-2 bg-primary text-black hover:bg-primary/90">
              <Plus className="h-3.5 w-3.5" />
              Original Concept
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1 pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pb-12">
            {opportunities.length === 0 ? (
              <div className="col-span-full py-24 text-center glass-card border-none flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground/20">
                  <Sparkles className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-sm font-black uppercase tracking-widest text-muted-foreground/40">The town is quiet</p>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground/20">No active scripts or pitches currently circulating.</p>
                </div>
              </div>
            ) : (
              opportunities.map(opp => (
                <OpportunityCard key={opp.id} opportunity={opp} />
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Industry Intelligence Sidebar */}
      <div className="w-full lg:w-96 flex flex-col gap-8 shrink-0 h-full overflow-hidden">
        <div className="h-[45%]">
           <div className="flex items-center gap-3 px-2 mb-4">
              <div className="w-1.5 h-4 rounded-full bg-secondary" />
              <h3 className="text-xs font-black uppercase tracking-widest text-foreground/80">Market Analytics</h3>
            </div>
          <TrendBoard />
        </div>
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
           <div className="flex items-center gap-3 px-2 mb-4">
              <div className="w-1.5 h-4 rounded-full bg-primary" />
              <h3 className="text-xs font-black uppercase tracking-widest text-foreground/80 flex items-center justify-between flex-1">
                Industry Feed
                <Badge variant="outline" className="h-4 px-1.5 text-[8px] bg-primary/10 border-primary/20 text-primary animate-pulse uppercase">Live</Badge>
              </h3>
            </div>
          <div className="flex-1 glass-card border-none overflow-hidden flex flex-col">
            <NewsFeed />
          </div>
        </div>
      </div>
    </div>
  );
};

const OpportunityCard = ({ opportunity: opp }: { opportunity: Opportunity }) => {
  const acquireOpportunity = useGameStore(s => s.acquireOpportunity);
  return (
    <div className="glass-card p-5 group relative overflow-hidden flex flex-col justify-between h-full border-none hover-glow transition-all duration-300">
      <div className="space-y-4 relative z-10">
        <div className="flex justify-between items-start gap-4">
          <div className="min-w-0">
            <h3 className="text-sm font-black uppercase tracking-tight truncate group-hover:text-primary transition-colors">
              {opp.title}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest">{opp.type} Listing</span>
            </div>
          </div>
          <Badge variant="outline" className="shrink-0 text-[9px] font-black uppercase tracking-widest bg-white/5 border-white/5 h-5 px-1.5">
            {opp.genre}
          </Badge>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <Badge variant="outline" className="text-[9px] font-black border-amber-500/30 bg-amber-500/5 text-amber-500 uppercase h-5">{opp.format}</Badge>
          <Badge variant="outline" className="text-[9px] font-black border-primary/30 bg-primary/5 text-primary uppercase h-5">{opp.budgetTier} BUDGET</Badge>
        </div>

        <div className="bg-black/20 p-3 rounded-md italic text-[11px] text-muted-foreground/90 leading-relaxed border-l-2 border-primary/30 group-hover:border-primary transition-colors">
          "{opp.flavor}"
        </div>
      </div>

      <div className="mt-6 pt-3 border-t border-white/5 flex justify-between items-center relative z-10">
        <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <Clock className={cn("h-3 w-3", opp.weeksUntilExpiry <= 2 ? "text-destructive animate-pulse" : "text-muted-foreground/40")} />
          <span className={cn(opp.weeksUntilExpiry <= 2 ? "text-destructive" : "")}>
            Expiring in {opp.weeksUntilExpiry}w
          </span>
        </div>
        <Button 
          size="sm" 
          className="h-8 text-[9px] px-4 font-black uppercase tracking-widest bg-white/5 hover:bg-primary hover:text-black border border-white/10 hover:border-primary transition-all shadow-xl group/btn" 
          onClick={() => acquireOpportunity(opp.id)}
        >
          Acquire IP
        </Button>
      </div>
    </div>
  );
};
