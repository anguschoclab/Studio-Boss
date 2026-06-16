import React from 'react';
import { cn } from '@/lib/utils';
import { Building2, Package, Eye, Star, DollarSign, Users, ChevronRight, Zap } from 'lucide-react';
import { TalentNameLink } from '@/components/shared/TalentNameLink';
import type { Agency, Opportunity } from '@/engine/types';

// Extended agency interface for UI display
interface AgencyDisplay extends Agency {
  relationshipScore?: number; // 0-100 - not in base Agency type
  packages?: string[]; // Not in base Agency type
  firstLookActive?: boolean;
  firstLookExpiry?: number;
}

interface AgencyPackagesPanelProps {
  agencies: AgencyDisplay[];
  packages: Opportunity[];
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
      <div className={cn('text-center py-20 bg-white/[0.01] border border-white/5 border-dashed rounded-none')}>
        <Building2 className="h-16 w-16 mx-auto mb-6 text-primary/20" strokeWidth={1} />
        <p className="text-sm font-black uppercase italic tracking-[0.3em] text-muted-foreground/40 leading-none">NO AGENCY DATA DETECTED</p>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/20 mt-4 italic">
          ESTABLISH RELATIONSHIPS TO POPULATE ARRAYS
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* Agency Relationships Summary */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-l-4 border-primary pl-6 py-2">
          <div>
            <h3 className="text-xl font-display font-black uppercase italic tracking-tighter text-foreground leading-none mb-2">AGENCY RELATIONSHIP MATRIX</h3>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 italic">
              {agencies.length} MAJOR INSTITUTIONS • {packages.length} ACTIVE NEGOTIATIONS
            </p>
          </div>
          <button 
            onClick={onCreatePackage}
            className="px-6 py-3 bg-primary text-black font-black uppercase italic text-[10px] tracking-[0.2em] rounded-none shadow-2xl hover:bg-primary/80 transition-all flex items-center gap-3"
          >
            <Package className="h-4 w-4" />
            INITIALIZE PACKAGE
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {agencies.map((agency) => (
            <div
              key={agency.id}
              className={cn(
                'p-6 bg-white/[0.01] border border-white/5 rounded-none backdrop-blur-3xl hover:bg-white/[0.03] transition-all duration-700 shadow-2xl relative overflow-hidden group',
                agency.firstLookActive && 'border-l-4 border-l-primary'
              )}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="space-y-1">
                  <span className="font-display font-black text-xs uppercase italic tracking-widest text-foreground group-hover:text-primary transition-colors leading-none block">{agency.name}</span>
                  <span className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 italic block">{agency.archetype || 'INSTITUTION'}</span>
                </div>
                {agency.firstLookActive && (
                  <div className="bg-primary text-black px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.2em] italic shadow-lg flex items-center gap-1">
                    <Eye className="h-3 w-3" strokeWidth={3} />
                    FIRST LOOK
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-[0.2em] italic">
                  <span className="text-muted-foreground/30">RELATIONSHIP</span>
                  <span className="text-primary">{agency.relationshipScore ?? 50}%</span>
                </div>
                <div className="h-1 bg-white/5 rounded-none overflow-hidden">
                  <div
                    className={cn(
                      'h-full transition-all duration-1000',
                      (agency.relationshipScore ?? 50) > 70 ? 'bg-primary' :
                      (agency.relationshipScore ?? 50) > 40 ? 'bg-amber-500' : 'bg-rose-500'
                    )}
                    style={{ width: `${agency.relationshipScore ?? 50}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5 text-[8px] font-black uppercase tracking-[0.2em] italic">
                <span className="text-muted-foreground/20">
                  {agency.packages?.length || 0} UNITS
                </span>
                <span className="text-muted-foreground/20">
                  LEVERAGE: {agency.leverage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Available Packages */}
      <div className="space-y-6">
        <div className="flex items-center gap-4 border-l-4 border-secondary pl-6 py-2">
          <Package className="h-6 w-6 text-secondary" strokeWidth={2} />
          <div>
            <h3 className="text-xl font-display font-black uppercase italic tracking-tighter text-foreground leading-none mb-2">AVAILABLE TALENT PACKAGES</h3>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 italic">
              {packages.length} STRATEGIC OFFERS ON MARKET
            </p>
          </div>
        </div>

        {packages.length === 0 ? (
          <div className={cn('text-center py-16 bg-white/[0.01] border border-white/5 border-dashed rounded-none')}>
            <Package className="h-12 w-12 mx-auto mb-6 text-secondary/20" strokeWidth={1} />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/20 italic">
              NO TALENT PACKAGES CURRENTLY AVAILABLE
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="bg-white/[0.02] border border-white/5 p-8 rounded-none backdrop-blur-3xl shadow-2xl hover:bg-white/[0.04] transition-all duration-700 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                  <Zap className="h-24 w-24 text-secondary" strokeWidth={1} />
                </div>
                
                <div className="flex items-start justify-between mb-8 relative z-10">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-4 mb-2">
                      <h4 className="font-display font-black text-lg uppercase italic tracking-tight text-foreground group-hover:text-secondary transition-colors leading-none">{pkg.title}</h4>
                      <div className="px-2 py-0.5 border border-white/10 text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 italic">
                        {pkg.type}
                      </div>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 italic leading-relaxed">
                      {pkg.flavor.toUpperCase()}
                    </p>
                  </div>
                  <div className="bg-secondary/10 border border-secondary/20 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-secondary italic shadow-xl flex items-center gap-2">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    +{pkg.qualityBonus || 0}_QUALITY_MOD
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-8 relative z-10">
                  {(pkg.attachedTalentIds || []).map((talentId) => (
                    <div 
                      key={talentId}
                      className="px-3 py-1 bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-[0.2em] text-foreground/60 italic flex items-center gap-2"
                    >
                      <Users className="h-3 w-3" strokeWidth={3} />
                      <TalentNameLink talentId={talentId} name={`TALENT_${talentId.slice(-4)}`} />
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-white/5 relative z-10">
                  <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] italic">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-emerald-500" strokeWidth={3} />
                      <span className="text-emerald-500">
                        ${(pkg.costToAcquire / 1000000).toFixed(1)}M ASK
                      </span>
                    </div>
                    <span className="text-muted-foreground/30 flex items-center gap-2">
                      <ChevronRight className="h-3 w-3" />
                      {pkg.weeksUntilExpiry || 0}_WEEKS_REMAINING
                    </span>
                  </div>
                  
                  <div className="flex gap-4">
                    <button
                      onClick={() => onViewPackage?.(pkg.id)}
                      className="px-6 py-2 bg-white/5 border border-white/10 text-[9px] font-black uppercase italic tracking-[0.2em] hover:bg-white/10 transition-all"
                    >
                      AUDIT
                    </button>
                    <button
                      onClick={() => onBidPackage?.(pkg.id)}
                      className="px-6 py-2 bg-secondary text-black text-[9px] font-black uppercase italic tracking-[0.2em] hover:bg-secondary/80 transition-all shadow-xl"
                    >
                      INITIALIZE BID
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgencyPackagesPanel;
