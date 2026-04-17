import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RevenueStreamChart } from './RevenueStreamChart';
import { ProfitWaterfallChart } from './ProfitWaterfallChart';
import { CashEfficiencyGauge } from './CashEfficiencyGauge';
import { FinancialSnapshot } from '@/engine/types/state.types';

interface EconomicAnalyticsProps {
  financeHistory: FinancialSnapshot[];
  latestFinanceSnapshot: FinancialSnapshot | null;
  prestige: number;
}

export const EconomicAnalytics = ({ financeHistory, latestFinanceSnapshot, prestige }: EconomicAnalyticsProps) => {
  return (
    <div className="grid grid-cols-3 gap-6 h-[250px]">
      <Card className="col-span-1 border-border/40 bg-card/40 backdrop-blur-md shadow-sm">
        <CardHeader className="pb-2 border-b border-border/20">
          <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            Revenue Mix (Last 12w)
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[180px] pt-4">
          <RevenueStreamChart data={financeHistory} />
        </CardContent>
      </Card>

      <Card className="col-span-1 border-border/40 bg-card/40 backdrop-blur-md shadow-sm">
        <CardHeader className="pb-2 border-b border-border/20">
          <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            Weekly P&L Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[180px] pt-4">
          {latestFinanceSnapshot && <ProfitWaterfallChart snapshot={latestFinanceSnapshot} />}
        </CardContent>
      </Card>

      <Card className="col-span-1 border-border/40 bg-card/40 backdrop-blur-md shadow-sm">
        <CardHeader className="pb-2 border-b border-border/20">
          <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            Studio Efficiency
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[180px] pt-4 flex items-center justify-center">
          <CashEfficiencyGauge score={prestige} />
        </CardContent>
      </Card>
    </div>
  );
};
