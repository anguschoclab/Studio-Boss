import { useSettingsStore, Difficulty, AutosaveFrequency, PolicyKey } from '@/store/settingsStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Settings as SettingsIcon } from 'lucide-react';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

const POLICY_LABELS: { key: PolicyKey; label: string; hint: string }[] = [
  { key: 'allowVanityAttachments', label: 'Allow Vanity Attachments', hint: 'Permit actor-producer vanity packages by default' },
  { key: 'capOverheadDeals', label: 'Cap Overhead Deals', hint: 'Limit simultaneous overhead deals' },
  { key: 'preferExternalWriters', label: 'Prefer External Writers', hint: 'Favor external writers over internal pods' },
  { key: 'requireVeteranShowrunner', label: 'Require Veteran Showrunner', hint: 'Mandate veteran showrunner on high-budget TV' },
  { key: 'autoFlagNepotism', label: 'Auto-Flag Nepotism', hint: 'Flag nepotism optics risks automatically' },
  { key: 'allowAuteurPackages', label: 'Allow Auteur Packages', hint: 'Permit multi-role auteur packages above budget threshold' },
  { key: 'prioritizeOrbitStaffing', label: 'Prioritize Orbit Staffing', hint: 'Prefer company-orbit talent when auto-filling' },
];

export const SettingsModal = ({ open, onClose }: SettingsModalProps) => {
  const {
    reduceMotion,
    autosaveFrequency,
    difficulty,
    allowVanityAttachments,
    capOverheadDeals,
    preferExternalWriters,
    requireVeteranShowrunner,
    autoFlagNepotism,
    allowAuteurPackages,
    prioritizeOrbitStaffing,
    setReduceMotion,
    setAutosaveFrequency,
    setDifficulty,
    setPolicy,
  } = useSettingsStore();

  const difficulties: Difficulty[] = ['relaxed', 'standard', 'cutthroat'];
  const autosaveOptions: AutosaveFrequency[] = ['weekly', 'off'];

  const Toggle = ({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) => (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-6 w-11 rounded-none border transition-all duration-300',
        checked ? 'bg-primary/20 border-primary/50' : 'bg-white/5 border-white/10'
      )}
    >
      <span className={cn('absolute top-0.5 h-4 w-4 transition-all duration-300', checked ? 'left-6 bg-primary' : 'left-0.5 bg-muted-foreground/40')} />
    </button>
  );

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg bg-black/95 backdrop-blur-3xl border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.9)] p-0 rounded-none overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-primary/40 to-primary" />
        <div className="p-10 space-y-8">
          <DialogHeader>
            <DialogTitle className="font-display text-3xl font-black tracking-tighter uppercase italic text-foreground flex items-center gap-3">
              <SettingsIcon className="h-6 w-6 text-primary" /> Studio Configuration
            </DialogTitle>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Preferences & Policy</p>
          </DialogHeader>

          {/* UX preferences */}
          <section className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/50">Experience</h4>
            <div className="flex items-center justify-between border border-white/10 p-4">
              <div>
                <p className="text-sm font-bold text-foreground">Reduce Motion</p>
                <p className="text-[10px] text-muted-foreground/50">Disable tab transitions & animations</p>
              </div>
              <Toggle checked={reduceMotion} onChange={setReduceMotion} label="Reduce motion" />
            </div>
            <div className="flex items-center justify-between border border-white/10 p-4">
              <div>
                <p className="text-sm font-bold text-foreground">Autosave</p>
                <p className="text-[10px] text-muted-foreground/50">Save after each week</p>
              </div>
              <div className="flex gap-2">
                {autosaveOptions.map((opt) => (
                  <Button
                    key={opt}
                    size="sm"
                    variant={autosaveFrequency === opt ? 'default' : 'outline'}
                    onClick={() => setAutosaveFrequency(opt)}
                    className="text-[10px] uppercase tracking-widest"
                  >
                    {opt}
                  </Button>
                ))}
              </div>
            </div>
          </section>

          {/* Difficulty */}
          <section className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/50">Difficulty</h4>
            <div className="flex gap-2">
              {difficulties.map((d) => (
                <Button
                  key={d}
                  variant={difficulty === d ? 'default' : 'outline'}
                  onClick={() => setDifficulty(d)}
                  className="flex-1 text-[10px] uppercase tracking-widest"
                >
                  {d}
                </Button>
              ))}
            </div>
          </section>

          {/* Policy toggles (Design Bible §30.29) */}
          <section className="space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/50">Studio Policy</h4>
            {POLICY_LABELS.map(({ key, label, hint }) => (
              <div key={key} className="flex items-center justify-between border border-white/10 p-3">
                <div className="pr-4">
                  <p className="text-xs font-bold text-foreground">{label}</p>
                  <p className="text-[9px] text-muted-foreground/40">{hint}</p>
                </div>
                <Toggle
                  checked={{
                    allowVanityAttachments,
                    capOverheadDeals,
                    preferExternalWriters,
                    requireVeteranShowrunner,
                    autoFlagNepotism,
                    allowAuteurPackages,
                    prioritizeOrbitStaffing,
                  }[key]}
                  onChange={(v) => setPolicy(key, v)}
                  label={label}
                />
              </div>
            ))}
          </section>
        </div>

        <DialogFooter className="p-6 border-t border-white/10 bg-white/[0.02]">
          <Button onClick={onClose} className="bg-primary text-primary-foreground font-black uppercase w-full">
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
