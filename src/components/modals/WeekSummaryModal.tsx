import { useUIStore } from '@/store/uiStore';
import { useGameStore } from '@/store/gameStore';
import { formatMoney } from '@/engine/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export const WeekSummaryModal = () => {
  const { activeModal, resolveCurrentModal } = useUIStore();
  const snapshots = useGameStore(s => s.snapshots);

  if (!activeModal || activeModal.type !== 'SUMMARY') return null;

  const weekSummary = activeModal.payload;
  const { toWeek, cashBefore, cashAfter, totalRevenue, totalCosts, projectUpdates, newHeadlines, events } = weekSummary;
  const netDelta = cashAfter - cashBefore;

  const isYearEnd = (toWeek - 1) % 52 === 0 && toWeek > 1;
  let yearlyDelta = 0;
  if (isYearEnd && snapshots.length > 0) {
    const latest = snapshots[snapshots.length - 1];
    const previous = snapshots.length > 1 ? snapshots[snapshots.length - 2] : null;
    // If it's the first year, delta is from the start (we don't have a 0-snapshot yet, but we could assume 0 or just show performance)
    yearlyDelta = previous ? latest.funds - previous.funds : latest.funds - (cashAfter - totalRevenue + totalCosts); // Approximation of start-of-game cash
  }

  return (
    <Dialog open={true} onOpenChange={() => resolveCurrentModal()}>
      <DialogContent 
        className="max-w-md border-border/50 bg-background/95 backdrop-blur-xl shadow-2xl"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className={`font-display text-2xl font-black tracking-tight bg-clip-text text-transparent ${isYearEnd ? 'bg-gradient-to-r from-amber-400 to-yellow-600' : 'bg-gradient-to-r from-primary to-primary/70'}`}>
            {isYearEnd ? 'Fiscal Year Summary' : `Week ${toWeek} Report`}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Yearly Highlight */}
          {isYearEnd && (
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 shadow-inner animate-in zoom-in-95 duration-500 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50" />
              <div className="relative z-10 flex justify-between items-end">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Annual Net Results</p>
                  <p className={`text-2xl font-display font-black tracking-tighter ${yearlyDelta >= 0 ? 'text-success drop-shadow-[0_0_8px_rgba(34,197,94,0.3)]' : 'text-destructive drop-shadow-[0_0_8px_rgba(239,68,68,0.3)]'}`}>
                    {yearlyDelta >= 0 ? '+' : ''}{formatMoney(yearlyDelta)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Year Completed</p>
                  <p className="text-2xl font-display font-black text-foreground drop-shadow-sm">{Math.floor((toWeek - 2) / 52) + 1}</p>
                </div>
              </div>
            </div>
          )}
          {/* Financial Summary */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-display uppercase tracking-widest text-primary font-black">💰 Financials</h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-2.5 rounded-lg border border-border/40 bg-card/40 backdrop-blur-sm text-center shadow-sm">
                <p className="text-[10px] text-muted-foreground">Revenue</p>
                <p className="text-sm font-semibold text-success">+{formatMoney(totalRevenue)}</p>
              </div>
              <div className="p-2.5 rounded-lg border border-border/40 bg-card/40 backdrop-blur-sm text-center shadow-sm">
                <p className="text-[10px] text-muted-foreground">Costs</p>
                <p className="text-sm font-semibold text-destructive">-{formatMoney(totalCosts)}</p>
              </div>
              <div className="p-2.5 rounded-lg border border-border/40 bg-card/40 backdrop-blur-sm text-center shadow-sm">
                <p className="text-[10px] text-muted-foreground">Net</p>
                <p className={`text-sm font-semibold ${netDelta >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {netDelta >= 0 ? '+' : ''}{formatMoney(netDelta)}
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Cash: {formatMoney(cashBefore)} → <span className={cashAfter < 0 ? 'text-destructive' : 'text-primary'}>{formatMoney(cashAfter)}</span>
            </p>
          </div>

          {/* Project Updates */}
          {projectUpdates.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-[10px] font-display uppercase tracking-widest text-secondary font-black">🎬 Project Updates</h4>
                {projectUpdates.map((u: string, i: number) => {
                  const hasPositiveTrend = u.includes('(+');
                  const hasNegativeTrend = u.includes('(-');
                  
                  if (hasPositiveTrend) {
                    const parts = u.split('(+');
                    return (
                      <p key={i} className="text-sm text-foreground">
                        • {parts[0]}
                        <span className="text-emerald-400 font-bold">(+{parts[1]}</span>
                      </p>
                    );
                  }
                  
                  if (hasNegativeTrend) {
                    const parts = u.split('(-');
                    return (
                      <p key={i} className="text-sm text-foreground">
                        • {parts[0]}
                        <span className="text-destructive font-bold">(-{parts[1]}</span>
                      </p>
                    );
                  }

                  return <p key={i} className="text-sm text-foreground">• {u}</p>;
                })}
              </div>
            </>
          )}

          {/* Events */}
          {events.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-[10px] font-display uppercase tracking-widest text-primary font-black">⚡ Events</h4>
                {events.map((e: string, i: number) => (
                  <p key={i} className="text-sm text-foreground">{e}</p>
                ))}
              </div>
            </>
          )}

          {/* Headlines */}
          {newHeadlines.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-[10px] font-display uppercase tracking-widest text-muted-foreground font-black">📰 Headlines</h4>
                {newHeadlines.map((h: any) => (
                  <p key={h.id} className="text-xs text-muted-foreground">— {h.text}</p>
                ))}
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button onClick={resolveCurrentModal} className="w-full font-display font-bold tracking-wide transition-all hover:shadow-[0_0_15px_rgba(234,179,8,0.4)] hover:-translate-y-0.5">Continue →</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

