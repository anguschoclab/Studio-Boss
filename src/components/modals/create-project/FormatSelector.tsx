import {Label} from "@/components/ui/label";
import {Film, Tv} from "lucide-react";
import {ProjectFormat} from "@/engine/types";
import {cn} from "@/lib/utils";

interface FormatSelectorProps {
  value: ProjectFormat;
  onChange: (format: ProjectFormat) => void;
}

export const FormatSelector = ({ value, onChange }: FormatSelectorProps) => (
  <div className="space-y-3">
    <Label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/40 font-black italic">
      Format
    </Label>
    <div className="flex p-1 bg-black/60 rounded-none border border-white/5 w-full shadow-inner">
      <button
        type="button"
        onClick={() => onChange("film")}
        className={cn(
          "flex-1 py-3 px-4 rounded-none text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-700 flex items-center justify-center gap-3 italic",
          value === "film"
            ? "bg-primary/20 text-primary border border-primary/30 shadow-[0_0_15px_rgba(var(--primary),0.2)]"
            : "text-muted-foreground/40 hover:text-foreground/80 border border-transparent"
        )}
      >
        <Film className="h-4 w-4" strokeWidth={2.5} />
        Feature Film
      </button>
      <button
        type="button"
        onClick={() => onChange("tv")}
        className={cn(
          "flex-1 py-3 px-4 rounded-none text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-700 flex items-center justify-center gap-3 italic",
          value === "tv"
            ? "bg-primary/20 text-primary border border-primary/30 shadow-[0_0_15px_rgba(var(--primary),0.2)]"
            : "text-muted-foreground/40 hover:text-foreground/80 border border-transparent"
        )}
      >
        <Tv className="h-4 w-4" strokeWidth={2.5} />
        TV Series
      </button>
      <button
        type="button"
        onClick={() => onChange("unscripted")}
        className={cn(
          "flex-1 py-3 px-4 rounded-none text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-700 flex items-center justify-center gap-3 italic",
          value === "unscripted"
            ? "bg-primary/20 text-primary border border-primary/30 shadow-[0_0_15px_rgba(var(--primary),0.2)]"
            : "text-muted-foreground/40 hover:text-foreground/80 border border-transparent"
        )}
      >
        <Tv className="h-4 w-4" strokeWidth={2.5} />
        Unscripted
      </button>
    </div>
  </div>
);
