import { useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Award, Target, TrendingUp, ChevronRight, Zap, Trophy, ShieldCheck } from 'lucide-react';
import { selectReleasedProjects } from '@/store/selectors';

export const StrategyPanel: React.FC = () => {
  const gameState = useGameStore(s => s.gameState);

  const prestige = gameState?.studio?.prestige ?? 0;
  const prestigeGoal = prestige >= 80 ? 100 : 80;
  const prestigeLabel = (prestige >= 80 ? 'BUILD_PRESTIGE_TO_100' : 'BUILD_PRESTIGE_TO_80+').toUpperCase();

  const currentYear = Math.floor((gameState?.week ?? 0) / 52);
  const releasedThisYear = useMemo(() => {
    return selectReleasedProjects(gameState).filter(p =>
      p.releaseWeek !== null && Math.floor((p.releaseWeek ?? 0) / 52) === currentYear
    ).length;
  }, [gameState, currentYear]);
  const releaseGoal = 3;

  const tier = (prestige >= 90 ? 'TIER_1_STUDIO' : prestige >= 70 ? 'TIER_2_STUDIO' : prestige >= 50 ? 'TIER_3_STUDIO' : 'EMERGING_STUDIO').toUpperCase();
  const tierDesc = (prestige >= 90 ? 'INDUSTRY LEADER' : prestige >= 70 ? 'RISING COMPETITOR' : prestige >= 50 ? 'BUILDING REPUTATION' : 'ESTABLISHING FOOTHOLD').toUpperCase();

  return (
    <div className="h-full overflow-y-auto custom-scrollbar space-y-10 pb-20 pr-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white/[0.01] border border-white/5 p-8 rounded-none backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Target className="h-16 w-16 text-primary" strokeWidth={1} />
          </div>
          <div className="flex items-center gap-4 mb-6">
            <Target className="h-4 w-4 text-primary" strokeWidth={3} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30 italic">CURRENT_OBJECTIVE</span>
          </div>
          <p className="font-display font-black text-lg tracking-tight italic text-foreground mb-2 leading-none">{prestigeLabel}</p>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 italic">
            PROGRESS: {prestige} / {prestigeGoal} UNITS
          </p>
          <div className="mt-6 h-1 bg-white/5 rounded-none overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-1000"
              style={{ width: `${Math.min(100, Math.round((prestige / prestigeGoal) * 100))}%` }}
            />
          </div>
        </div>

        <div className="bg-white/[0.01] border border-white/5 p-8 rounded-none backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Award className="h-16 w-16 text-secondary" strokeWidth={1} />
          </div>
          <div className="flex items-center gap-4 mb-6">
            <Award className="h-4 w-4 text-secondary" strokeWidth={3} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30 italic">OPERATIONAL_MILESTONE</span>
          </div>
          <p className="font-display font-black text-lg tracking-tight italic text-foreground mb-2 leading-none uppercase">RELEASE {releaseGoal} SLATES_FY</p>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 italic">
            COMPLETED: {releasedThisYear} / {releaseGoal} UNITS
          </p>
          <div className="mt-6 h-1 bg-white/5 rounded-none overflow-hidden">
            <div
              className="h-full bg-secondary transition-all duration-1000"
              style={{ width: `${Math.min(100, Math.round((releasedThisYear / releaseGoal) * 100))}%` }}
            />
          </div>
        </div>

        <div className="bg-white/[0.01] border border-white/5 p-8 rounded-none backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <TrendingUp className="h-16 w-16 text-amber-500" strokeWidth={1} />
          </div>
          <div className="flex items-center gap-4 mb-6">
            <TrendingUp className="h-4 w-4 text-amber-500" strokeWidth={3} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30 italic">MARKET_POSITION</span>
          </div>
          <p className="font-display font-black text-lg tracking-tight italic text-foreground mb-2 leading-none">{tier}</p>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 italic leading-none">{tierDesc}</p>
        </div>
      </div>

      <div className="bg-white/[0.02] border border-white/5 p-10 rounded-none backdrop-blur-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-[0.02]">
          <ShieldCheck className="h-48 w-48 text-primary" strokeWidth={1} />
        </div>
        <h4 className="text-sm font-black uppercase italic tracking-[0.4em] text-primary/60 mb-10 flex items-center gap-4">
          <Zap className="h-5 w-5" strokeWidth={3} />
          STRATEGIC_INTELLIGENCE_REPORT
        </h4>
        <div className="space-y-6 relative z-10">
          {prestige < 80 && (
            <div className="flex items-start gap-8 p-8 bg-primary/[0.03] border border-primary/10 rounded-none group hover:bg-primary/[0.05] transition-all duration-700">
              <div className="w-12 h-12 rounded-none bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 group-hover:border-primary/40 transition-colors">
                <Trophy className="h-6 w-6 text-primary" strokeWidth={2} />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-display font-black uppercase italic tracking-tight text-foreground leading-none">PRIORITIZE_PRESTIGE_ASSETS</p>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 italic leading-relaxed max-w-2xl">
                  CURRENT PRESTIGE: {prestige}. INITIALIZE 2-3 HIGH-FIDELITY DRAMATIC PROJECTS TO SECURE TIER-2 STATUS.
                </p>
              </div>
            </div>
          )}

          {releasedThisYear < releaseGoal && (
            <div className="flex items-start gap-8 p-8 bg-secondary/[0.03] border border-secondary/10 rounded-none group hover:bg-secondary/[0.05] transition-all duration-700">
              <div className="w-12 h-12 rounded-none bg-secondary/10 border border-secondary/20 flex items-center justify-center flex-shrink-0 group-hover:border-secondary/40 transition-colors">
                <Zap className="h-6 w-6 text-secondary" strokeWidth={2} />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-display font-black uppercase italic tracking-tight text-foreground leading-none">ACCELERATE_PRODUCTION_CYCLES</p>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 italic leading-relaxed max-w-2xl">
                  {releaseGoal - releasedThisYear} ADDITIONAL UNITS REQUIRED FOR ANNUAL QUOTA. AUDIT PRODUCTION PIPELINE IMMEDIATELY.
                </p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-8 p-8 bg-white/[0.01] border border-white/5 rounded-none group hover:bg-white/[0.03] transition-all duration-700">
            <div className="w-12 h-12 rounded-none bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:border-white/20 transition-colors">
              <ChevronRight className="h-6 w-6 text-muted-foreground" strokeWidth={2} />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-display font-black uppercase italic tracking-tight text-foreground leading-none">ACQUIRE_A_LIST_ASSETS</p>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 italic leading-relaxed max-w-2xl">
                TALENT WITH 80+ PRECISION RATING CRITICAL FOR BLOCKBUSTER VELOCITY. MONITOR MARKETPLACE FOR CONTRACT OPPORTUNITIES.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
