import {Label} from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {GENRES, TARGET_AUDIENCES} from "@/engine/data/genres";

interface ProjectMetaFieldsProps {
  genre: string;
  onGenreChange: (value: string) => void;
  targetAudience: string;
  onTargetAudienceChange: (value: string) => void;
}

/**
 * Genre + target audience selects, rendered side-by-side.
 */
export const ProjectMetaFields = ({
  genre,
  onGenreChange,
  targetAudience,
  onTargetAudienceChange,
}: ProjectMetaFieldsProps) => (
  <div className="grid grid-cols-2 gap-6">
    <div className="space-y-2">
      <Label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/40 font-black italic">
        Genre
      </Label>
      <Select value={genre} onValueChange={onGenreChange}>
        <SelectTrigger
          aria-label="Genre"
          className="h-12 bg-black/40 border-white/5 rounded-none font-display font-black italic uppercase tracking-tight text-xs"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="rounded-none border-white/10 bg-black/95 backdrop-blur-xl">
          {GENRES.map((g) => (
            <SelectItem
              key={g}
              value={g}
              className="rounded-none font-display font-black italic uppercase text-[10px] tracking-widest py-3"
            >
              {g}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    <div className="space-y-2">
      <Label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/40 font-black italic">
        Target Audience
      </Label>
      <Select value={targetAudience} onValueChange={onTargetAudienceChange}>
        <SelectTrigger
          aria-label="Target Audience"
          className="h-12 bg-black/40 border-white/5 rounded-none font-display font-black italic uppercase tracking-tight text-xs"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="rounded-none border-white/10 bg-black/95 backdrop-blur-xl">
          {TARGET_AUDIENCES.map((aud) => (
            <SelectItem
              key={aud}
              value={aud}
              className="rounded-none font-display font-black italic uppercase text-[10px] tracking-widest py-3"
            >
              {aud}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  </div>
);
