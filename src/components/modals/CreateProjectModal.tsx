import { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { GENRES, TARGET_AUDIENCES } from '@/engine/data/genres';
import { BUDGET_TIERS } from '@/engine/data/budgetTiers';
import { TV_FORMATS } from '@/engine/data/tvFormats';
import { BudgetTierKey, ProjectFormat, TvFormatKey, ReleaseModelKey } from '@/engine/types';
import { formatMoney } from '@/engine/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

export const CreateProjectModal = () => {
  const { showCreateProject, closeCreateProject } = useUIStore();
  const { createProject } = useGameStore();

  const [title, setTitle] = useState('');
  const [format, setFormat] = useState<ProjectFormat>('film');
  const [genre, setGenre] = useState<string>(GENRES[0]);
  const [budgetTier, setBudgetTier] = useState<BudgetTierKey>('mid');
  const [targetAudience, setTargetAudience] = useState<string>(TARGET_AUDIENCES[0]);
  const [flavor, setFlavor] = useState('');

  const [tvFormat, setTvFormat] = useState<TvFormatKey>('procedural');
  const [episodes, setEpisodes] = useState<number>(TV_FORMATS['procedural'].defaultEpisodes);
  const [releaseModel, setReleaseModel] = useState<ReleaseModelKey>('weekly');

  useEffect(() => {
    if (format === 'tv') {
      const defaultEps = TV_FORMATS[tvFormat].defaultEpisodes;
      setEpisodes(defaultEps);
    }
  }, [tvFormat, format]);

  const tier = BUDGET_TIERS[budgetTier];
  let calculatedWeeklyCost = tier.weeklyCost;
  let calculatedDevWeeks = tier.developmentWeeks;
  let calculatedProdWeeks = tier.productionWeeks;
  let calculatedBudget = tier.budget;

  if (format === 'tv') {
      const tvData = TV_FORMATS[tvFormat];
      calculatedWeeklyCost = tier.weeklyCost * tvData.productionCostMultiplier;
      calculatedDevWeeks = Math.ceil(tier.developmentWeeks * tvData.developmentWeeksModifier);
      calculatedProdWeeks = Math.ceil(episodes * tvData.productionWeeksPerEpisode);
      calculatedBudget = calculatedWeeklyCost * calculatedProdWeeks + (tier.budget * 0.2);
  }

  const handleCreate = () => {
    if (!title.trim()) return;

    if (format === 'tv') {
        createProject({ title: title.trim(), format, genre, budgetTier, targetAudience, flavor, tvFormat, episodes, releaseModel });
    } else {
        createProject({ title: title.trim(), format, genre, budgetTier, targetAudience, flavor });
    }

    closeCreateProject();
    setTitle('');
    setFlavor('');
  };

  return (
    <Dialog open={showCreateProject} onOpenChange={closeCreateProject}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
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

          {format === 'tv' && (
            <>
              {/* TV Format */}
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider">TV Format</Label>
                <Select value={tvFormat} onValueChange={(v) => setTvFormat(v as TvFormatKey)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.values(TV_FORMATS).map(t => (
                      <SelectItem key={t.key} value={t.key}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Episodes */}
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider">Episodes: {episodes}</Label>
                <Slider
                    value={[episodes]}
                    min={TV_FORMATS[tvFormat].minEpisodes}
                    max={TV_FORMATS[tvFormat].maxEpisodes}
                    step={1}
                    onValueChange={(val) => setEpisodes(val[0])}
                />
              </div>

              {/* Release Model */}
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider">Release Model</Label>
                <Select value={releaseModel} onValueChange={(v) => setReleaseModel(v as ReleaseModelKey)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly Rollout</SelectItem>
                    <SelectItem value="binge">Full Season Binge</SelectItem>
                    <SelectItem value="split">Split Season (2 Parts)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

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
                    {t.name} ({t.label} Base)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[10px] text-muted-foreground bg-muted p-2 rounded">
              Est. Weekly Cost: {formatMoney(calculatedWeeklyCost)}<br />
              Est. Total Budget: {formatMoney(calculatedBudget)}<br />
              Schedule: Dev {calculatedDevWeeks}wk / Prod {calculatedProdWeeks}wk
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
