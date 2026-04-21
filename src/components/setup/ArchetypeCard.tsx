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
      className={`relative p-6 rounded-xl border-2 text-left transition-all duration-300 group overflow-hidden ${
        selected
          ? 'border-primary bg-primary/10 shadow-[0_0_20px_rgba(234,179,8,0.2)] scale-[1.02]'
          : 'border-border/50 bg-card/40 backdrop-blur-md hover:border-primary/50 hover:shadow-xl hover:-translate-y-1'
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="space-y-4 relative z-10">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300 ${selected ? 'bg-primary/20 text-primary shadow-[0_0_10px_rgba(234,179,8,0.3)]' : 'bg-muted/50 group-hover:bg-primary/10'}`}>
             <span className="text-3xl drop-shadow-sm">{archetypeIcons[arch.key]}</span>
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <h3 className="font-display font-black text-xl text-foreground tracking-tight group-hover:text-primary transition-colors drop-shadow-sm">{arch.name}</h3>
            <p className="text-[10px] text-primary font-bold tracking-widest uppercase mt-0.5">{arch.tagline}</p>
          </div>
        </div>
        <p className="text-[13px] text-muted-foreground leading-relaxed group-hover:text-foreground/80 transition-colors">{arch.description}</p>
        <div className="pt-4 border-t border-border/40 flex justify-between items-center text-xs text-muted-foreground">
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-widest font-bold">Starting Cash</span>
            <span className="text-primary font-bold text-sm drop-shadow-sm">{formatMoney(arch.startingCash)}</span>
          </div>
          <div className="w-px h-6 bg-border/40" />
          <div className="flex flex-col text-right">
             <span className="text-[9px] uppercase tracking-widest font-bold">Prestige</span>
             <span className="text-secondary font-bold text-sm drop-shadow-sm">{arch.startingPrestige}</span>
          </div>
        </div>
      </div>
      {selected && (
        <div className="absolute top-4 right-4 flex items-center justify-center">
            <div className="absolute w-4 h-4 rounded-full bg-primary/40 animate-ping" />
            <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(234,179,8,0.8)] relative z-10" />
        </div>
      )}
    </button>
  );
};
