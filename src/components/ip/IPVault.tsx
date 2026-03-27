import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { selectReleasedProjects, selectStudio } from '@/store/selectors';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Library, Link as LinkIcon, Star, TrendingUp, DollarSign, Award } from 'lucide-react';
import { formatMoney } from '@/engine/utils';
import { Project } from '@/engine/types';

import { useShallow } from 'zustand/react/shallow';

export const IPVault = () => {
  const gameState = useGameStore(s => s.gameState);
  
  // Use useShallow to prevent re-renders when the filtered array has the same content
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
    <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-500 overflow-hidden">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 tracking-tight">IP Vault</h2>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary uppercase font-bold tracking-widest text-[10px]">
            {releasedProjects.length} Catalog Entries
          </Badge>
          <Badge variant="outline" className="bg-secondary/5 border-secondary/20 text-secondary uppercase font-bold tracking-widest text-[10px]">
            {franchiseEntries.length} Active Franchises
          </Badge>
        </div>
      </div>

      <ScrollArea className="flex-1 pr-4">
        <div className="space-y-8 pb-8">
          {/* Franchises Section */}
          {franchiseEntries.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Star className="w-4 h-4 text-primary" /> Active Franchises
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {franchiseEntries.map(([rootId, projects]) => (
                  <FranchiseCard key={rootId} projects={projects} />
                ))}
              </div>
            </div>
          )}

          {/* Library Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Library className="w-4 h-4 text-secondary" /> Studio Library
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {independentProjects.length === 0 && franchiseEntries.length === 0 ? (
                <div className="col-span-full border-2 border-dashed border-border/50 rounded-xl p-12 text-center bg-card/20 backdrop-blur-sm">
                  <p className="text-muted-foreground">The vault is empty. Release your first project to start your catalog.</p>
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
              <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-blue-400" /> First-Look Deals
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {firstLookDeals.map(deal => {
                   const talent = gameState?.industry.talentPool.find(t => t.id === deal.talentId);
                   return (
                     <Card key={deal.talentId} className="bg-card/40 border-blue-500/20">
                       <CardHeader className="p-4 pb-2">
                         <CardTitle className="text-sm font-bold">{talent?.name || 'Unknown Talent'}</CardTitle>
                         <CardDescription className="text-[10px] uppercase">Exclusive Multi-Year Deal</CardDescription>
                       </CardHeader>
                       <CardContent className="p-4 pt-0">
                         <div className="text-[11px] text-muted-foreground">
                           Expires in {deal.weeksRemaining} weeks
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
    <Card className="bg-card/40 border-primary/20 hover:border-primary/40 transition-colors group overflow-hidden relative">
      <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
        <Star className="w-12 h-12 text-primary" />
      </div>
      <CardHeader className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="font-display text-lg font-black tracking-tight">{root.title.split(':')[0]} Universe</CardTitle>
            <CardDescription className="text-xs">{projects.length} Installments in Catalog</CardDescription>
          </div>
          <Badge className="bg-primary/20 text-primary border-primary/30 h-fit">{root.genre}</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-5 pt-0 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Lifetime Revenue</div>
            <div className="text-lg font-black text-foreground">{formatMoney(totalRevenue)}</div>
          </div>
          <div className="flex-1">
            <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Avg Rating</div>
            <div className="text-lg font-black text-foreground">
              {(projects.reduce((sum, p) => sum + (p.reviewScore || 0), 0) / projects.length).toFixed(1)}/10
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="text-[10px] uppercase font-bold text-muted-foreground">Recent Releases</div>
          <div className="flex flex-wrap gap-1.5">
            {projects.slice(-3).reverse().map(p => (
              <Badge key={p.id} variant="secondary" className="text-[9px] bg-secondary/10 hover:bg-secondary/20 truncate max-w-[150px]">
                {p.title}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const LibraryItem = ({ project }: { project: Project }) => {
  return (
    <Card className="bg-card/40 border-border/40 hover:border-secondary/40 transition-colors h-full flex flex-col">
      <CardHeader className="p-4 pb-2 shrink-0">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-sm font-bold line-clamp-1">{project.title}</CardTitle>
          <Badge variant="outline" className="text-[9px] shrink-0 uppercase">{project.format}</Badge>
        </div>
        <CardDescription className="text-[10px] line-clamp-2 italic">"{project.flavor}"</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-2 flex flex-col justify-between flex-1 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-1.5 grayscale opacity-70">
            <DollarSign className="w-3 h-3 text-emerald-400" />
            <span className="text-[11px] font-bold">{formatMoney(project.revenue)}</span>
          </div>
          <div className="flex items-center gap-1.5 grayscale opacity-70">
            <Award className="w-3 h-3 text-primary" />
            <span className="text-[11px] font-bold">{project.reviewScore || 0}/10</span>
          </div>
        </div>
        <div className="pt-2 border-t border-border/20 flex justify-between items-center shrink-0">
           <span className="text-[10px] text-muted-foreground font-mono">Released Wk {project.releaseWeek}</span>
           {project.isCultClassic && (
             <Badge className="bg-pink-500/10 text-pink-500 border-pink-500/20 text-[9px] h-fit">Cult Classic</Badge>
           )}
        </div>
      </CardContent>
    </Card>
  );
};
