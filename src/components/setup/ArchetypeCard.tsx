import { ArchetypeData } from '@/engine/data/archetypes';
import { ArchetypeKey } from '@/engine/types';
import { formatMoney } from '@/engine/utils';

const archetypeIcons: Record<ArchetypeKey, string> = {
  major: '🏛️',
  'mid-tier': '🎬',
  indie: '🎭',
};

interface ArchetypeCardProps {
  arch: ArchetypeData;
  selected: boolean;
  onSelect: (key: ArchetypeKey) => void;
}

export const ArchetypeCard = ({ arch, selected, onSelect }: ArchetypeCardProps) => {
  return (
    <button
      key={arch.key}
      onClick={() => onSelect(arch.key)}
      className={`relative p-6 rounded-lg border-2 text-left transition-all duration-200 ${
        selected
          ? 'border-primary bg-primary/10 shadow-lg shadow-primary/10'
          : 'border-border bg-card hover:border-muted-foreground/30 hover:bg-accent/50'
      }`}
    >
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{archetypeIcons[arch.key]}</span>
          <div>
            <h3 className="font-display font-bold text-lg text-foreground">{arch.name}</h3>
            <p className="text-xs text-primary font-medium tracking-wider uppercase">{arch.tagline}</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{arch.description}</p>
        <div className="pt-2 border-t border-border flex justify-between text-xs text-muted-foreground">
          <span>Cash: <span className="text-primary font-semibold">{formatMoney(arch.startingCash)}</span></span>
          <span>Prestige: <span className="text-secondary font-semibold">{arch.startingPrestige}</span></span>
        </div>
      </div>
      {selected && (
        <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-primary" />
      )}
    </button>
  );
};
