import React, { useState } from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart3, CheckCircle2, Megaphone, TrendingUp, ChevronDown } from 'lucide-react';
import { Project } from '@/engine/types';
import { MarketingAngle } from '@/engine/types/project.types';
import { formatMoney } from '@/engine/utils';
import { cn } from '@/lib/utils';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

// Extended type that includes the 6 new angles planned in game design
// (project.types.ts is not modified — these are cast as string where the base type is used)
type ExtendedMarketingAngle =
  | MarketingAngle
  | 'SELL_THE_SCARES'
  | 'SELL_THE_ROMANCE'
  | 'SELL_THE_WORLD_MYTHOLOGY'
  | 'SELL_THE_TRUE_STORY_HOOK'
  | 'SELL_THE_MUSIC'
  | 'BROAD_FOUR_QUADRANT_MARKETING';

interface AngleOption {
  id: ExtendedMarketingAngle;
  label: string;
  desc: string;
}

const ALL_ANGLES: AngleOption[] = [
  { id: 'SELL_THE_SPECTACLE',       label: 'The Spectacle',    desc: 'Big visual set-pieces and VFX drive anticipation.' },
  { id: 'SELL_THE_STORY',           label: 'The Story',        desc: 'Emotionally led trailers focused on narrative.' },
  { id: 'SELL_THE_STARS',           label: 'Star Power',       desc: 'Leverage A-list talent for press and promo.' },
  { id: 'FAMILY_ADVENTURE',         label: 'Family Adventure', desc: 'Broad family positioning for all-quadrant reach.' },
  { id: 'AWARDS_PUSH',              label: 'Awards Push',      desc: 'Prestige campaign targeting guilds and critics.' },
  { id: 'GRASSROOTS',               label: 'Grassroots',       desc: 'Word-of-mouth and community fan activation.' },
  { id: 'GLOBAL_BLITZ',             label: 'Global Blitz',     desc: 'Simultaneous worldwide saturation launch.' },
  { id: 'CONTROVERSY',              label: 'Controversy',      desc: 'Provocative marketing that drives conversation.' },
  // New angles
  { id: 'SELL_THE_SCARES',          label: 'Fear Factor',      desc: 'Horror-first marketing. Boosts opening weekend for horror/thriller projects.' },
  { id: 'SELL_THE_ROMANCE',         label: 'Heart & Soul',     desc: 'Romance-focused push. Strengthens female demographic engagement.' },
  { id: 'SELL_THE_WORLD_MYTHOLOGY', label: 'World Building',   desc: 'Franchise/lore deep-dive. Boosts superfan retention for IP projects.' },
  { id: 'SELL_THE_TRUE_STORY_HOOK', label: 'True Story',       desc: 'Based-on-true-events hook. Broadens mainstream and prestige crossover.' },
  { id: 'SELL_THE_MUSIC',           label: 'Soundtrack-Led',   desc: 'Soundtrack-first marketing. Boosts streaming revenue and youth audiences.' },
  { id: 'BROAD_FOUR_QUADRANT_MARKETING', label: 'Four Quadrant', desc: 'Widest possible appeal. Reduces upside but guarantees a solid floor.' },
];

interface ProjectionPoint { week: string; revenue: number; }

interface ProjectMarketingTabProps {
  project: Project;
  selectedTier: 'none' | 'basic' | 'blockbuster';
  onSelectTier: (tier: 'none' | 'basic' | 'blockbuster') => void;
  projectionData: ProjectionPoint[];
  cash: number;
  onLockCampaign: () => void;
  selectedPrimaryAngle?: ExtendedMarketingAngle | null;
  onSelectPrimaryAngle?: (angle: ExtendedMarketingAngle | null) => void;
  selectedSecondaryAngle?: ExtendedMarketingAngle | null;
  onSelectSecondaryAngle?: (angle: ExtendedMarketingAngle | null) => void;
}

