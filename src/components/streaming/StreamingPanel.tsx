import React, { useMemo, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Buyer, StreamerPlatform, NetworkPlatform, PremiumPlatform, Project } from '@/engine/types';
import { formatMoney } from '@/engine/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend
} from 'recharts';
import { 
  Tv, 
  Users, 
  AlertTriangle, 
  Building2, 
  ArrowRightLeft,
  Crown,
  Wifi,
  Radio,
  Handshake,
  Film,
  CheckCircle2,
  XCircle,
  DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { calculateFitScore } from '@/engine/systems/buyers';

function formatSubscribers(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

const ARCHETYPE_CONFIG = {
  streamer: { icon: Wifi, label: 'Streamer', color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
  network: { icon: Radio, label: 'Network', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  premium: { icon: Crown, label: 'Premium', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
} as const;

const PIE_COLORS = [
  'hsl(262, 80%, 60%)', // violet
  'hsl(220, 80%, 60%)', // blue
  'hsl(45, 90%, 55%)',  // amber
  'hsl(160, 70%, 50%)', // emerald
  'hsl(340, 75%, 55%)', // rose
  'hsl(30, 80%, 55%)',  // orange
  'hsl(190, 75%, 50%)', // cyan
  'hsl(280, 65%, 55%)', // purple
  'hsl(100, 60%, 50%)', // lime
  'hsl(0, 70%, 55%)',   // red
];

// ── Deal Negotiation Modal ──────────────────────────────────────────────────

const DealModal: React.FC<{
  buyer: Buyer;
  open: boolean;
  onClose: () => void;
}> = ({ buyer, open, onClose }) => {
  const gameState = useGameStore(s => s.gameState);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [dealResult, setDealResult] = useState<{ success: boolean; message: string } | null>(null);

  const eligibleProjects = useMemo(() => {
    if (!gameState) return [];
    return Object.values(gameState.studio.internal.projects).filter(
      (p: Project) => p.state === 'development' || p.state === 'production' || p.state === 'needs_greenlight'
    );
  }, [gameState]);

  const allProjects = useMemo(() => {
    if (!gameState) return [];
    return Object.values(gameState.studio.internal.projects);
  }, [gameState]);

  const selectedProjectObj = useMemo(
    () => eligibleProjects.find(p => p.id === selectedProject),
    [eligibleProjects, selectedProject]
  );

  const fitScore = useMemo(() => {
    if (!selectedProjectObj) return 0;
    return calculateFitScore(selectedProjectObj, buyer, gameState?.week ?? 1, allProjects);
  }, [selectedProjectObj, buyer, gameState?.week, allProjects]);

  const handlePitch = () => {
    if (!selectedProjectObj) return;
    const success = fitScore >= 50;
    if (success) {
      setDealResult({
        success: true,
        message: `${buyer.name} is interested in "${selectedProjectObj.title}"! Fit score: ${Math.round(fitScore)}. They'll be added to your distribution pipeline.`,
      });
    } else {
      setDealResult({
        success: false,
        message: `${buyer.name} passed on "${selectedProjectObj.title}". Fit score too low (${Math.round(fitScore)}). ${buyer.currentMandate ? `They're currently looking for ${buyer.currentMandate.type.replace('_', ' ')} content.` : 'Try again with a different project.'}`,
      });
    }
  };

  const handleClose = () => {
    setSelectedProject(null);
    setDealResult(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg bg-card border-border shadow-2xl">
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border", ARCHETYPE_CONFIG[buyer.archetype].bg, ARCHETYPE_CONFIG[buyer.archetype].border)}>
              <Handshake className={cn("w-5 h-5", ARCHETYPE_CONFIG[buyer.archetype].color)} />
            </div>
            <div>
              <h3 className="font-display font-black text-lg tracking-tight text-foreground">Pitch to {buyer.name}</h3>
              <p className="text-xs text-muted-foreground">
                {buyer.currentMandate ? `Current mandate: ${buyer.currentMandate.type.replace('_', ' ')}` : 'Open mandate'}
              </p>
            </div>
          </div>

          {dealResult ? (
            <div className={cn(
              "p-5 rounded-xl border",
              dealResult.success ? "bg-success/10 border-success/30" : "bg-destructive/10 border-destructive/30"
            )}>
              <div className="flex items-start gap-3">
                {dealResult.success ? (
                  <CheckCircle2 className="w-6 h-6 text-success shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-6 h-6 text-destructive shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className={cn("font-bold text-sm mb-1", dealResult.success ? "text-success" : "text-destructive")}>
                    {dealResult.success ? 'Deal Interest!' : 'Passed'}
                  </h4>
                  <p className="text-sm text-muted-foreground">{dealResult.message}</p>
                </div>
              </div>
              <Button onClick={handleClose} className="w-full mt-4" variant="outline" size="sm">Close</Button>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Select a project to pitch</p>
                {eligibleProjects.length === 0 ? (
                  <div className="p-6 text-center border border-dashed border-border/40 rounded-xl">
                    <Film className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">No active projects to pitch.</p>
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-60 overflow-y-auto">
                    {eligibleProjects.map(project => (
                      <button
                        key={project.id}
                        onClick={() => setSelectedProject(project.id)}
                        className={cn(
                          "w-full text-left p-3 rounded-xl border transition-all duration-200",
                          selectedProject === project.id
                            ? "border-primary/50 bg-primary/10"
                            : "border-border/30 bg-muted/10 hover:border-border/60"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-sm text-foreground">{project.title}</p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                              {project.genre} • {project.format} • {project.budgetTier}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-[9px] uppercase font-bold">{project.state}</Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {selectedProjectObj && (
                <div className="p-4 rounded-xl bg-muted/20 border border-border/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Fit Score</span>
                    <span className={cn(
                      "font-black text-lg",
                      fitScore >= 70 ? 'text-success' : fitScore >= 50 ? 'text-primary' : 'text-destructive'
                    )}>{Math.round(fitScore)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        fitScore >= 70 ? 'bg-success' : fitScore >= 50 ? 'bg-primary' : 'bg-destructive'
                      )}
                      style={{ width: `${fitScore}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    {fitScore >= 70 ? 'Strong interest likely.' : fitScore >= 50 ? 'Moderate interest — worth a shot.' : 'Low interest — consider their current mandate.'}
                  </p>
                </div>
              )}

              <Button
                onClick={handlePitch}
                disabled={!selectedProject}
                className="w-full font-bold"
              >
                <Handshake className="w-4 h-4 mr-2" />
                Pitch Project
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ── Buyer Card ──────────────────────────────────────────────────────────────

const BuyerCard: React.FC<{ buyer: Buyer; allBuyers: Buyer[]; onDeal: (buyer: Buyer) => void }> = ({ buyer, allBuyers, onDeal }) => {
  const config = ARCHETYPE_CONFIG[buyer.archetype];
  const Icon = config.icon;
  const isAcquired = !!buyer.acquiredBy;
  const acquirer = isAcquired ? allBuyers.find(b => b.id === buyer.acquiredBy) : null;
  const ownedPlatforms = (buyer.ownedPlatforms || []).map(id => allBuyers.find(b => b.id === id)).filter(Boolean);
  const strength = buyer.strength ?? 60;
  const cash = buyer.cash ?? 50_000_000;

  return (
    <div className={cn(
      "p-5 rounded-2xl border backdrop-blur-md transition-all duration-300 space-y-4 group relative overflow-hidden",
      isAcquired 
        ? "border-muted/30 bg-muted/10 opacity-60" 
        : buyer.isAcquirable 
          ? "border-destructive/30 bg-destructive/5" 
          : strength > 75 
            ? "border-primary/30 bg-card/80 shadow-[0_0_20px_rgba(var(--primary),0.08)]" 
            : "border-border/40 bg-card/60",
      "hover:shadow-lg hover:-translate-y-0.5"
    )}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Header */}
      <div className="flex items-start justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border", config.bg, config.border)}>
            <Icon className={cn("w-5 h-5", config.color)} />
          </div>
          <div>
            <h3 className="font-display font-black text-[15px] tracking-tight text-foreground leading-tight group-hover:text-primary transition-colors">
              {buyer.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Badge variant="outline" className={cn("text-[8px] font-black tracking-widest uppercase px-1.5 py-0 h-4", config.border, config.color)}>
                {config.label}
              </Badge>
              {isAcquired && acquirer && (
                <Badge variant="outline" className="text-[8px] font-black tracking-widest uppercase px-1.5 py-0 h-4 border-muted-foreground/30 text-muted-foreground">
                  Owned by {acquirer.name}
                </Badge>
              )}
              {buyer.isAcquirable && !isAcquired && (
                <Badge variant="destructive" className="text-[8px] font-black tracking-widest uppercase px-1.5 py-0 h-4 bg-destructive/20 text-destructive border-destructive/30">
                  <AlertTriangle className="w-2.5 h-2.5 mr-0.5" /> Vulnerable
                </Badge>
              )}
            </div>
          </div>
        </div>

        {buyer.currentMandate && (
          <Badge variant="secondary" className="text-[9px] font-bold uppercase tracking-widest bg-secondary/20 text-secondary-foreground/80 border border-secondary/20 shrink-0">
            {buyer.currentMandate.type.replace('_', ' ')}
          </Badge>
        )}
      </div>

      {/* Stats */}
      <div className={cn(
        "grid gap-3 text-xs pt-3 border-t border-border/30 relative z-10",
        buyer.archetype === 'streamer' ? 'grid-cols-4' : 'grid-cols-3'
      )}>
        {buyer.archetype === 'streamer' && (
          <div className="space-y-0.5">
            <div className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground">Subscribers</div>
            <div className="font-black text-foreground flex items-center gap-1">
              <Users className="w-3 h-3 text-violet-400" />
              {formatSubscribers((buyer as StreamerPlatform).subscribers)}
            </div>
          </div>
        )}
        {buyer.archetype === 'network' && (
          <div className="space-y-0.5">
            <div className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground">Reach</div>
            <div className="font-black text-foreground">{(buyer as NetworkPlatform).reach}</div>
          </div>
        )}
        {buyer.archetype === 'premium' && (
          <div className="space-y-0.5">
            <div className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground">Prestige Bonus</div>
            <div className="font-black text-foreground">+{(buyer as PremiumPlatform).prestigeBonus}</div>
          </div>
        )}
        <div className="space-y-0.5">
          <div className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground">Strength</div>
          <div className={cn("font-bold", strength > 70 ? 'text-success' : strength > 40 ? 'text-foreground' : 'text-destructive')}>
            {strength}
          </div>
        </div>
        <div className="space-y-0.5">
          <div className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground">Treasury</div>
          <div className={cn("font-bold", cash > 30_000_000 ? 'text-success' : 'text-destructive')}>
            {formatMoney(cash)}
          </div>
        </div>
      </div>

      {/* Strength Bar */}
      <div className="relative z-10">
        <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden">
          <div 
            className={cn(
              "h-full rounded-full transition-all duration-700",
              strength > 70 ? 'bg-success' : strength > 40 ? 'bg-primary' : 'bg-destructive'
            )} 
            style={{ width: `${strength}%` }} 
          />
        </div>
      </div>

      {/* Owned Platforms */}
      {ownedPlatforms.length > 0 && (
        <div className="relative z-10 pt-2 border-t border-border/20">
          <div className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
            <Building2 className="w-3 h-3" /> Subsidiaries
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ownedPlatforms.map(p => p && (
              <Badge key={p.id} variant="outline" className="text-[9px] font-bold bg-muted/10 border-muted/20 text-muted-foreground">
                {p.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Pitch Button */}
      {!isAcquired && (
        <div className="relative z-10 pt-1">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-[10px] uppercase font-bold tracking-widest border-primary/20 hover:bg-primary/10 hover:border-primary/40 transition-all"
            onClick={(e) => { e.stopPropagation(); onDeal(buyer); }}
          >
            <Handshake className="w-3.5 h-3.5 mr-1.5" />
            Pitch Content
          </Button>
        </div>
      )}
    </div>
  );
};

// ── Market Share Pie Chart ──────────────────────────────────────────────────

const MarketShareChart: React.FC<{ buyers: Buyer[] }> = ({ buyers }) => {
  const chartData = useMemo(() => {
    const active = buyers.filter(b => !b.acquiredBy);
    return active
      .filter(b => b.archetype === 'streamer')
      .map(b => ({
        name: b.name,
        value: (b as StreamerPlatform).subscribers,
      }))
      .sort((a, b) => b.value - a.value);
  }, [buyers]);

  if (chartData.length === 0) return null;

  return (
    <div className="glass-panel p-5 rounded-2xl border border-border/30 space-y-3">
      <h3 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
        <Users className="w-4 h-4 text-primary" /> Subscriber Market Share
      </h3>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
            <RechartsTooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: 700,
              }}
              formatter={(value: number) => [formatSubscribers(value), 'Subscribers']}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// ── Main Panel ──────────────────────────────────────────────────────────────

export const StreamingPanel: React.FC = () => {
  const gameState = useGameStore(s => s.gameState);
  const buyers = useMemo(() => gameState?.market.buyers || [], [gameState?.market.buyers]);
  const [dealBuyer, setDealBuyer] = useState<Buyer | null>(null);

  const stats = useMemo(() => {
    const active = buyers.filter(b => !b.acquiredBy);
    const streamers = active.filter(b => b.archetype === 'streamer') as StreamerPlatform[];
    const totalSubs = streamers.reduce((sum, s) => sum + s.subscribers, 0);
    const mergers = buyers.filter(b => !!b.acquiredBy).length;
    const vulnerable = active.filter(b => b.isAcquirable).length;
    return { activeCount: active.length, totalSubs, mergers, vulnerable };
  }, [buyers]);

  const activeBuyers = useMemo(() => buyers.filter(b => !b.acquiredBy).sort((a, b) => (b.strength ?? 60) - (a.strength ?? 60)), [buyers]);
  const acquiredBuyers = useMemo(() => buyers.filter(b => !!b.acquiredBy), [buyers]);

  if (!gameState) return null;

  return (
    <div className="flex flex-col h-full space-y-6 p-1">
      {/* Header */}
      <div className="flex flex-col space-y-1">
        <div className="flex items-center gap-2">
          <Tv className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-black tracking-tighter uppercase italic">Streaming &amp; Distribution</h1>
        </div>
        <p className="text-muted-foreground text-sm font-medium">
          Track streaming platforms, networks, and media conglomerates. Pitch content deals directly.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Active Platforms', value: stats.activeCount, icon: Tv, accent: 'text-primary' },
          { label: 'Total Subscribers', value: formatSubscribers(stats.totalSubs), icon: Users, accent: 'text-violet-400' },
          { label: 'Mergers', value: stats.mergers, icon: ArrowRightLeft, accent: 'text-amber-400' },
          { label: 'Vulnerable', value: stats.vulnerable, icon: AlertTriangle, accent: stats.vulnerable > 0 ? 'text-destructive' : 'text-muted-foreground' },
        ].map(stat => (
          <div key={stat.label} className="glass-panel p-4 rounded-2xl flex items-center gap-3 border border-border/30">
            <stat.icon className={cn("w-5 h-5", stat.accent)} />
            <div>
              <div className="text-lg font-black text-foreground leading-none">{stat.value}</div>
              <div className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground mt-0.5">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Content area */}
      <ScrollArea className="flex-1">
        <div className="space-y-6 pb-8">
          {/* Pie Chart */}
          <MarketShareChart buyers={buyers} />

          {/* Active Platforms */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {activeBuyers.map(buyer => (
              <BuyerCard key={buyer.id} buyer={buyer} allBuyers={buyers} onDeal={setDealBuyer} />
            ))}
          </div>

          {/* Acquired */}
          {acquiredBuyers.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Building2 className="w-4 h-4" /> Acquired Platforms
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {acquiredBuyers.map(buyer => (
                  <BuyerCard key={buyer.id} buyer={buyer} allBuyers={buyers} onDeal={setDealBuyer} />
                ))}
              </div>
            </div>
          )}

          {buyers.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Tv className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-lg font-medium">No platforms in the market yet.</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Deal Modal */}
      {dealBuyer && (
        <DealModal buyer={dealBuyer} open={!!dealBuyer} onClose={() => setDealBuyer(null)} />
      )}
    </div>
  );
};
