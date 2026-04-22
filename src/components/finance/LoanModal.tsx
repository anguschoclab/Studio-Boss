import { useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatMoney } from '@/engine/utils';
import { Loan } from '@/engine/systems/finance/LoanSystem';
import { AlertTriangle, Banknote, CreditCard } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LoanOffer {
  label: string;
  amount: number;
  termWeeks: number;
  rate: number;
  weeklyPayment: number;
  totalInterest: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function calcWeeklyPayment(amount: number, termWeeks: number, annualRate: number): number {
  const r = annualRate / 52;
  if (r === 0) return amount / termWeeks;
  return (amount * r) / (1 - Math.pow(1 + r, -termWeeks));
}

function buildOffers(loanRate: number): LoanOffer[] {
  const defs = [
    { label: 'Small Loan', amount: 5_000_000, termWeeks: 52, rateMult: 0.9 },
    { label: 'Medium Loan', amount: 20_000_000, termWeeks: 78, rateMult: 1.0 },
    { label: 'Large Loan', amount: 50_000_000, termWeeks: 104, rateMult: 1.1 },
  ];

  return defs.map((d) => {
    const rate = loanRate * d.rateMult;
    const weeklyPayment = Math.round(calcWeeklyPayment(d.amount, d.termWeeks, rate));
    const totalInterest = weeklyPayment * d.termWeeks - d.amount;
    return {
      label: d.label,
      amount: d.amount,
      termWeeks: d.termWeeks,
      rate,
      weeklyPayment,
      totalInterest,
    };
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const LoanModal = () => {
  const gameState = useGameStore((s) => s.gameState);
  const addLoan = useGameStore((s) => s.addLoan as (amount: number, termWeeks: number) => void);
  const repayLoanEarly = useGameStore((s) => s.repayLoanEarly as (id: string) => void);

  const loanRate = gameState?.finance?.marketState?.loanRate ?? 0.08;
  const loans: Loan[] = useMemo(
    () => (gameState?.studio?.loans || []) as Loan[],
    [gameState],
  );

  const offers = useMemo(() => buildOffers(loanRate), [loanRate]);

  // Weekly revenue estimate (average of last 4 snapshots)
  const avgWeeklyRevenue = useMemo(() => {
    const history = gameState?.finance?.weeklyHistory?.slice(0, 4) ?? [];
    if (history.length === 0) return 0;
    const sum = history.reduce((acc, s) => {
      return acc + s.revenue.theatrical + s.revenue.streaming + s.revenue.merch + s.revenue.passive;
    }, 0);
    return sum / history.length;
  }, [gameState]);

  const totalWeeklyPayments = useMemo(
    () => loans.reduce((acc, l) => acc + l.weeklyPayment, 0),
    [loans],
  );

  const isDebtWarning =
    avgWeeklyRevenue > 0 && totalWeeklyPayments > avgWeeklyRevenue * 0.1;

  if (!gameState) return null;

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------------ */}
      {/* Debt Warning Banner                                                  */}
      {/* ------------------------------------------------------------------ */}
      {isDebtWarning && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 px-5 py-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
          <div>
            <p className="text-sm font-display font-black uppercase tracking-widest text-destructive">
              Debt Warning
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Weekly loan payments ({formatMoney(totalWeeklyPayments)}/wk) exceed 10% of your
              average weekly revenue. Consider paying off loans early.
            </p>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Available Loan Offers                                                */}
      {/* ------------------------------------------------------------------ */}
      <Card className="glass-card border-border/40">
        <CardHeader className="border-b border-border/30 pb-4">
          <CardTitle className="flex items-center gap-2 text-xs font-display font-black uppercase tracking-widest text-foreground/80">
            <Banknote className="h-4 w-4 text-primary" />
            Available Loans
          </CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border/20 p-0">
          {offers.map((offer) => (
            <div
              key={offer.label}
              className="group relative flex items-center justify-between overflow-hidden px-6 py-5 transition-colors hover:bg-muted/10"
            >
              {/* Shimmer */}
              <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

              {/* Left: label + stats */}
              <div className="relative z-10 space-y-1.5">
                <p className="text-sm font-display font-black tracking-tight text-foreground">
                  {offer.label}
                </p>
                <p className="font-tabular-nums text-3xl font-display font-black text-primary">
                  {formatMoney(offer.amount)}
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                  <span>
                    <span className="font-bold text-foreground/70">Term:</span>{' '}
                    {offer.termWeeks} weeks
                  </span>
                  <span>
                    <span className="font-bold text-foreground/70">Rate:</span>{' '}
                    {(offer.rate * 100).toFixed(1)}% p.a.
                  </span>
                  <span>
                    <span className="font-bold text-foreground/70">Weekly:</span>{' '}
                    <span className="font-tabular-nums text-destructive">
                      {formatMoney(offer.weeklyPayment)}
                    </span>
                  </span>
                  <span>
                    <span className="font-bold text-foreground/70">Total interest:</span>{' '}
                    <span className="font-tabular-nums text-destructive">
                      {formatMoney(offer.totalInterest)}
                    </span>
                  </span>
                </div>
              </div>

              {/* Right: action */}
              <Button
                className="relative z-10 ml-6 shrink-0 font-display font-black uppercase tracking-widest text-[10px]"
                size="sm"
                onClick={() => addLoan(offer.amount, offer.termWeeks)}
              >
                Take Loan
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ------------------------------------------------------------------ */}
      {/* Active Loans                                                         */}
      {/* ------------------------------------------------------------------ */}
      <Card className="glass-card border-border/40">
        <CardHeader className="border-b border-border/30 pb-4">
          <CardTitle className="flex items-center gap-2 text-xs font-display font-black uppercase tracking-widest text-foreground/80">
            <CreditCard className="h-4 w-4 text-destructive" />
            Active Loans
            {loans.length > 0 && (
              <Badge
                variant="outline"
                className="ml-1 border-destructive/30 bg-destructive/10 text-[9px] font-black uppercase tracking-widest text-destructive"
              >
                {loans.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 opacity-50">
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                No active loans
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/20">
              {loans.map((loan) => {
                const remainingBalance = loan.weeklyPayment * loan.weeksRemaining;
                const progressPct = Math.round(
                  ((loan.weeksRemaining) /
                    // We don't store total term, so derive from startWeek distance
                    // Use an estimate: original term = principal / weeklyPayment floored
                    Math.max(1, Math.round(loan.principal / loan.weeklyPayment))) *
                    100,
                );
                const elapsedPct = Math.min(100, Math.max(0, 100 - progressPct));

                return (
                  <div
                    key={loan.id}
                    className="group relative overflow-hidden px-6 py-5 transition-colors hover:bg-muted/10"
                  >
                    <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                    <div className="relative z-10 space-y-3">
                      {/* Header row */}
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-black text-foreground">{loan.lenderName}</p>
                          <p className="font-tabular-nums text-2xl font-display font-black text-destructive">
                            {formatMoney(remainingBalance)}{' '}
                            <span className="text-base font-medium text-muted-foreground">
                              remaining
                            </span>
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1 text-right">
                          <span className="text-[11px] text-muted-foreground">
                            <span className="font-bold text-foreground/70">Weekly:</span>{' '}
                            <span className="font-tabular-nums text-destructive">
                              {formatMoney(loan.weeklyPayment)}
                            </span>
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            <span className="font-bold text-foreground/70">Weeks left:</span>{' '}
                            {loan.weeksRemaining}
                          </span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="space-y-1">
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-border/30">
                          <div
                            className="h-full rounded-full bg-success transition-all duration-500"
                            style={{ width: `${elapsedPct}%` }}
                          />
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          {elapsedPct}% repaid
                        </p>
                      </div>

                      {/* Early repayment */}
                      <Button
                        size="sm"
                        variant="outline"
                        className="font-display font-black text-[10px] uppercase tracking-widest text-destructive hover:border-destructive/50 hover:bg-destructive/10"
                        onClick={() => repayLoanEarly(loan.id)}
                      >
                        Repay Early — {formatMoney(remainingBalance)}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
