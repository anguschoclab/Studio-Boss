import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tv, Activity, Star, AlertCircle, PlayCircle, Zap, BarChart3, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Project, SeriesProject } from '@/engine/types';
import { useShallow } from 'zustand/react/shallow';
import { cn } from '@/lib/utils';
import { NielsenProfile } from '@/engine/systems/television/nielsenSystem';

export const TelevisionDashboard = () => {
  const activeProjects = useGameStore(useShallow(s => Object.values(s.gameState?.entities?.projects || {})));
  
  const tvShows = React.useMemo(() => 
    (activeProjects as Project[]).filter((p: Project) => p.type === 'SERIES' && 'tvDetails' in p),
  [activeProjects]);

  if (tvShows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 text-center opacity-30">
        <Tv className="w-16 h-16 mb-4 text-muted-foreground" />
        <h3 className="text-xl font-black uppercase tracking-tighter">No Active Series</h3>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-2">The small screen is currently dark.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white/5 p-5 rounded-xl border border-white/5 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Tv className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-2xl font-black tracking-tighter uppercase leading-none">TV Empire Status</h2>
          </div>
          <p className="text-[11px] font-black uppercase text-muted-foreground/60 tracking-[0.2em]">Episodic Production • Weekly Ratings • Renewal Watch</p>
        </div>
      </div>

      <ScrollArea className="flex-1 pr-4">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-10">
          {(tvShows as Project[]).map((show: Project) => (
            <TVShowCard key={show.id} show={show} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

const TVShowCard = ({ show }: { show: Project }) => {
  if (show.type !== 'SERIES' || !('tvDetails' in show)) return null;
  const series = show as SeriesProject;
  const details = series.tvDetails;
  const nielsen = series.nielsenProfile as NielsenProfile | undefined;
  const latestSnap = nielsen?.snapshots?.[nielsen.snapshots.length - 1];
  
  const statusColors: Record<string, string> = {
    'ON_AIR': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    'ON_BUBBLE': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    'RENEWED': 'bg-primary/10 text-primary border-primary/20',
    'CANCELLED': 'bg-red-500/10 text-red-500 border-red-500/20',
    'IN_DEVELOPMENT': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    'SYNDICATED': 'bg-purple-500/10 text-purple-500 border-purple-500/20'
  };

  const progressPercent = (details.episodesAired / details.episodesOrdered) * 100;

  return (
    <Card className="glass-card border-none hover-glow overflow-hidden relative group transition-all duration-500">
      <CardContent className="p-0">
        <div className="p-6 pb-2">
          <div className="flex justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge className={cn("text-[9px] font-black uppercase tracking-widest", statusColors[details.status] || '')}>
                  {details.status.replace('_', ' ')}
                </Badge>
                {details.averageRating > 8 && (
                   <Badge variant="outline" className="text-[9px] font-black border-primary/40 text-primary uppercase bg-primary/5">CRITICAL DARLING</Badge>
                )}
              </div>
              <h3 className="text-xl font-black tracking-tighter uppercase group-hover:text-primary transition-colors">{show.title}</h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">S{details.currentSeason} • {show.format.toUpperCase()}</p>
            </div>
            <div className="text-right">
              <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1 leading-none">Rating</div>
              <div className="text-3xl font-black tracking-tighter text-glow text-primary">
                {details.averageRating.toFixed(1)}
              </div>
            </div>
          </div>
        </div>

        {/* Nielsen Ratings Strip */}
        {latestSnap && (
          <div className="px-6 py-3 bg-primary/5 border-y border-primary/10">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-3 w-3 text-primary" />
              <span className="text-[9px] font-black uppercase tracking-widest text-primary">Nielsen Overnights</span>
              {latestSnap.trend === 'UP' && <TrendingUp className="h-3 w-3 text-emerald-500" />}
              {latestSnap.trend === 'DOWN' && <TrendingDown className="h-3 w-3 text-red-500" />}
              {latestSnap.trend === 'STABLE' && <Minus className="h-3 w-3 text-muted-foreground" />}
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div>
                <div className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">HH Rtg</div>
                <div className="text-sm font-black">{latestSnap.householdRating.toFixed(1)}</div>
              </div>
              <div>
                <div className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Share</div>
                <div className="text-sm font-black">{latestSnap.householdShare.toFixed(0)}%</div>
              </div>
              <div>
                <div className="text-[8px] font-black text-amber-500 uppercase tracking-widest">A18-49</div>
                <div className="text-sm font-black text-amber-500">{latestSnap.keyDemo.toFixed(1)}</div>
              </div>
              <div>
                <div className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Viewers</div>
                <div className="text-sm font-black">{latestSnap.totalViewers.toFixed(1)}M</div>
              </div>
            </div>
          </div>
        )}

        <div className="px-6 py-4 grid grid-cols-3 gap-4 border-y border-white/5 bg-white/2">
           <div className="space-y-1">
              <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                <Activity className="h-2.5 w-2.5" /> Episodes
              </div>
              <div className="text-sm font-black tracking-tight">{details.episodesAired} / {details.episodesOrdered}</div>
           </div>
           <div className="space-y-1">
              <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                <Star className="h-2.5 w-2.5" /> Buzz
              </div>
              <div className="text-sm font-black tracking-tight">{Math.round(show.buzz)}</div>
           </div>
           <div className="space-y-1">
              <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                <Zap className="h-2.5 w-2.5" /> Quality
              </div>
              <div className="text-sm font-black tracking-tight">{Math.round(show.reviewScore ?? 0)}</div>
           </div>
        </div>

        <div className="h-1.5 w-full bg-white/5 relative">
          <div 
            className="absolute top-0 left-0 h-full bg-primary transition-all duration-1000"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="p-4 px-6 flex justify-between items-center text-[9px] font-black uppercase text-muted-foreground/60 tracking-[0.15em]">
           <span className="flex items-center gap-1.5">
             <AlertCircle className="h-2.5 w-2.5" /> 
             {details.status === 'ON_AIR' ? 'Currently Airing' : 'Awaiting Review'}
           </span>
           <span className="flex items-center gap-1.5">
             <PlayCircle className="h-2.5 w-2.5" />
             {latestSnap ? `#${latestSnap.rank} This Week` : `Cycle Week ${show.productionWeeks}`}
           </span>
        </div>
      </CardContent>
    </Card>
  );
};
