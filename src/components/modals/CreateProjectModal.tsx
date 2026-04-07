import { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { GENRE_TAXONOMY, GENRES, TARGET_AUDIENCES } from '@/engine/data/genres';
import { BUDGET_TIERS } from '@/engine/data/budgetTiers';
import { TV_FORMATS, TV_FORMAT_TAXONOMY } from '@/engine/data/tvFormats';
import { UNSCRIPTED_FORMATS } from '@/engine/data/unscriptedFormats';
import { UNSCRIPTED_FORMAT_TAXONOMY } from '@/engine/data/unscriptedTaxonomy';
import { generateProjectTitle } from '@/engine/generators/titles';
import { BudgetTierKey, ProjectFormat, TvFormatKey, UnscriptedFormatKey, ReleaseModelKey } from '@/engine/types';
import { formatMoney } from '@/engine/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Dices, Info } from 'lucide-react';

export const CreateProjectModal = () => {
  const { showCreateProject, closeCreateProject } = useUIStore();
  const createProject = useGameStore(s => s.createProject) || (() => {});

  const [title, setTitle] = useState('');
  const [format, setFormat] = useState<ProjectFormat>('film');
  const [genre, setGenre] = useState<string>(GENRES[0]);
  const [budgetTier, setBudgetTier] = useState<BudgetTierKey>('mid');
  const [targetAudience, setTargetAudience] = useState<string>(TARGET_AUDIENCES[0]);
  const [flavor, setFlavor] = useState('');
  const [tvFormat, setTvFormat] = useState<TvFormatKey>('prestige_drama');
  const [unscriptedFormat, setUnscriptedFormat] = useState<UnscriptedFormatKey>('competition');
  const [episodes, setEpisodes] = useState<number>(10);
  const [releaseModel, setReleaseModel] = useState<ReleaseModelKey>('weekly');

  useEffect(() => {
    if (showCreateProject && !title) {
      setTitle(generateProjectTitle(genre));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCreateProject, genre]);

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
  } else if (format === 'unscripted') {
      const uData = UNSCRIPTED_FORMATS[unscriptedFormat];
      calculatedWeeklyCost = tier.weeklyCost * uData.productionCostMultiplier;
      calculatedDevWeeks = Math.ceil(tier.developmentWeeks * uData.developmentWeeksModifier);
      calculatedProdWeeks = Math.ceil(episodes * uData.productionWeeksPerEpisode);
      calculatedBudget = calculatedWeeklyCost * calculatedProdWeeks + (tier.budget * 0.1);
  }

  const handleCreate = () => {
    if (!title.trim()) return;

    if (format === 'tv') {
        createProject({ title: title.trim(), format, genre, budgetTier, targetAudience, flavor, tvFormat, episodes, releaseModel, attachedTalentIds: [] });
    } else if (format === 'unscripted') {
        createProject({ title: title.trim(), format, genre, budgetTier, targetAudience, flavor, unscriptedFormat, episodes, releaseModel, attachedTalentIds: [] });
    } else {
        createProject({ title: title.trim(), format, genre, budgetTier, targetAudience, flavor, attachedTalentIds: [] });
    }

    closeCreateProject();
    setTitle('');
    setFlavor('');
  };

  return (
    <Dialog open={showCreateProject} onOpenChange={closeCreateProject}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto bg-card/95 backdrop-blur-xl border-border/50 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-background/50 pointer-events-none rounded-lg" />
        <DialogHeader className="relative z-10 pb-4 border-b border-border/40">
          <DialogTitle className="font-display font-black text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">Greenlight New Project</DialogTitle>
          <DialogDescription className="text-muted-foreground font-medium">Commission a new project. Talent will be attached after greenlight.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 relative z-10 pt-2">
          <div className="space-y-2">
            <Label htmlFor="project-title" className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/80">
              Title <span className="text-destructive">*</span>
            </Label>
            <div className="flex gap-2 group relative">
              <Input id="project-title" required aria-label="Project Title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Untitled Project" className="flex-1 font-display font-bold text-lg h-11 bg-background/50 border-border/50 focus-visible:ring-primary/50 transition-all shadow-inner" />
              <Button type="button" variant="outline" size="icon" onClick={() => setTitle(generateProjectTitle(genre))} title="Generate Random Title" aria-label="Generate Random Title" className="h-11 w-11 shrink-0 bg-background/50 hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all shadow-sm">
                <Dices className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Format */}
          <div className="space-y-2">
            <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/80">Format</Label>
            <div className="flex gap-2 p-1 bg-muted/30 rounded-lg border border-border/40">
              {(['film', 'tv', 'unscripted'] as ProjectFormat[]).map(f => (
                <Button
                  key={f}
                  type="button"
                  variant={format === f ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFormat(f)}
                  className={`flex-1 font-display font-bold tracking-wide transition-all ${format === f ? 'shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {f === 'film' ? 'Film' : f === 'tv' ? 'TV Series' : 'Unscripted'}
                </Button>
              ))}
            </div>
          </div>

          {(format === 'tv' || format === 'unscripted') && (
            <div className="grid grid-cols-2 gap-4">
              {format === 'tv' ? (
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/80">TV Format</Label>
                <Select value={tvFormat} onValueChange={(v) => setTvFormat(v as TvFormatKey)}>
                  <SelectTrigger className="bg-background/50 border-border/50"><SelectValue /></SelectTrigger>
                  <SelectContent className="max-h-80">
                    {TV_FORMAT_TAXONOMY.map(category => (
                      <div key={category.id}>
                        <div className="px-2 py-1.5 text-[10px] font-black uppercase tracking-widest text-primary/60 bg-primary/5 rounded-md my-1">
                          {category.name}
                        </div>
                        {category.formats
                          .filter(fk => TV_FORMATS[fk])
                          .map(fk => (
                            <SelectItem key={fk} value={fk}>
                              {TV_FORMATS[fk].name}
                            </SelectItem>
                          ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              ) : (
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/80">Unscripted Format</Label>
                <Select value={unscriptedFormat} onValueChange={(v) => setUnscriptedFormat(v as UnscriptedFormatKey)}>
                  <SelectTrigger className="bg-background/50 border-border/50"><SelectValue /></SelectTrigger>
                  <SelectContent className="max-h-80">
                    {UNSCRIPTED_FORMAT_TAXONOMY.map(category => (
                      <div key={category.id}>
                        <div className="px-2 py-1.5 text-[10px] font-black uppercase tracking-widest text-primary/60 bg-primary/5 rounded-md my-1">
                          {category.name}
                        </div>
                        {category.formats
                          .filter(fk => UNSCRIPTED_FORMATS[fk])
                          .map(fk => (
                            <SelectItem key={fk} value={fk}>
                              {UNSCRIPTED_FORMATS[fk].name}
                            </SelectItem>
                          ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              )}

              {/* Episodes */}
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-muted-foreground/80">
                  <span>Episodes</span>
                  <span className="text-foreground font-mono bg-muted/50 px-1.5 py-0.5 rounded shadow-inner">{episodes}</span>
                </Label>
                <div className="pt-2">
                  <Slider
                      value={[episodes]}
                      min={format === 'tv' ? TV_FORMATS[tvFormat].minEpisodes : UNSCRIPTED_FORMATS[unscriptedFormat].minEpisodes}
                      max={format === 'tv' ? TV_FORMATS[tvFormat].maxEpisodes : UNSCRIPTED_FORMATS[unscriptedFormat].maxEpisodes}
                      step={1}
                      onValueChange={(val) => setEpisodes(val[0])}
                      className="cursor-pointer"
                  />
                </div>
              </div>

              {/* Release Model */}
              <div className="space-y-2 col-span-2">
                <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/80">Release Model</Label>
                <Select value={releaseModel} onValueChange={(v) => setReleaseModel(v as ReleaseModelKey)}>
                  <SelectTrigger className="bg-background/50 border-border/50"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly Rollout</SelectItem>
                    <SelectItem value="binge">Full Season Binge</SelectItem>
                    <SelectItem value="split">Split Season (2 Parts)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Genre */}
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/80">Genre</Label>
              <Select value={genre} onValueChange={setGenre}>
                <SelectTrigger className="bg-background/50 border-border/50">
                  <SelectValue placeholder="Select Genre" />
                </SelectTrigger>
                <SelectContent className="max-h-80">
                  {GENRE_TAXONOMY.map(category => (
                    <div key={category.id}>
                      <div className="px-2 py-1.5 text-[10px] font-black uppercase tracking-widest text-primary/60 bg-primary/5 rounded-md my-1">
                        {category.name}
                      </div>
                      {category.subGenres.map(sub => (
                        <SelectItem key={sub.id} value={sub.name}>
                          {sub.name}
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Target Audience */}
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/80">Target Audience</Label>
              <Select value={targetAudience} onValueChange={setTargetAudience}>
                <SelectTrigger className="bg-background/50 border-border/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TARGET_AUDIENCES.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Budget Tier */}
          <div className="space-y-2">
            <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/80">Budget Tier</Label>
            <Select value={budgetTier} onValueChange={(v) => setBudgetTier(v as BudgetTierKey)}>
              <SelectTrigger className="bg-background/50 border-border/50"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.values(BUDGET_TIERS).map(t => (
                  <SelectItem key={t.key} value={t.key}>
                    {t.name} ({t.label} Base)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="bg-muted/30 border border-border/40 p-3 rounded-xl mt-2 grid grid-cols-2 gap-x-4 gap-y-2 shadow-inner">
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground/70">Est. Base Budget</span>
                  <span className="text-sm font-semibold text-foreground/80">{formatMoney(calculatedBudget)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground/70">Est. Total Budget</span>
                  <span className="text-sm font-bold text-foreground">{formatMoney(calculatedBudget)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground/70">Est. Weekly Cost</span>
                  <span className="text-xs font-semibold text-destructive">{formatMoney(calculatedWeeklyCost)}/wk</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground/70">Schedule</span>
                  <span className="text-xs font-medium text-foreground/80">Dev {calculatedDevWeeks}w / Prod {calculatedProdWeeks}w</span>
                </div>
            </div>
          </div>

          {/* Talent Info Notice */}
          <div className="flex items-start gap-2 p-3 rounded-xl bg-primary/5 border border-primary/20">
            <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              <span className="font-bold text-foreground">Talent attachment happens after greenlight.</span> First attach producers/writers during development, then cast acting talent and directors for production — just like real Hollywood.
            </p>
          </div>

          {/* Flavor */}
          <div className="space-y-2">
            <Label htmlFor="project-flavor" className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/80">Positioning <span className="text-muted-foreground/50 font-normal">(optional)</span></Label>
            <Input id="project-flavor" aria-label="Project Positioning" value={flavor} onChange={e => setFlavor(e.target.value)} placeholder="A bold reimagining of..." className="bg-background/50 border-border/50 transition-all shadow-inner focus-visible:ring-primary/50" />
          </div>
        </div>

        <DialogFooter className="relative z-10 pt-4 border-t border-border/40 mt-6 sm:justify-between">
          <Button variant="ghost" onClick={closeCreateProject} className="font-medium hover:bg-destructive/10 hover:text-destructive transition-colors">Cancel</Button>
          <Button onClick={handleCreate} disabled={!title.trim()} className="font-display font-bold tracking-wide shadow-sm hover:shadow-[0_0_15px_rgba(234,179,8,0.4)] transition-all">
            Greenlight Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
