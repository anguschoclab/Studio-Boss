import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Building2, Users } from 'lucide-react';
import type { Agency, Talent, Opportunity, BudgetTierKey, ProjectFormat } from '@/engine/types';

interface CreatePackageModalProps {
  agencies?: Agency[];
  talents?: Record<string, Talent>;
}

export const CreatePackageModal = ({ agencies: propAgencies, talents: propTalents }: CreatePackageModalProps) => {
  const { resolveCurrentModal } = useUIStore();
  const gameState = useGameStore(s => s.gameState);
  const [selectedAgency, setSelectedAgency] = useState<string>('');
  const [selectedTier, setSelectedTier] = useState<string>('mid');
  const [selectedTalents, setSelectedTalents] = useState<string[]>([]);

  const agencies = propAgencies || gameState?.industry?.agencies || [];
  const talents = propTalents || gameState?.entities.talents || {};
  const talentList = Object.values(talents).filter(t => t.contractId && t.tier <= 3);

  const handleCreatePackage = () => {
    if (!selectedAgency || selectedTalents.length === 0) {
      return;
    }

    // Create package opportunity with all required fields
    const newPackage: Opportunity = {
      id: `pkg-${Date.now()}`,
      type: 'package' as any,
      title: `${selectedAgency} Talent Package`,
      format: 'film' as ProjectFormat,
      genre: 'Drama',
      budgetTier: selectedTier as BudgetTierKey,
      targetAudience: 'General',
      flavor: `Custom talent package from ${selectedAgency}`,
      origin: 'agency_package' as any,
      costToAcquire: selectedTier === 'high' ? 5000000 : selectedTier === 'mid' ? 2500000 : 1000000,
      weeksUntilExpiry: 12,
      attachedTalentIds: selectedTalents,
      qualityBonus: selectedTier === 'high' ? 15 : selectedTier === 'mid' ? 10 : 5,
      bids: {},
      bidHistory: [],
      expirationWeek: gameState ? gameState.week + 12 : 12,
    };

    // Add to game state (this would need a proper store action)
    // For now, just close the modal
    resolveCurrentModal();
  };

  const handleToggleTalent = (talentId: string) => {
    setSelectedTalents(prev =>
      prev.includes(talentId)
        ? prev.filter(id => id !== talentId)
        : prev.length < 5 ? [...prev, talentId] : prev
    );
  };

  const handleClose = () => {
    resolveCurrentModal();
  };

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Create Talent Package
          </DialogTitle>
          <DialogDescription>
            Assemble a talent package to offer to agencies
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Agency Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Select Agency
            </Label>
            <Select value={selectedAgency} onValueChange={setSelectedAgency}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an agency" />
              </SelectTrigger>
              <SelectContent>
                {agencies.map(agency => (
                  <SelectItem key={agency.id} value={agency.name}>
                    {agency.name} (Leverage: {agency.leverage}%)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tier Selection */}
          <div className="space-y-2">
            <Label>Package Tier</Label>
            <Select value={selectedTier} onValueChange={setSelectedTier}>
              <SelectTrigger>
                <SelectValue placeholder="Select tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low Tier ($1M cost, +5 quality)</SelectItem>
                <SelectItem value="mid">Mid Tier ($2.5M cost, +10 quality)</SelectItem>
                <SelectItem value="high">High Tier ($5M cost, +15 quality)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Talent Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Select Talent (max 5)
            </Label>
            <div className="max-h-64 overflow-y-auto border rounded-md p-3 space-y-2">
              {talentList.length === 0 ? (
                <p className="text-sm text-muted-foreground">No available talent with contracts</p>
              ) : (
                talentList.map(talent => (
                  <div
                    key={talent.id}
                    className="flex items-center justify-between p-3 m-2 rounded-lg shadow-sm hover:shadow-md hover:bg-muted cursor-pointer transition-all"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleToggleTalent(talent.id);
                      }
                    }}
                    onClick={() => handleToggleTalent(talent.id)}
                  >
                    <div className="flex-1">
                      <span className="font-medium">{talent.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {talent.roles.join(', ')} • Tier {talent.tier}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedTalents.includes(talent.id)}
                      onChange={() => handleToggleTalent(talent.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="ml-2"
                      tabIndex={-1}
                    />
                  </div>
                ))
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Selected: {selectedTalents.length}/5
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleCreatePackage}
            disabled={!selectedAgency || selectedTalents.length === 0}
          >
            Create Package
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePackageModal;
