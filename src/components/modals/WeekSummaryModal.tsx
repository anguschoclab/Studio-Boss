import { useUIStore } from '@/store/uiStore';
import { useGameStore } from '@/store/gameStore';
import { formatMoney } from '@/engine/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';
import { Headline } from '@/engine/types';
import { NewsStoryModal } from './NewsStoryModal';
import { cn } from '@/lib/utils';
import { ArrowRight, TrendingUp, DollarSign, Activity, Newspaper } from 'lucide-react';

export const WeekSummaryModal = () => {
  const { activeModal, resolveCurrentModal } = useUIStore();
  const snapshots = useGameStore(s => s.snapshots);
  const [selectedHeadline, setSelectedHeadline] = useState<Headline | null>(null);

  if (!activeModal || activeModal.type !== 'SUMMARY') return null;

  const weekSummary = activeModal.payload;
  const { toWeek, cashBefore, cashAfter, totalRevenue, totalCosts, projectUpdates, newHeadlines, events } = weekSummary;
  const netDelta = cashAfter - cashBefore;

  const isYearEnd = (toWeek - 1) % 52 === 0 && toWeek > 1;
  const currentSnapshot = isYearEnd ? snapshots[snapshots.length - 1] : null;
  const previousSnapshot = isYearEnd && snapshots.length > 1 ? snapshots[snapshots.length - 2] : null;

  const displayCashAfter = isYearEnd && currentSnapshot ? currentSnapshot.funds : cashAfter;
  const displayNetDelta = isYearEnd && currentSnapshot ? (currentSnapshot.funds - (previousSnapshot?.funds || 0)) : netDelta;

  let yearlyDelta = 0;
  if (isYearEnd && currentSnapshot) {
    yearlyDelta = previousSnapshot ? currentSnapshot.funds - previousSnapshot.funds : currentSnapshot.funds - (cashAfter - totalRevenue + totalCosts); 
  }

  return (
    <>
      <Dialog open={true} onOpenChange={() => resolveCurrentModal()}>
        <DialogContent 
          className="max-w-xl bg-black/95 backdrop-blur-3xl border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.9)] p-0 rounded-none overflow-hidden"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-primary/40 to-primary" />
          
          <div className="p-12 space-y-10">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className={cn(
                  "font-display text-4xl font-black tracking-tighter uppercase italic",
                  isYearEnd ? 'text-amber-500 drop-shadow-[0_0_20px_rgba(245,158,11,0.4)]' : 'text-primary drop-shadow-[0_0_20px_rgba(var(--primary),0.4)]'
                )}>
                  {isYearEnd ? 'ANNUAL_FISCAL_REPORT' : `CYCLE_W${toWeek}_REPORT`}
                </DialogTitle>
                <div className="px-4 py-2 bg-white/5 border border-white/10 text-[10px] font-black tracking-[0.4em] uppercase italic text-muted-foreground/40">
                  {isYearEnd ? 'YEAR_COMPLETED' : 'UPLINK_STABLE'}
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-10">
              {/* Yearly Highlight */}
              {isYearEnd && ( yearlyDelta !== 0 ) && (
                <div className="p-8 rounded-none bg-amber-500/5 border border-amber-500/20 shadow-2xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent opacity-50" />
                  <div className="relative z-10 flex justify-between items-end">
                    <div>
                      <p className="text-[11px] text-amber-500/40 uppercase font-black tracking-[0.4em] mb-4 italic">ANNUAL_NET_YIELD</p>
                      <p className={cn(
                        "text-5xl font-display font-black tracking-tighter italic",
                        yearlyDelta >= 0 ? 'text-emerald-500 drop-shadow-[0_0_30px_rgba(16,185,129,0.3)]' : 'text-rose-500 drop-shadow-[0_0_30px_rgba(244,63,94,0.3)]'
                      )}>
                        {yearlyDelta >= 0 ? '+' : ''}{formatMoney(yearlyDelta).toUpperCase()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-amber-500/40 uppercase font-black tracking-[0.4em] mb-4 italic">FISCAL_YEAR</p>
                      <p className="text-5xl font-display font-black text-foreground italic drop-shadow-2xl">{Math.floor((toWeek - 2) / 52) + 1}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Financial Summary */}
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-primary italic">FINANCIAL_SUMMARY</h4>
                  <div className="h-px bg-primary/20 flex-1" />
                </div>
                
                <div className="grid grid-cols-3 gap-6">
                  <div className="p-6 rounded-none border border-white/5 bg-white/[0.02] backdrop-blur-3xl shadow-2xl">
                    <p className="text-[10px] text-muted-foreground/30 font-black uppercase tracking-[0.2em] mb-3 italic">GROSS_REVENUE</p>
                    <p className="text-2xl font-display font-black text-emerald-500 italic tracking-tighter">+{formatMoney(totalRevenue).toUpperCase()}</p>
                  </div>
                  <div className="p-6 rounded-none border border-white/5 bg-white/[0.02] backdrop-blur-3xl shadow-2xl">
                    <p className="text-[10px] text-muted-foreground/30 font-black uppercase tracking-[0.2em] mb-3 italic">OPERATING_COSTS</p>
                    <p className="text-2xl font-display font-black text-rose-500 italic tracking-tighter">-{formatMoney(totalCosts).toUpperCase()}</p>
                  </div>
                  <div className="p-6 rounded-none border border-white/5 bg-white/[0.02] backdrop-blur-3xl shadow-2xl">
                    <p className="text-[10px] text-muted-foreground/30 font-black uppercase tracking-[0.2em] mb-3 italic">NET_CASH_FLOW</p>
                    <p className={cn(
                      "text-2xl font-display font-black italic tracking-tighter",
                      displayNetDelta >= 0 ? 'text-emerald-500' : 'text-rose-500'
                    )}>
                      {displayNetDelta >= 0 ? '+' : ''}{formatMoney(displayNetDelta).toUpperCase()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-center gap-8 py-4 bg-black/40 border-y border-white/5">
                   <div className="flex items-center gap-4">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/20 italic">OPENING_CASH:</span>
                      <span className="text-sm font-black text-muted-foreground/40 italic">{formatMoney(cashBefore).toUpperCase()}</span>
                   </div>
                   <ArrowRight className="h-4 w-4 text-white/5" />
                   <div className="flex items-center gap-4">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40 italic">CLOSING_CASH:</span>
                      <span className={cn(
                        "text-xl font-black italic",
                        displayCashAfter < 0 ? 'text-rose-500' : 'text-primary'
                      )}>{formatMoney(displayCashAfter).toUpperCase()}</span>
                   </div>
                </div>
              </div>

              {/* Project Updates */}
              {projectUpdates.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Activity className="h-4 w-4 text-secondary" />
                    <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-secondary italic">PRODUCTION_SLATE_UPDATES</h4>
                    <div className="h-px bg-secondary/20 flex-1" />
                  </div>
                  <div className="space-y-3">
                    {projectUpdates.map((u: string, i: number) => {
                      const hasPositiveTrend = u.includes('(+');
                      const hasNegativeTrend = u.includes('(-');
                      
                      return (
                        <div key={i} className="flex items-center gap-4 text-sm font-medium text-foreground/70 bg-white/[0.01] p-4 border border-white/5 hover:border-white/10 transition-colors">
                          <div className="w-1 h-1 bg-secondary shrink-0 rotate-45" />
                          <div className="flex-1 italic tracking-tight">
                            {hasPositiveTrend ? (
                              <>
                                {u.split('(+')[0]}
                                <span className="text-emerald-500 font-black ml-2"> (+{u.split('(+')[1]}</span>
                              </>
                            ) : hasNegativeTrend ? (
                              <>
                                {u.split('(-')[0]}
                                <span className="text-rose-500 font-black ml-2"> (-{u.split('(-')[1]}</span>
                              </>
                            ) : u}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Events */}
              {events.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Activity className="h-4 w-4 text-primary" />
                    <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-primary italic">SYSTEM_EVENTS</h4>
                    <div className="h-px bg-primary/20 flex-1" />
                  </div>
                  <div className="space-y-3">
                    {events.map((e: string, i: number) => (
                      <div key={i} className="text-xs font-black uppercase tracking-[0.1em] text-foreground/40 p-5 rounded-none bg-white/[0.02] border border-white/5 hover:border-primary/40 hover:text-foreground transition-all duration-700 italic">
                        {e}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Headlines */}
              {newHeadlines.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Newspaper className="h-4 w-4 text-muted-foreground/40" />
                    <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 italic">THE_TRADES_SUMMARY</h4>
                    <div className="h-px bg-white/5 flex-1" />
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {newHeadlines.map((h: Headline) => (
                      <button
                        key={h.id}
                        onClick={() => setSelectedHeadline(h)}
                        className="w-full text-left text-[11px] font-black text-muted-foreground/30 hover:text-primary transition-all duration-700 p-5 rounded-none bg-black border border-white/5 hover:border-primary/40 group flex items-center gap-6 italic"
                      >
                        <div className="w-2 h-2 bg-white/10 group-hover:bg-primary group-hover:rotate-90 transition-all duration-700 shrink-0" />
                        <span className="tracking-tight uppercase">{h.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="bg-black/80 border-t border-white/5 p-8">
            <button 
              onClick={resolveCurrentModal} 
              className="w-full h-16 bg-primary text-black font-display font-black uppercase tracking-[0.5em] italic text-xs hover:shadow-[0_0_80px_rgba(var(--primary),0.5)] hover:scale-[1.02] active:scale-95 transition-all duration-700 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              CONFIRM_REPORT_AND_CONTINUE
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <NewsStoryModal 
        headline={selectedHeadline} 
        open={!!selectedHeadline} 
        onClose={() => setSelectedHeadline(null)} 
      />
    </>
  );
};
