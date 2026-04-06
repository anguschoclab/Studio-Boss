import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tv, TrendingUp, TrendingDown, Minus, BarChart3, Users, Radio, Clock, Trophy, ArrowUp, ArrowDown } from 'lucide-react';
import { SeriesProject, Project } from '@/engine/types';
import { useShallow } from 'zustand/react/shallow';
import { cn } from '@/lib/utils';
import { NielsenSnapshot, NielsenProfile, NielsenDemographic, TIME_SLOTS } from '@/engine/systems/television/nielsenSystem';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, CartesianGrid, Legend, LineChart, Line } from 'recharts';

// Color map for demographics
const DEMO_COLORS: Record<NielsenDemographic, string> = {
  'P2+': 'hsl(var(--primary))',
  'A18-49': '#f59e0b',
  'A25-54': '#3b82f6',
  'A18-34': '#10b981',
  'W18-49': '#ec4899',
  'M18-49': '#6366f1',
  'K2-11': '#f97316',
  'T12-17': '#8b5cf6'
};

export const NielsenDashboard = () => {
  const projects = useGameStore(useShallow(s => Object.values(s.gameState?.entities.projects || {})));
  const week = useGameStore(s => s.gameState?.week || 0);
  
  const tvShows = React.useMemo(() => 
    projects.filter((p: Project): p is SeriesProject => 
      p.type === 'SERIES' && 'tvDetails' in p && !!(p as any).nielsenProfile
    ),
  [projects]);

  const airingShows = tvShows.filter(s => s.tvDetails.status === 'ON_AIR');
  const allShows = tvShows;

  // Weekly rankings by key demo
  const weeklyRankings = React.useMemo(() => {
    return airingShows
      .map(show => {
        const profile = (show as any).nielsenProfile as NielsenProfile | undefined;
        const latest = profile?.snapshots?.[profile.snapshots.length - 1];
        return { show, profile, latest };
      })
      .filter(r => r.latest)
      .sort((a, b) => (b.latest!.keyDemo) - (a.latest!.keyDemo));
  }, [airingShows]);

  if (allShows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 text-center opacity-30">
        <Radio className="w-16 h-16 mb-4 text-muted-foreground" />
        <h3 className="text-xl font-black uppercase tracking-tighter">No Nielsen Data</h3>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-2">
          Greenlight a TV series to start tracking ratings.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white/5 p-5 rounded-xl border border-white/5 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-2xl font-black tracking-tighter uppercase leading-none">Nielsen Ratings</h2>
          </div>
          <p className="text-[11px] font-black uppercase text-muted-foreground/60 tracking-[0.2em]">
            Week {week} • Live+SD & L+7 • Demographic Breakdowns
          </p>
        </div>
        <div className="flex gap-3">
          <StatChip label="Airing" value={airingShows.length} icon={<Tv className="h-3 w-3" />} />
          <StatChip label="Tracked" value={allShows.length} icon={<Radio className="h-3 w-3" />} />
        </div>
      </div>

      <Tabs defaultValue="rankings" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="bg-white/5 border border-white/5">
          <TabsTrigger value="rankings" className="text-xs font-black uppercase tracking-wider">Weekly Rankings</TabsTrigger>
          <TabsTrigger value="details" className="text-xs font-black uppercase tracking-wider">Show Detail</TabsTrigger>
          <TabsTrigger value="demographics" className="text-xs font-black uppercase tracking-wider">Demographics</TabsTrigger>
        </TabsList>

        <TabsContent value="rankings" className="flex-1 overflow-hidden mt-4">
          <ScrollArea className="h-full">
            <WeeklyRankingsTable rankings={weeklyRankings} />
          </ScrollArea>
        </TabsContent>

        <TabsContent value="details" className="flex-1 overflow-hidden mt-4">
          <ScrollArea className="h-full">
            <div className="grid grid-cols-1 gap-6 pb-10">
              {allShows.map(show => (
                <ShowDetailCard key={show.id} show={show} />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="demographics" className="flex-1 overflow-hidden mt-4">
          <ScrollArea className="h-full">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-10">
              {allShows.map(show => (
                <DemoBreakdownCard key={show.id} show={show} />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// --- Sub-components ---

const StatChip = ({ label, value, icon }: { label: string; value: number | string; icon: React.ReactNode }) => (
  <div className="flex items-center gap-2 bg-white/5 border border-white/5 rounded-lg px-3 py-2">
    {icon}
    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</span>
    <span className="text-sm font-black">{value}</span>
  </div>
);

const TrendIcon = ({ trend }: { trend: string }) => {
  if (trend === 'UP') return <ArrowUp className="h-3.5 w-3.5 text-emerald-500" />;
  if (trend === 'DOWN') return <ArrowDown className="h-3.5 w-3.5 text-red-500" />;
  if (trend === 'PREMIERE') return <Trophy className="h-3.5 w-3.5 text-amber-500" />;
  if (trend === 'FINALE') return <Trophy className="h-3.5 w-3.5 text-primary" />;
  return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
};

interface RankingEntry {
  show: SeriesProject;
  profile: NielsenProfile | undefined;
  latest: NielsenSnapshot | undefined;
}

const WeeklyRankingsTable = ({ rankings }: { rankings: RankingEntry[] }) => {
  if (rankings.length === 0) {
    return (
      <div className="text-center py-12 opacity-40">
        <p className="text-xs font-black uppercase tracking-widest">No shows currently airing</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 pb-10">
      {/* Table header */}
      <div className="grid grid-cols-12 gap-2 px-4 py-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">
        <div className="col-span-1">#</div>
        <div className="col-span-3">Show</div>
        <div className="col-span-1">Slot</div>
        <div className="col-span-1 text-right">HH Rtg</div>
        <div className="col-span-1 text-right">Share</div>
        <div className="col-span-1 text-right">A18-49</div>
        <div className="col-span-2 text-right">Viewers (M)</div>
        <div className="col-span-1 text-right">L+7</div>
        <div className="col-span-1 text-center">Trend</div>
      </div>

      {rankings.map(({ show, profile, latest }, idx) => (
        <Card key={show.id} className={cn(
          "glass-card border-none overflow-hidden transition-all duration-300",
          idx === 0 && "ring-1 ring-amber-500/30 bg-amber-500/5"
        )}>
          <div className="grid grid-cols-12 gap-2 items-center px-4 py-3">
            <div className="col-span-1">
              <span className={cn(
                "text-lg font-black",
                idx === 0 && "text-amber-500",
                idx === 1 && "text-slate-400",
                idx === 2 && "text-orange-400"
              )}>
                {idx + 1}
              </span>
            </div>
            <div className="col-span-3">
              <div className="text-sm font-black tracking-tight uppercase truncate">{show.title}</div>
              <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                S{show.tvDetails.currentSeason} E{latest?.episodeNumber || 0} • {show.genre}
              </div>
            </div>
            <div className="col-span-1">
              <Badge variant="outline" className="text-[8px] font-black tracking-wider">
                {latest?.timeSlot || '—'}
              </Badge>
            </div>
            <div className="col-span-1 text-right">
              <span className="text-sm font-black">{latest?.householdRating.toFixed(1)}</span>
            </div>
            <div className="col-span-1 text-right">
              <span className="text-sm font-black text-muted-foreground">{latest?.householdShare.toFixed(0)}%</span>
            </div>
            <div className="col-span-1 text-right">
              <span className="text-sm font-black text-amber-500">{latest?.keyDemo.toFixed(1)}</span>
            </div>
            <div className="col-span-2 text-right">
              <span className="text-sm font-black">{latest?.totalViewers.toFixed(2)}M</span>
            </div>
            <div className="col-span-1 text-right">
              <span className="text-xs font-bold text-emerald-500">+{profile?.dvrLift || 0}%</span>
            </div>
            <div className="col-span-1 flex justify-center">
              <TrendIcon trend={latest?.trend || 'STABLE'} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

const ShowDetailCard = ({ show }: { show: SeriesProject }) => {
  const profile = (show as any).nielsenProfile as NielsenProfile | undefined;
  if (!profile || profile.snapshots.length === 0) return null;

  const chartData = profile.snapshots.map(snap => ({
    ep: `E${snap.episodeNumber}`,
    hh: snap.householdRating,
    demo: snap.keyDemo,
    viewers: snap.totalViewers,
    live7: snap.live7Viewers
  }));

  return (
    <Card className="glass-card border-none overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-black tracking-tighter uppercase">{show.title}</CardTitle>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
              S{show.tvDetails.currentSeason} • {show.genre} • {TIME_SLOTS[profile.timeSlot]?.label || profile.timeSlot}
            </p>
          </div>
          <div className="text-right space-y-1">
            <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Season Avg</div>
            <div className="text-2xl font-black text-primary">{profile.seasonAvgKeyDemo.toFixed(1)}</div>
            <div className="text-[9px] font-bold text-muted-foreground">A18-49</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Key metrics row */}
        <div className="grid grid-cols-4 gap-3">
          <MetricBox label="HH Rating" value={profile.seasonAvgHH.toFixed(1)} />
          <MetricBox label="Avg Viewers" value={`${profile.seasonAvgViewers.toFixed(1)}M`} />
          <MetricBox label="Retention" value={`${profile.audienceRetention}%`} color={profile.audienceRetention >= 80 ? 'text-emerald-500' : profile.audienceRetention >= 60 ? 'text-amber-500' : 'text-red-500'} />
          <MetricBox label="DVR Lift" value={`+${profile.dvrLift}%`} color="text-emerald-500" />
        </div>

        {/* Viewership trend chart */}
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground) / 0.1)" />
              <XAxis dataKey="ep" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }}
              />
              <Area type="monotone" dataKey="live7" name="L+7 Viewers (M)" fill="hsl(var(--primary) / 0.15)" stroke="hsl(var(--primary) / 0.4)" strokeDasharray="4 4" />
              <Area type="monotone" dataKey="viewers" name="Live+SD (M)" fill="hsl(var(--primary) / 0.3)" stroke="hsl(var(--primary))" />
              <Area type="monotone" dataKey="demo" name="A18-49 Rtg" fill="#f59e0b33" stroke="#f59e0b" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

const DemoBreakdownCard = ({ show }: { show: SeriesProject }) => {
  const profile = (show as any).nielsenProfile as NielsenProfile | undefined;
  if (!profile || profile.snapshots.length === 0) return null;

  const latest = profile.snapshots[profile.snapshots.length - 1];
  const demoData = latest.demoRatings
    .filter(d => d.demo !== 'P2+')
    .map(d => ({
      name: d.label,
      rating: d.rating,
      viewers: d.viewers,
      demo: d.demo
    }));

  return (
    <Card className="glass-card border-none overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-black tracking-tighter uppercase">{show.title} — Demographics</CardTitle>
        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
          Episode {latest.episodeNumber} Breakdown
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={demoData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground) / 0.1)" />
              <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} width={80} />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }}
                formatter={(value: number) => [`${value.toFixed(2)}`, 'Rating']}
              />
              <Bar dataKey="rating" name="Rating" radius={[0, 4, 4, 0]}>
                {demoData.map((entry, idx) => (
                  <Cell key={idx} fill={DEMO_COLORS[entry.demo as NielsenDemographic] || 'hsl(var(--primary))'} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

const MetricBox = ({ label, value, color }: { label: string; value: string; color?: string }) => (
  <div className="bg-white/5 rounded-lg p-3 border border-white/5 text-center">
    <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">{label}</div>
    <div className={cn("text-lg font-black tracking-tight", color)}>{value}</div>
  </div>
);
