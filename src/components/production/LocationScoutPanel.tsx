import React from 'react';
import { cn } from '@/lib/utils';
import { MapPin, DollarSign, CheckCircle2, AlertTriangle, Plane, Building2 } from 'lucide-react';
import { Section } from '@/components/layout/Section';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { tokens } from '@/lib/tokens';

interface LocationOption {
  id: string;
  name: string;
  region: string;
  country: string;
  costTier: 'low' | 'medium' | 'high' | 'premium';
  baseCost: number;
  taxIncentive: number; // percentage
  travelTime: number; // hours
  permitsRequired: boolean;
  weatherRisk: 'low' | 'medium' | 'high';
  infrastructure: 'basic' | 'good' | 'excellent';
  unionRequirements: string[];
  matchedProjects: string[];
}

interface LocationScoutPanelProps {
  locations: LocationOption[];
  selectedLocations: string[];
  onSelect?: (locationId: string) => void;
  onViewDetails?: (locationId: string) => void;
}

export const LocationScoutPanel: React.FC<LocationScoutPanelProps> = ({
  locations,
  selectedLocations,
  onSelect,
  onViewDetails,
}) => {
  const availableLocations = locations.filter(l => !selectedLocations.includes(l.id));
  const bookedLocations = locations.filter(l => selectedLocations.includes(l.id));

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value}`;
  };

  const getCostBadge = (tier: string) => {
    const colors: Record<string, string> = {
      low: 'bg-emerald-500/20 text-emerald-500',
      medium: 'bg-blue-500/20 text-blue-500',
      high: 'bg-amber-500/20 text-amber-500',
      premium: 'bg-purple-500/20 text-purple-500',
    };
    return (
      <Badge className={cn('text-[9px]', colors[tier])}>
        {tier.charAt(0).toUpperCase() + tier.slice(1)} Cost
      </Badge>
    );
  };

  const getRiskBadge = (risk: string) => {
    const colors: Record<string, string> = {
      low: 'bg-emerald-500/20 text-emerald-500',
      medium: 'bg-amber-500/20 text-amber-500',
      high: 'bg-red-500/20 text-red-500',
    };
    return (
      <Badge className={cn('text-[9px]', colors[risk])}>
        {risk} Risk
      </Badge>
    );
  };

  const renderLocationCard = (location: LocationOption, isSelected: boolean) => (
    <Card
      key={location.id}
      className={cn(
        'p-4',
        tokens.border.default,
        isSelected && 'border-l-4 border-l-primary'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="h-4 w-4 text-primary" />
            <h4 className="font-bold text-sm">{location.name}</h4>
            {isSelected && (
              <Badge className="text-[9px] bg-primary/20 text-primary">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Booked
              </Badge>
            )}
          </div>
          <p className={cn('text-[10px]', tokens.text.caption)}>
            {location.region}, {location.country}
          </p>
        </div>
        <div className="text-right">
          {getCostBadge(location.costTier)}
          <p className="text-lg font-bold mt-1">{formatCurrency(location.baseCost)}</p>
          <p className={cn('text-[10px]', tokens.text.caption)}>base cost</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <Badge variant="outline" className="text-[9px]">
          <Plane className="h-3 w-3 mr-1" />
          {location.travelTime}h travel
        </Badge>
        <Badge variant="outline" className="text-[9px]">
          <Building2 className="h-3 w-3 mr-1" />
          {location.infrastructure} infrastructure
        </Badge>
        {getRiskBadge(location.weatherRisk)}
        {location.permitsRequired && (
          <Badge className="text-[9px] bg-amber-500/20 text-amber-500">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Permits Required
          </Badge>
        )}
        {location.taxIncentive > 0 && (
          <Badge className="text-[9px] bg-emerald-500/20 text-emerald-500">
            {location.taxIncentive}% Tax Credit
          </Badge>
        )}
      </div>

      {location.unionRequirements.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          <span className={cn('text-[10px]', tokens.text.caption)}>Unions:</span>
          {location.unionRequirements.map((union, idx) => (
            <Badge key={idx} variant="secondary" className="text-[8px]">
              {union}
            </Badge>
          ))}
        </div>
      )}

      {location.matchedProjects.length > 0 && (
        <p className={cn('text-[10px] mb-3', tokens.text.caption)}>
          Recommended for: {location.matchedProjects.join(', ')}
        </p>
      )}

      {!isSelected && (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-[10px] flex-1"
            onClick={() => onViewDetails?.(location.id)}
          >
            View Details
          </Button>
          <Button
            size="sm"
            className="h-7 text-[10px] flex-1"
            onClick={() => onSelect?.(location.id)}
          >
            Book Location
          </Button>
        </div>
      )}
    </Card>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <Card className={cn('p-4', tokens.border.default)}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className={cn('text-[10px] uppercase', tokens.text.caption)}>Booked</p>
              <p className="text-2xl font-bold">{bookedLocations.length}</p>
            </div>
          </div>
        </Card>

        <Card className={cn('p-4', tokens.border.default)}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <DollarSign className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className={cn('text-[10px] uppercase', tokens.text.caption)}>Available</p>
              <p className="text-2xl font-bold">{availableLocations.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Booked Locations */}
      {bookedLocations.length > 0 && (
        <Section
          title="Booked Locations"
          subtitle={`${bookedLocations.length} location${bookedLocations.length > 1 ? 's' : ''} secured`}
          icon={CheckCircle2}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {bookedLocations.map(l => renderLocationCard(l, true))}
          </div>
        </Section>
      )}

      {/* Available Locations */}
      <Section
        title="Location Scout"
        subtitle={`${availableLocations.length} locations available`}
        icon={MapPin}
      >
        {availableLocations.length === 0 ? (
          <div className={cn('text-center py-8', tokens.border.default, 'border-dashed rounded-xl')}>
            <MapPin className="h-10 w-10 mx-auto mb-3 opacity-20" />
            <p className={cn('text-sm', tokens.text.caption)}>
              No locations currently available
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {availableLocations.map(l => renderLocationCard(l, false))}
          </div>
        )}
      </Section>
    </div>
  );
};

export default LocationScoutPanel;