export const ProjectMarketingTab: React.FC<ProjectMarketingTabProps> = ({
  project,
  selectedTier,
  onSelectTier,
  projectionData,
  cash,
  onLockCampaign,
  selectedPrimaryAngle,
  onSelectPrimaryAngle,
  selectedSecondaryAngle,
  onSelectSecondaryAngle,
}) => {
  // Internal angle state if parent does not control it
  const [internalPrimary, setInternalPrimary] = useState<ExtendedMarketingAngle | null>(null);
  const [internalSecondary, setInternalSecondary] = useState<ExtendedMarketingAngle | null>(null);
  const [showPrimaryPicker, setShowPrimaryPicker] = useState(false);
  const [showSecondaryPicker, setShowSecondaryPicker] = useState(false);

  const activePrimary   = selectedPrimaryAngle   !== undefined ? selectedPrimaryAngle   : internalPrimary;
  const activeSecondary = selectedSecondaryAngle  !== undefined ? selectedSecondaryAngle  : internalSecondary;

  const handlePickPrimary = (angle: ExtendedMarketingAngle) => {
    if (onSelectPrimaryAngle) onSelectPrimaryAngle(angle);
    else setInternalPrimary(angle);
    // Clear secondary if it matches the newly chosen primary
    if (activeSecondary === angle) {
      if (onSelectSecondaryAngle) onSelectSecondaryAngle(null);
      else setInternalSecondary(null);
    }
    setShowPrimaryPicker(false);
  };

  const handlePickSecondary = (angle: ExtendedMarketingAngle | null) => {
    if (onSelectSecondaryAngle) onSelectSecondaryAngle(angle);
    else setInternalSecondary(angle);
    setShowSecondaryPicker(false);
  };

  const primaryOption   = ALL_ANGLES.find(a => a.id === activePrimary);
  const secondaryOption = ALL_ANGLES.find(a => a.id === activeSecondary);

  // Angles available for secondary: exclude the primary selection
  const secondaryOptions = ALL_ANGLES.filter(a => a.id !== activePrimary);

  const isLocked = !!project.marketingLevel;

  return (
    <TabsContent value="marketing" className="mt-0 space-y-8">
      {/* ── Spend tier cards ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { id: 'none',        name: 'Word of Mouth',  cost: 0,                    buzz: 0,  desc: 'Rely on natural cultural momentum.' },
          { id: 'basic',       name: 'Targeted Digital', cost: project.budget * 0.1, buzz: 15, desc: 'Coordinated social campaign.' },
          { id: 'blockbuster', name: 'Global Blitz',   cost: project.budget * 0.5, buzz: 40, desc: 'Omnichannel market saturation.' }
        ].map(tier => (
          <button
            aria-pressed={project.marketingLevel === tier.id || selectedTier === tier.id}
            key={tier.id}
            disabled={isLocked || cash < tier.cost}
            onClick={() => onSelectTier(tier.id as 'none' | 'basic' | 'blockbuster')}
            className={cn(
              "p-6 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between group h-52",
              project.marketingLevel === tier.id || selectedTier === tier.id
                ? 'border-primary bg-primary/10 shadow-[0_0_30px_rgba(var(--primary),0.1)]'
                : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
            )}
          >
            {selectedTier === tier.id && (
              <div className="absolute top-0 right-0 w-8 h-8 bg-primary rounded-bl-2xl flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-black" />
              </div>
            )}
            <div>
              <p className="text-[10px] font-black uppercase text-primary tracking-widest mb-1">{tier.name}</p>
              <p className="text-2xl font-black text-white mb-2 tabular-nums">{formatMoney(tier.cost)}</p>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">{tier.desc}</p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black text-emerald-400 uppercase tracking-widest">
              <TrendingUp className="w-4 h-4" /> +{tier.buzz} Project Momentum
            </div>
          </button>
        ))}
      </div>

      {/* ── Marketing Angle Selectors ──────────────────────────────────── */}
      <div className="space-y-4">
        {/* Primary angle */}
        <div>
          <p className="text-[10px] font-black uppercase text-primary tracking-widest mb-2">Primary Marketing Angle</p>
          <div className="relative">
            <button
              disabled={isLocked}
              onClick={() => { setShowPrimaryPicker(v => !v); setShowSecondaryPicker(false); }}
              className={cn(
                "w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all",
                isLocked
                  ? "opacity-60 cursor-not-allowed border-slate-800 bg-slate-900/30"
                  : "border-slate-700 bg-slate-900/50 hover:border-primary/50"
              )}
            >
              <div>
                {primaryOption ? (
                  <>
                    <span className="text-sm font-black text-white">{primaryOption.label}</span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{primaryOption.desc}</p>
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground">Select a primary angle…</span>
                )}
              </div>
              <ChevronDown className={cn("w-4 h-4 text-muted-foreground shrink-0 transition-transform", showPrimaryPicker && "rotate-180")} />
            </button>

            {showPrimaryPicker && !isLocked && (
              <div className="absolute z-20 w-full mt-1 border border-slate-700 bg-slate-950 rounded-xl overflow-hidden shadow-2xl max-h-72 overflow-y-auto">
                {ALL_ANGLES.map(angle => (
                  <button
                    key={angle.id}
                    onClick={() => handlePickPrimary(angle.id)}
                    className={cn(
                      "w-full flex flex-col items-start px-4 py-3 text-left transition-colors hover:bg-slate-800/60",
                      activePrimary === angle.id && "bg-primary/10 border-l-2 border-l-primary"
                    )}
                  >
                    <span className="text-xs font-black text-white">{angle.label}</span>
                    <span className="text-[11px] text-muted-foreground">{angle.desc}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Secondary angle */}
        <div>
          <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-2">
            Secondary Push <span className="normal-case font-medium">(Optional — contributes 30% of angle bonus)</span>
          </p>
          <div className="relative">
            <button
              disabled={isLocked || !activePrimary}
              onClick={() => { setShowSecondaryPicker(v => !v); setShowPrimaryPicker(false); }}
              className={cn(
                "w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all",
                isLocked || !activePrimary
                  ? "opacity-50 cursor-not-allowed border-slate-800 bg-slate-900/20"
                  : "border-slate-800 bg-slate-900/30 hover:border-slate-600"
              )}
            >
              <div>
                {secondaryOption ? (
                  <>
                    <span className="text-sm font-bold text-white/80">{secondaryOption.label}</span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{secondaryOption.desc}</p>
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground">No secondary angle selected</span>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {activeSecondary && !isLocked && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handlePickSecondary(null); }}
                    className="text-[10px] text-muted-foreground hover:text-destructive transition-colors font-bold uppercase tracking-wider"
                  >
                    Clear
                  </button>
                )}
                <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", showSecondaryPicker && "rotate-180")} />
              </div>
            </button>

            {showSecondaryPicker && !isLocked && activePrimary && (
              <div className="absolute z-20 w-full mt-1 border border-slate-700 bg-slate-950 rounded-xl overflow-hidden shadow-2xl max-h-72 overflow-y-auto">
                {secondaryOptions.map(angle => (
                  <button
                    key={angle.id}
                    onClick={() => handlePickSecondary(angle.id)}
                    className={cn(
                      "w-full flex flex-col items-start px-4 py-3 text-left transition-colors hover:bg-slate-800/60",
                      activeSecondary === angle.id && "bg-primary/10 border-l-2 border-l-primary"
                    )}
                  >
                    <span className="text-xs font-black text-white">{angle.label}</span>
                    <span className="text-[11px] text-muted-foreground">{angle.desc}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Revenue projection chart ───────────────────────────────────── */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-white/5 bg-white/3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Yield Simulation (8-Week Lifecycle)</p>
          </div>
          <Badge variant="outline" className="text-[9px] font-bold text-muted-foreground border-white/5">Algorithm V3.1</Badge>
        </div>
        <div className="h-[240px] w-full p-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={projectionData}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="week" hide />
              <YAxis hide />
              <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }} />
              <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} animationDuration={2000} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Lock / locked status ───────────────────────────────────────── */}
      {!isLocked ? (
        <Button
          className="w-full h-16 bg-primary text-black hover:bg-primary/90 font-black text-sm uppercase tracking-[0.3em] rounded-xl shadow-2xl transition-all active:scale-[0.98]"
          disabled={!selectedTier || cash < (selectedTier === 'basic' ? project.budget * 0.1 : selectedTier === 'blockbuster' ? project.budget * 0.5 : 0)}
          onClick={onLockCampaign}
        >
          Authorize Global Release & Dedicate Reserves
        </Button>
      ) : (
        <div className="p-6 bg-slate-900/80 border border-slate-700 rounded-xl flex flex-col items-center justify-center gap-2">
          <div className="flex items-center gap-3">
            <Megaphone className="h-6 w-6 text-primary animate-pulse" />
            <span className="text-base font-black uppercase text-white tracking-widest">Deployment: {project.marketingLevel} Initiative</span>
          </div>
          {project.marketingCampaign && (
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest opacity-70">
              Angle: {ALL_ANGLES.find(a => a.id === (project.marketingCampaign!.primaryAngle as string))?.label ?? project.marketingCampaign.primaryAngle}
              {(project.marketingCampaign as any).secondaryAngle && (
                <> + {ALL_ANGLES.find(a => a.id === (project.marketingCampaign as any).secondaryAngle)?.label ?? (project.marketingCampaign as any).secondaryAngle}</>
              )}
            </p>
          )}
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest opacity-60">Box office data will populate in the week summary</p>
        </div>
      )}
    </TabsContent>
  );
};
