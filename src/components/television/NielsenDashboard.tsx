import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tv, Minus, BarChart3, Users, Radio, Clock, Trophy, ArrowUp, ArrowDown, Activity, Zap } from 'lucide-react';
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
  const projects = useGameStore(useShallow(s => Object.values(s.gameState?.studio.internal.projects || {})));
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
      <div className="flex flex-col items-center justify-center h-full py-40 text-center opacity-20 space-y-8 animate-in fade-in duration-1000">
        <Radio className="w-20 h-20 text-muted-foreground" strokeWidth={1} />
        <div className="space-y-2">
          <h3 className="text-2xl font-display font-black uppercase tracking-[0.4em] italic">NO NIELSEN DATA</h3>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
            GREENLIGHT A TV SERIES TO START TRACKING RATINGS
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 overflow-hidden pb-20">
      {/* Executive Ratings Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 bg-white/[0.02] p-10 rounded-none border border-white/5 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[120px] -mr-32 -mt-32" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-6 mb-2">
            <div className="w-16 h-16 rounded-none bg-primary/5 border border-primary/20 flex items-center justify-center shadow-[0_0_30px_rgba(var(--primary),0.1)]">
              <BarChart3 className="h-8 w-8 text-primary" strokeWidth={1} />
            </div>
            <div>
              <h2 className="text-5xl font-display font-black tracking-tighter uppercase italic leading-none mb-3 drop-shadow-[0_0_30px_rgba(var(--primary),0.1)]">NIELSEN RATINGS</h2>
              <p className="text-[10px] font-black uppercase text-muted-foreground/30 tracking-[0.4em] italic flex items-center gap-4">
                WEEK {week}
                <span className="w-1.5 h-1.5 bg-white/10" />
                LIVE+SD & L+7
                <span className="w-1.5 h-1.5 bg-white/10" />
                DEMOGRAPHIC BREAKDOWNS
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-6 relative z-10">
          <StatChip label="AIRING" value={airingShows.length} icon={<Tv className="h-4 w-4 text-primary" />} />
          <StatChip label="TRACKED" value={allShows.length} icon={<Radio className="h-4 w-4 text-violet-400" />} />
        </div>
      </div>

      <Tabs defaultValue="rankings" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="bg-white/[0.02] border border-white/5 p-1 h-14 rounded-none w-fit mb-8">
          <TabsTrigger value="rankings" className="h-12 px-10 text-[10px] font-black uppercase tracking-[0.2em] rounded-none data-[state=active]:bg-white/10 italic transition-all duration-700">WEEKLY RANKINGS</TabsTrigger>
          <TabsTrigger value="details" className="h-12 px-10 text-[10px] font-black uppercase tracking-[0.2em] rounded-none data-[state=active]:bg-white/10 italic transition-all duration-700">SHOW DETAIL</TabsTrigger>
          <TabsTrigger value="demographics" className="h-12 px-10 text-[10px] font-black uppercase tracking-[0.2em] rounded-none data-[state=active]:bg-white/10 italic transition-all duration-700">DEMOGRAPHICS</TabsTrigger>
        </TabsList>

        <TabsContent value="rankings" className="flex-1 overflow-hidden mt-0 outline-none animate-in fade-in duration-1000">
          <ScrollArea className="h-full custom-scrollbar pr-6">
            <WeeklyRankingsTable rankings={weeklyRankings} />
          </ScrollArea>
        </TabsContent>

        <TabsContent value="details" className="flex-1 overflow-hidden mt-0 outline-none animate-in fade-in duration-1000">
          <ScrollArea className="h-full custom-scrollbar pr-6">
            <div className="grid grid-cols-1 gap-10 pb-20">
              {allShows.map(show => (
                <ShowDetailCard key={show.id} show={show} />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="demographics" className="flex-1 overflow-hidden mt-0 outline-none animate-in fade-in duration-1000">
          <ScrollArea className="h-full custom-scrollbar pr-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 pb-20">
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
  <div className="flex flex-col gap-2 bg-white/[0.02] border border-white/5 rounded-none px-8 py-5 min-w-[160px] shadow-xl relative overflow-hidden group">
    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-30 transition-opacity duration-700">
      {icon}
    </div>
    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic leading-none">{label}</span>
    <span className="text-3xl font-display font-black italic leading-none">{value}</span>
  </div>
);

const TrendIcon = ({ trend }: { trend: string }) => {
  if (trend === 'UP') return <ArrowUp className="h-5 w-5 text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]" />;
  if (trend === 'DOWN') return <ArrowDown className="h-5 w-5 text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.3)]" />;
  if (trend === 'PREMIERE') return <Trophy className="h-5 w-5 text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]" />;
  if (trend === 'FINALE') return <Trophy className="h-5 w-5 text-primary drop-shadow-[0_0_10px_rgba(var(--primary),0.3)]" />;
  return <Minus className="h-5 w-5 text-muted-foreground/20" />;
};

interface RankingEntry {
  show: SeriesProject;
  profile: NielsenProfile | undefined;
  latest: NielsenSnapshot | undefined;
}

const WeeklyRankingsTable = ({ rankings }: { rankings: RankingEntry[] }) => {
  if (rankings.length === 0) {
    return (
      <div className="text-center py-32 opacity-20 flex flex-col items-center gap-6">
        <Activity className="w-12 h-12" strokeWidth={1} />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] italic">NO SHOWS CURRENTLY AIRING</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-10">
      {/* Table header */}
      <div className="grid grid-cols-12 gap-4 px-10 py-4 text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/20 italic border-b border-white/5">
        <div className="col-span-1">RANK</div>
        <div className="col-span-3">PROPERTY SLATE</div>
        <div className="col-span-1 text-center">SLOT</div>
        <div className="col-span-1 text-right">HH RTG</div>
        <div className="col-span-1 text-right">SHARE</div>
        <div className="col-span-1 text-right">A18-49</div>
        <div className="col-span-2 text-right">VIEWERS (M)</div>
        <div className="col-span-1 text-right">L+7 LIFT</div>
        <div className="col-span-1 text-center">TREND</div>
      </div>

      {rankings.map(({ show, profile, latest }, idx) => (
        <Card key={show.id} className={cn(
          "glass-card border border-white/5 rounded-none overflow-hidden transition-all duration-700 bg-white/[0.01] hover:bg-white/[0.03] shadow-xl relative",
          idx === 0 && "ring-1 ring-amber-500/20 bg-amber-500/[0.02]"
        )}>
          {idx === 0 && <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />}
          <div className="grid grid-cols-12 gap-4 items-center px-10 py-8">
            <div className="col-span-1">
              <span className={cn(
                "text-3xl font-display font-black italic",
                idx === 0 && "text-amber-500",
                idx === 1 && "text-slate-400",
                idx === 2 && "text-orange-400",
                idx > 2 && "text-muted-foreground/20"
              )}>
                {String(idx + 1).padStart(2, '0')}
              </span>
            </div>
            <div className="col-span-3">
              <div className="text-sm font-black tracking-[0.15em] uppercase truncate italic mb-1 group-hover:text-primary transition-all duration-700">{show.title}</div>
              <div className="text-[9px] font-black text-muted-foreground/20 uppercase tracking-[0.2em] italic">
                S{show.tvDetails.currentSeason} E{latest?.episodeNumber || 0} • {show.genre.toUpperCase()}
              </div>
            </div>
            <div className="col-span-1 flex justify-center">
              <div className="text-[9px] font-black border border-white/10 bg-white/[0.02] uppercase px-3 h-5 flex items-center justify-center tracking-[0.15em] rounded-none italic text-muted-foreground/40">
                {latest?.timeSlot || '—'}
              </div>
            </div>
            <div className="col-span-1 text-right">
              <span className="text-lg font-display font-black italic leading-none">{latest?.householdRating.toFixed(1)}</span>
            </div>
            <div className="col-span-1 text-right">
              <span className="text-lg font-display font-black italic leading-none text-muted-foreground/40">{latest?.householdShare.toFixed(0)}%</span>
            </div>
            <div className="col-span-1 text-right">
              <span className="text-lg font-display font-black italic leading-none text-amber-500">{latest?.keyDemo.toFixed(1)}</span>
            </div>
            <div className="col-span-2 text-right">
              <span className="text-lg font-display font-black italic leading-none">{latest?.totalViewers.toFixed(2)}M</span>
            </div>
            <div className="col-span-1 text-right">
              <span className="text-xs font-black text-emerald-400 italic">+{profile?.dvrLift || 0}%</span>
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
    <Card className="glass-card border border-white/5 rounded-none overflow-hidden bg-white/[0.01] shadow-2xl">
      <CardHeader className="p-10 border-b border-white/5 bg-white/[0.02]">
        <div className="flex justify-between items-start">
          <div className="space-y-3">
            <CardTitle className="text-3xl font-display font-black tracking-tighter uppercase italic leading-none">{show.title}</CardTitle>
            <div className="flex items-center gap-4">
              <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] italic">
                S{show.tvDetails.currentSeason} • {show.genre.toUpperCase()} • {TIME_SLOTS[profile.timeSlot]?.label.toUpperCase() || profile.timeSlot.toUpperCase()}
              </p>
            </div>
          </div>
          <div className="text-right space-y-2 bg-primary/5 border border-primary/20 px-8 py-5 rounded-none shadow-xl">
            <div className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] italic leading-none">SEASON AVG</div>
            <div className="text-4xl font-display font-black text-primary italic leading-none">{profile.seasonAvgKeyDemo.toFixed(1)}</div>
            <div className="text-[9px] font-black text-primary/40 italic tracking-widest leading-none">A18-49 RTG</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-10 space-y-12">
        {/* Key metrics row */}
        <div className="grid grid-cols-4 gap-8">
          <MetricBox label="HH RATING" value={profile.seasonAvgHH.toFixed(1)} />
          <MetricBox label="AVG VIEWERS" value={`${profile.seasonAvgViewers.toFixed(1)}M`} />
          <MetricBox label="RETENTION" value={`${profile.audienceRetention}%`} color={profile.audienceRetention >= 80 ? 'text-emerald-400' : profile.audienceRetention >= 60 ? 'text-amber-400' : 'text-red-500'} />
          <MetricBox label="DVR LIFT" value={`+${profile.dvrLift}%`} color="text-emerald-400" />
        </div>

        {/* Viewership trend chart */}
        <div className="h-64 w-full bg-black/40 border border-white/5 p-8 shadow-inner relative overflow-hidden">
          <div className="absolute top-4 right-8 flex items-center gap-6 z-10">
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary" />
                <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40 italic">LIVE+SD</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 border border-primary/40 bg-primary/10" />
                <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40 italic">LIVE+7</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-amber-500" />
                <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40 italic">A18-49</span>
             </div>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
              <XAxis dataKey="ep" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.2)', fontWeight: 900 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.2)', fontWeight: 900 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: 'rgba(0,0,0,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 0, fontSize: 10, fontWeight: 900 }}
              />
              <Area type="monotone" dataKey="live7" name="L+7 VIEWERS (M)" fill="rgba(var(--primary), 0.05)" stroke="rgba(var(--primary), 0.3)" strokeDasharray="4 4" />
              <Area type="monotone" dataKey="viewers" name="LIVE+SD (M)" fill="rgba(var(--primary), 0.1)" stroke="rgba(var(--primary), 1)" strokeWidth={2} />
              <Area type="monotone" dataKey="demo" name="A18-49 RTG" fill="rgba(245, 158, 11, 0.05)" stroke="#f59e0b" strokeWidth={2} />
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
      name: d.label.toUpperCase(),
      rating: d.rating,
      viewers: d.viewers,
      demo: d.demo
    }));

  return (
    <Card className="glass-card border border-white/5 rounded-none overflow-hidden bg-white/[0.01] shadow-2xl">
      <CardHeader className="p-8 border-b border-white/5 bg-white/[0.02]">
        <CardTitle className="text-xs font-black tracking-[0.2em] uppercase italic leading-none mb-2">{show.title} — DEMOGRAPHICS</CardTitle>
        <p className="text-[9px] font-black text-muted-foreground/20 uppercase tracking-[0.3em] italic">
          EPISODE {latest.episodeNumber} AUDIENCE COMPOSITION
        </p>
      </CardHeader>
      <CardContent className="p-8">
        <div className="h-64 w-full bg-black/40 border border-white/5 p-6 shadow-inner">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={demoData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.2)', fontWeight: 900 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 8, fill: 'rgba(255,255,255,0.4)', fontWeight: 900 }} width={100} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: 'rgba(0,0,0,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 0, fontSize: 10, fontWeight: 900 }}
                formatter={(value: number) => [`${value.toFixed(2)}`, 'RTG']}
              />
              <Bar dataKey="rating" name="RTG" radius={0}>
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
  <div className="bg-white/[0.02] rounded-none p-6 border border-white/5 text-center shadow-xl group hover:border-white/10 transition-all duration-700">
    <div className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] mb-2 italic leading-none">{label}</div>
    <div className={cn("text-2xl font-display font-black italic tracking-tighter leading-none", color || "text-foreground")}>{value}</div>
  </div>
);
