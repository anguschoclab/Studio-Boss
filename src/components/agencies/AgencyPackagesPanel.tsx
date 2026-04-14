import React from 'react';
import { cn } from '@/lib/utils';
import { Building2, Package, Eye, Star, DollarSign, Users } from 'lucide-react';
import { Section } from '@/components/layout/Section';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { tokens } from '@/lib/tokens';
import type { Agency } from '@/engine/types';

// Extended agency interface for UI display
interface AgencyDisplay extends Agency {
  relationshipScore?: number; // 0-100 - not in base Agency type
  packages?: string[]; // Not in base Agency type
  firstLookActive?: boolean;
  firstLookExpiry?: number;
}

interface TalentAttachment {
  talentId: string;
  talentName: string;
  role: string;
  tier: 1 | 2 | 3 | 4;
  commitment: 'attached' | 'interested' | 'considering';
}

interface TalentPackage {
  id: string;
  agencyId: string;
  agencyName: string;
  title: string;
  scriptTitle: string;
  genre: string;
  talentAttachments: TalentAttachment[];
  askingPrice: number;
  weeksOnMarket: number;
  heatScore: number; // 0-100 buzz level
}

interface AgencyPackagesPanelProps {
  agencies: AgencyDisplay[];
  packages: TalentPackage[];
  onCreatePackage?: () => void;
  onViewPackage?: (packageId: string) => void;
  onBidPackage?: (packageId: string) => void;
}

export const AgencyPackagesPanel: React.FC<AgencyPackagesPanelProps> = ({
  agencies,
  packages,
  onCreatePackage,
  onViewPackage,
  onBidPackage,
}) => {
  if (agencies.length === 0) {
    return (
      <div className={cn('text-center py-12', tokens.border.default, 'border-dashed rounded-xl')}>
        <Building2 className="h-12 w-12 mx-auto mb-4 opacity-20" />
        <p className={tokens.text.label}>No Agency Data</p>
        <p className={cn(tokens.text.caption, 'mt-2')}>
          Agency relationships will appear as you progress
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Agency Relationships Summary */}
      <Section
        title="Agency Relationships"
        subtitle={`${agencies.length} major agencies • ${packages.length} available packages`}
        icon={Building2}
        actions={
          <Button size="sm" variant="outline" onClick={onCreatePackage}>
            <Package className="h-3.5 w-3.5 mr-1.5" />
            Create Package
          </Button>
        }
      >
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {agencies.map((agency) => (
            <Card
              key={agency.id}
              className={cn(
                'p-3 cursor-pointer hover:shadow-md transition-all',
                tokens.border.default,
                agency.firstLookActive && 'border-l-4 border-l-primary'
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm">{agency.name}</span>
                {agency.firstLookActive && (
                  <Badge variant="secondary" className="text-[9px]">
                    <Eye className="h-3 w-3 mr-1" />
                    First Look
                  </Badge>
                )}
              </div>
              
              <p className={cn('text-[10px] mb-2', tokens.text.caption)}>
                {agency.archetype || 'Agency'}
              </p>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className={tokens.text.caption}>Relationship</span>
                  <span className="font-medium">{agency.relationshipScore ?? 50}%</span>
                </div>
                <div className="h-1 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full',
                      (agency.relationshipScore ?? 50) > 70 ? 'bg-emerald-500' :
                      (agency.relationshipScore ?? 50) > 40 ? 'bg-amber-500' : 'bg-red-500'
                    )}
                    style={{ width: `${agency.relationshipScore ?? 50}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/30">
                <span className={cn('text-[10px]', tokens.text.caption)}>
                  {agency.packages?.length || 0} packages
                </span>
                <span className={cn('text-[10px]', tokens.text.caption)}>
                  Leverage: {agency.leverage}%
                </span>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      {/* Available Packages */}
      <Section
        title="Available Talent Packages"
        subtitle={`${packages.length} packages currently on the market`}
        icon={Package}
      >
        {packages.length === 0 ? (
          <div className={cn('text-center py-8', tokens.border.default, 'border-dashed rounded-xl')}>
            <Package className="h-10 w-10 mx-auto mb-3 opacity-20" />
            <p className={cn('text-sm', tokens.text.caption)}>
              No talent packages available at this time
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {packages.map((pkg) => (
              <Card
                key={pkg.id}
                className={cn(
                  'p-4 cursor-pointer hover:shadow-md transition-all',
                  tokens.border.default
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm truncate">{pkg.title}</h4>
                      <Badge variant="outline" className="text-[9px]">
                        {pkg.agencyName}
                      </Badge>
                    </div>
                    <p className={cn('text-xs mt-0.5', tokens.text.caption)}>
                      Script: {pkg.scriptTitle}
                    </p>
                  </div>
                  <Badge 
                    variant={pkg.heatScore > 70 ? 'default' : 'secondary'}
                    className="text-[9px]"
                  >
                    <Star className="h-3 w-3 mr-1" />
                    {pkg.heatScore} Heat
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {pkg.talentAttachments.map((attachment) => (
                    <Badge 
                      key={attachment.talentId}
                      variant="outline" 
                      className={cn(
                        'text-[9px]',
                        attachment.commitment === 'attached' ? 'bg-primary/10' :
                        attachment.commitment === 'interested' ? 'bg-amber-500/10' :
                        'bg-muted'
                      )}
                    >
                      <Users className="h-3 w-3 mr-1" />
                      {attachment.talentName}
                      <span className="ml-1 opacity-60">(T{attachment.tier})</span>
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border/30">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className={cn('text-xs font-medium', tokens.text.caption)}>
                        ${(pkg.askingPrice / 1000000).toFixed(1)}M
                      </span>
                    </div>
                    <span className={cn('text-xs', tokens.text.caption)}>
                      {pkg.weeksOnMarket} weeks on market
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-[10px]"
                      onClick={() => onViewPackage?.(pkg.id)}
                    >
                      View
                    </Button>
                    <Button
                      size="sm"
                      className="h-7 text-[10px]"
                      onClick={() => onBidPackage?.(pkg.id)}
                    >
                      Bid
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
};

export default AgencyPackagesPanel;
