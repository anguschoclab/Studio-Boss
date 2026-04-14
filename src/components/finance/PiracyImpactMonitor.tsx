import React from 'react';
import { cn } from '@/lib/utils';
import { Download, AlertTriangle, Globe, Lock } from 'lucide-react';
import { Section } from '@/components/layout/Section';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { tokens } from '@/lib/tokens';

interface PiracyRegion {
  region: string;
  illegalDownloads: number;
  revenueLoss: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  trend: 'increasing' | 'stable' | 'decreasing';
}

interface ProjectPiracy {
  projectId: string;
  projectTitle: string;
  format: 'film' | 'tv';
  totalDownloads: number;
  estimatedRevenueLoss: number;
  byRegion: PiracyRegion[];
  leakSource?: string;
  daysSinceRelease: number;
}

interface PiracyImpactMonitorProps {
  projects: ProjectPiracy[];
  totalLoss: number;
  studioRiskLevel: 'low' | 'medium' | 'high';
  activeProtections: string[];
}

export const PiracyImpactMonitor: React.FC<PiracyImpactMonitorProps> = ({
  projects,
  totalLoss,
  studioRiskLevel,
  activeProtections,
}) => {
  const highRiskProjects = projects.filter(p => 
    p.byRegion.some(r => r.severity === 'high' || r.severity === 'critical')
  );

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value}`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical':
      case 'high': return 'text-red-500';
      case 'medium': return 'text-amber-500';
      default: return 'text-emerald-500';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-amber-500';
      default: return 'bg-yellow-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Risk Alert Banner */}
      {studioRiskLevel === 'high' && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <div>
            <p className="font-medium text-red-500">High Piracy Risk Detected</p>
            <p className="text-sm text-red-500/70">
              Multiple projects experiencing significant unauthorized distribution
            </p>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className={cn('p-4', tokens.border.default)}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10">
              <Download className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className={cn('text-[10px] uppercase', tokens.text.caption)}>Est. Revenue Loss</p>
              <p className={cn('text-xl font-bold', getRiskColor(studioRiskLevel))}>
                {formatCurrency(totalLoss)}
              </p>
            </div>
          </div>
        </Card>

        <Card className={cn('p-4', tokens.border.default)}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className={cn('text-[10px] uppercase', tokens.text.caption)}>High Risk Projects</p>
              <p className="text-xl font-bold">{highRiskProjects.length}</p>
            </div>
          </div>
        </Card>

        <Card className={cn('p-4', tokens.border.default)}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <Lock className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className={cn('text-[10px] uppercase', tokens.text.caption)}>Protections Active</p>
              <p className="text-xl font-bold">{activeProtections.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* High Risk Projects */}
      {highRiskProjects.length > 0 && (
        <Section
          title="High Risk Projects"
          subtitle="Projects experiencing significant piracy"
          icon={AlertTriangle}
        >
          <div className="space-y-3">
            {highRiskProjects.map((project) => (
              <Card
                key={project.projectId}
                className={cn('p-4 border-l-4 border-l-red-500', tokens.border.default)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-sm">{project.projectTitle}</h4>
                    <p className={cn('text-[10px]', tokens.text.caption)}>
                      {project.format.toUpperCase()} • {project.daysSinceRelease} days since release
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-red-500">
                      {formatNumber(project.totalDownloads)}
                    </p>
                    <p className={cn('text-[10px]', tokens.text.caption)}>illegal downloads</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <span className={cn('text-sm', tokens.text.caption)}>
                    Est. Revenue Loss: {formatCurrency(project.estimatedRevenueLoss)}
                  </span>
                  {project.leakSource && (
                    <Badge variant="outline" className="text-[9px]">
                      Source: {project.leakSource}
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {project.byRegion.slice(0, 4).map((region) => (
                    <div
                      key={region.region}
                      className="p-2 bg-muted/30 rounded text-[10px]"
                    >
                      <div className="flex items-center gap-1 mb-1">
                        <Globe className="h-3 w-3" />
                        <span className="font-medium">{region.region}</span>
                      </div>
                      <p className={tokens.text.caption}>
                        {formatNumber(region.illegalDownloads)} downloads
                      </p>
                      <Badge 
                        className={cn('text-[8px] mt-1', getSeverityColor(region.severity))}
                      >
                        {region.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </Section>
      )}

      {/* Active Protections */}
      <Section
        title="Active Protections"
        subtitle="Anti-piracy measures in place"
        icon={Lock}
      >
        <div className="flex flex-wrap gap-2">
          {activeProtections.map((protection, idx) => (
            <Badge key={idx} variant="outline" className="text-[10px]">
              <Lock className="h-3 w-3 mr-1" />
              {protection}
            </Badge>
          ))}
          {activeProtections.length === 0 && (
            <p className={cn('text-sm', tokens.text.caption)}>
              No active anti-piracy protections
            </p>
          )}
        </div>
      </Section>

      {projects.length === 0 && (
        <div className={cn('text-center py-12', tokens.border.default, 'border-dashed rounded-xl')}>
          <Lock className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p className={tokens.text.label}>No Piracy Data</p>
          <p className={cn('text-sm mt-2', tokens.text.caption)}>
            Content security monitoring active
          </p>
        </div>
      )}
    </div>
  );
};

export default PiracyImpactMonitor;
