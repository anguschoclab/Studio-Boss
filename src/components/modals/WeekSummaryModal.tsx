import { useUIStore } from '@/store/uiStore';
import { formatMoney } from '@/engine/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export const WeekSummaryModal = () => {
  const { showWeekSummary, weekSummary, closeSummary } = useUIStore();

  if (!weekSummary) return null;

  const { fromWeek, toWeek, cashBefore, cashAfter, totalRevenue, totalCosts, projectUpdates, newHeadlines, events } = weekSummary;
  const netDelta = cashAfter - cashBefore;

  return (
    <Dialog open={showWeekSummary} onOpenChange={closeSummary}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            Week {toWeek} Report
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Financial Summary */}
          <div className="space-y-2">
            <h4 className="text-xs font-display uppercase tracking-wider text-primary font-semibold">💰 Financials</h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-2 rounded bg-accent/50 text-center">
                <p className="text-[10px] text-muted-foreground">Revenue</p>
                <p className="text-sm font-semibold text-success">+{formatMoney(totalRevenue)}</p>
              </div>
              <div className="p-2 rounded bg-accent/50 text-center">
                <p className="text-[10px] text-muted-foreground">Costs</p>
                <p className="text-sm font-semibold text-destructive">-{formatMoney(totalCosts)}</p>
              </div>
              <div className="p-2 rounded bg-accent/50 text-center">
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
                <h4 className="text-xs font-display uppercase tracking-wider text-secondary font-semibold">🎬 Project Updates</h4>
                {projectUpdates.map((u, i) => (
                  <p key={i} className="text-sm text-foreground">• {u}</p>
                ))}
              </div>
            </>
          )}

          {/* Events */}
          {events.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-xs font-display uppercase tracking-wider text-primary font-semibold">⚡ Events</h4>
                {events.map((e, i) => (
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
                <h4 className="text-xs font-display uppercase tracking-wider text-muted-foreground font-semibold">📰 Headlines</h4>
                {newHeadlines.map(h => (
                  <p key={h.id} className="text-xs text-muted-foreground">— {h.text}</p>
                ))}
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button onClick={closeSummary} className="w-full font-display">Continue →</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
