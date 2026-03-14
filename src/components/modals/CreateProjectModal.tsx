import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { GENRES, TARGET_AUDIENCES } from '@/engine/data/genres';
import { BUDGET_TIERS } from '@/engine/data/budgetTiers';
import { BudgetTierKey, ProjectFormat } from '@/engine/types';
import { formatMoney } from '@/engine/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const CreateProjectModal = () => {
  const { showCreateProject, closeCreateProject } = useUIStore();
  const { createProject } = useGameStore();

  const [title, setTitle] = useState('');
  const [format, setFormat] = useState<ProjectFormat>('film');
  const [genre, setGenre] = useState(GENRES[0]);
  const [budgetTier, setBudgetTier] = useState<BudgetTierKey>('mid');
  const [targetAudience, setTargetAudience] = useState(TARGET_AUDIENCES[0]);
  const [flavor, setFlavor] = useState('');

  const tier = BUDGET_TIERS[budgetTier];

  const handleCreate = () => {
    if (!title.trim()) return;
    createProject({ title: title.trim(), format, genre, budgetTier, targetAudience, flavor });
    closeCreateProject();
    setTitle('');
    setFlavor('');
  };

  return (
    <Dialog open={showCreateProject} onOpenChange={closeCreateProject}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Greenlight New Project</DialogTitle>
          <DialogDescription>Commission a new project for your slate.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wider">Title</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Untitled Project" />
          </div>

          {/* Format */}
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wider">Format</Label>
            <div className="flex gap-2">
              {(['film', 'tv'] as const).map(f => (
                <Button
                  key={f}
                  type="button"
                  variant={format === f ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFormat(f)}
                  className="flex-1 font-display"
                >
                  {f === 'film' ? 'Film' : 'TV Series'}
                </Button>
              ))}
            </div>
          </div>

          {/* Genre */}
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wider">Genre</Label>
            <Select value={genre} onValueChange={setGenre}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {GENRES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Budget Tier */}
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wider">Budget Tier</Label>
            <Select value={budgetTier} onValueChange={(v) => setBudgetTier(v as BudgetTierKey)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.values(BUDGET_TIERS).map(t => (
                  <SelectItem key={t.key} value={t.key}>
                    {t.name} ({t.label}) — {formatMoney(t.weeklyCost)}/wk
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[10px] text-muted-foreground">
              Budget: {tier.label} · Dev: {tier.developmentWeeks}wk · Prod: {tier.productionWeeks}wk
            </p>
          </div>

          {/* Target Audience */}
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wider">Target Audience</Label>
            <Select value={targetAudience} onValueChange={setTargetAudience}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TARGET_AUDIENCES.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Flavor */}
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wider">Positioning (optional)</Label>
            <Input value={flavor} onChange={e => setFlavor(e.target.value)} placeholder="A bold reimagining of..." />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={closeCreateProject}>Cancel</Button>
          <Button onClick={handleCreate} disabled={!title.trim()} className="font-display">
            Greenlight
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
