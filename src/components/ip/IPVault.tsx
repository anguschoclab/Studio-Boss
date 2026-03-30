import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { selectReleasedProjects, selectStudio } from '@/store/selectors';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Library, Link as LinkIcon, Star, TrendingUp, DollarSign, Award, Archive, Zap } from 'lucide-react';
import { formatMoney } from '@/engine/utils';
import { Project } from '@/engine/types';
import { cn } from '@/lib/utils';
import { useShallow } from 'zustand/react/shallow';

export const IPVault = () => {
  const gameState = useGameStore(s => s.gameState);
  
  const releasedProjects = useGameStore(useShallow(s => selectReleasedProjects(s.gameState)));
  const studio = useGameStore(useShallow(s => selectStudio(s.gameState)));
  
  const { franchiseEntries, independentProjects, firstLookDeals } = React.useMemo(() => {
    const franchisesMap = new Map<string, Project[]>();
    const independent: Project[] = [];
    
    releasedProjects.forEach(p => {
      const rootId = p.parentProjectId || p.id;
      const isPartOfFranchise = p.isSpinoff || releasedProjects.some(other => other.parentProjectId === p.id);
      
      if (isPartOfFranchise) {
        const existing = franchisesMap.get(rootId) || [];
        franchisesMap.set(rootId, [...existing, p]);
      } else {
        independent.push(p);
      }
    });

    return {
      franchiseEntries: Array.from(franchisesMap.entries()),
      independentProjects: independent,
      firstLookDeals: studio?.internal.firstLookDeals || []
    };
  }, [releasedProjects, studio]);

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 overflow-hidden">
      {/* Vault Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white/5 p-5 rounded-xl border border-white/5 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-lg bg-secondary/10 border border-secondary/20 flex items-center justify-center">
              <Archive className="h-5 w-5 text-secondary" />
            </div>
            <h2 className="text-2xl font-black tracking-tighter uppercase leading-none">Catalog & IP Vault</h2>
          </div>
          <p className="text-[11px] font-black uppercase text-muted-foreground/60 tracking-[0.2em]">Intellectual Property Protection • {releasedProjects.length} Assets</p>
        </div>
        
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary uppercase font-black tracking-widest text-[9px] py-1">
            {releasedProjects.length} Catalog Entries
          </Badge>
          <Badge variant="outline" className="bg-secondary/5 border-secondary/20 text-secondary uppercase font-black tracking-widest text-[9px] py-1">
            {franchiseEntries.length} Active Franchises
          </Badge>
        </div>
      </div>

      <ScrollArea className="flex-1 pr-4">
        <div className="space-y-10 pb-12">
          {/* Franchises Section */}
          {franchiseEntries.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 px-2">
                <div className="w-1.5 h-4 rounded-full bg-primary" />
                <h3 className="text-xs font-black uppercase tracking-widest text-foreground/80 flex items-center gap-2">
                  Established Franchises
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {franchiseEntries.map(([rootId, projects]) => (
                  <FranchiseCard key={rootId} projects={projects} />
                ))}
              </div>
            </div>
          )}

          {/* Library Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 px-2">
              <div className="w-1.5 h-4 rounded-full bg-secondary" />
              <h3 className="text-xs font-black uppercase tracking-widest text-foreground/80 flex items-center gap-2">
                Intellectual Property Library
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {independentProjects.length === 0 && franchiseEntries.length === 0 ? (
                <div className="col-span-full py-20 text-center glass-card border-none">
                  <Library className="w-10 h-10 text-muted-foreground/20 mx-auto mb-4" />
                  <p className="text-sm font-bold text-muted-foreground/40 uppercase tracking-widest">The vault is currently empty.</p>
                </div>
              ) : (
                independentProjects.map(p => (
                   <LibraryItem key={p.id} project={p} />
                ))
              )}
            </div>
          </div>

          {/* First Look Deals */}
          {firstLookDeals.length > 0 && (
            <div className="space-y-4">
               <div className="flex items-center gap-3 px-2">
                <div className="w-1.5 h-4 rounded-full bg-blue-500" />
                <h3 className="text-xs font-black uppercase tracking-widest text-foreground/80">
                  Active First-Look Pipeline
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {firstLookDeals.map(deal => {
                   const talent = gameState?.industry.talentPool[deal.talentId];
                   return (
                     <Card key={deal.talentId} className="glass-card border-l-4 border-l-blue-500/50 border-none group hover-glow">
                        <CardContent className="p-5">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="text-sm font-black uppercase tracking-tight group-hover:text-blue-400 transition-colors">{talent?.name || 'Unknown Talent'}</div>
                              <div className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Exclusive Creator Deal</div>
                            </div>
                            <LinkIcon className="h-3.5 w-3.5 text-blue-500/40" />
                          </div>
                          <div className="flex items-center justify-between pt-3 border-t border-white/5">
                            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Term Remaining</span>
                            <span className="text-xs font-mono font-bold text-blue-400">{deal.weeksRemaining}w</span>
                          </div>
                        </CardContent>
                     </Card>
                   );
                })}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

const FranchiseCard = ({ projects }: { projects: Project[] }) => {
  const root = projects.find(p => !p.parentProjectId) || projects[0];
  const totalRevenue = projects.reduce((sum, p) => sum + p.revenue, 0);
  
  return (
    <Card className="glass-card group overflow-hidden relative border-none hover-glow">
      {/* Decorative Branding */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Star className="w-12 h-12 text-primary" />
      </div>

      <CardContent className="p-6 space-y-5">
        <div className="flex justify-between items-start relative z-10">
          <div>
            <h4 className="text-xl font-black tracking-tighter uppercase group-hover:text-primary transition-colors">{root.title.split(':')[0]} IP Group</h4>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-[9px] font-black border-primary/20 bg-primary/5 text-primary tracking-widest uppercase py-0">{root.genre}</Badge>
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">{projects.length} Total Units</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 pt-2">
          <div className="space-y-1">
            <div className="text-[9px] uppercase font-black text-muted-foreground tracking-widest flex items-center gap-1.5">
              <DollarSign className="h-2.5 w-2.5" /> Gross Yield
            </div>
            <div className="text-xl font-black tracking-tight text-glow text-primary">{formatMoney(totalRevenue)}</div>
          </div>
          <div className="space-y-1">
            <div className="text-[9px] uppercase font-black text-muted-foreground tracking-widest flex items-center gap-1.5">
              <TrendingUp className="h-2.5 w-2.5" /> Critical Index
            </div>
            <div className="text-xl font-black tracking-tight text-foreground/80">
              {(projects.reduce((sum, p) => sum + (p.reviewScore || 0), 0) / projects.length).toFixed(1)}/10
            </div>
          </div>
        </div>
        
        <div className="space-y-2 pt-2 border-t border-white/5">
          <div className="text-[9px] uppercase font-black text-muted-foreground tracking-widest">Property Components</div>
          <div className="flex flex-wrap gap-1.5">
            {projects.slice(-4).reverse().map(p => (
              <Badge key={p.id} variant="outline" className="text-[9px] font-medium bg-white/5 border-white/5 hover:bg-white/10 transition-colors">
                {p.title}
              </Badge>
            ))}
            {projects.length > 4 && <Badge variant="outline" className="text-[9px] text-muted-foreground/60 border-none bg-transparent whitespace-nowrap">+ {projects.length - 4} more</Badge>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const LibraryItem = ({ project }: { project: Project }) => {
  return (
    <Card className="glass-card border-none hover-glow group transition-all duration-300">
      <CardContent className="p-5 flex flex-col h-full space-y-4">
        <div className="flex justify-between items-start gap-3">
          <div className="min-w-0">
            <h4 className="text-sm font-black uppercase tracking-tight truncate group-hover:text-secondary transition-colors">{project.title}</h4>
            <div className="text-[9px] font-black uppercase text-muted-foreground/60 tracking-widest mt-0.5">{project.format} Asset</div>
          </div>
          <Badge variant="outline" className="text-[9px] font-black border-white/5 bg-white/5 uppercase h-5">{project.genre}</Badge>
        </div>

        <div className="flex-1 py-1">
           <p className="text-[11px] text-muted-foreground/80 italic line-clamp-2 leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity">"{project.flavor}"</p>
        </div>

        <div className="grid grid-cols-2 gap-4 pb-3 border-b border-white/5 pt-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-emerald-500/10 flex items-center justify-center">
              <DollarSign className="w-3 h-3 text-emerald-500" />
            </div>
            <span className="text-[11px] font-black tracking-tight">{formatMoney(project.revenue)}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
              <Award className="w-3 h-3 text-primary" />
            </div>
            <span className="text-[11px] font-black tracking-tight">{project.reviewScore || 0}/10</span>
          </div>
        </div>

        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">
           <span>Release Week {project.releaseWeek}</span>
           {project.isCultClassic && (
             <span className="flex items-center gap-1.5 text-pink-500 text-glow animate-pulse">
               <Zap className="h-2.5 w-2.5" />
               Cult Status
             </span>
           )}
        </div>
      </CardContent>
    </Card>
  );
};
