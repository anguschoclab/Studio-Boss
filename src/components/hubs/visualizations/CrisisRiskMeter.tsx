import React from 'react';
import { GaugeChart } from '@/components/charts/GaugeChart';
import { Card } from '@/components/ui/card';
import { tokens } from '@/lib/tokens';
import { cn } from '@/lib/utils';
import { AlertTriangle, Shield, AlertOctagon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useGameStore } from '@/store/gameStore';
import { selectCrisisRiskLevel } from '@/store/selectors';

interface CrisisRiskMeterProps {
  riskLevel?: number; // 0-100
  activeThreats?: string[];
  className?: string;
}

export const CrisisRiskMeter: React.FC<CrisisRiskMeterProps> = ({
  riskLevel: externalRiskLevel,
  activeThreats: externalThreats,
  className,
}) => {
  const gameState = useGameStore(s => s.gameState);
  const { riskLevel, activeThreats } = externalRiskLevel !== undefined
    ? { riskLevel: externalRiskLevel, activeThreats: externalThreats || [] }
    : selectCrisisRiskLevel(gameState);
  const getRiskStatus = (level: number) => {
    if (level < 25) return { label: 'Low Risk', color: '#10b981', icon: Shield };
    if (level < 50) return { label: 'Moderate', color: '#f59e0b', icon: AlertTriangle };
    if (level < 75) return { label: 'High Risk', color: '#ef4444', icon: AlertOctagon };
    return { label: 'Critical', color: '#dc2626', icon: AlertOctagon };
  };

  const status = getRiskStatus(riskLevel);
  const Icon = status.icon;

  return (
    <Card className={cn('p-4', tokens.border.default, className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5" style={{ color: status.color }} />
          <div>
            <h4 className="font-bold text-sm">Crisis Risk</h4>
            <p className={cn('text-[10px]', tokens.text.caption)}>
              Current threat level
            </p>
          </div>
        </div>
        <Badge 
          className="text-[9px]"
          style={{ 
            backgroundColor: `${status.color}20`,
            color: status.color,
            borderColor: status.color 
          }}
          variant="outline"
        >
          {status.label}
        </Badge>
      </div>

      <div className="flex flex-col items-center mb-4">
        <GaugeChart
          value={riskLevel}
          size={130}
          strokeWidth={10}
          color={status.color}
          label="Risk Score"
          valueFormatter={(v) => `${v.toFixed(0)}%`}
        />
      </div>

      {activeThreats.length > 0 && (
        <div className="space-y-2">
          <p className={cn('text-[10px] font-medium', tokens.text.caption)}>
            Active Threats:
          </p>
          <div className="flex flex-wrap gap-1">
            {activeThreats.map((threat, idx) => (
              <Badge key={idx} variant="outline" className="text-[9px]">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {threat}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default CrisisRiskMeter;
