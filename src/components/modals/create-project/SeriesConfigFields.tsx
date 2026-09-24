import {Label} from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {ProjectFormat, TvFormatKey, UnscriptedFormatKey, ReleaseModelKey} from "@/engine/types";
import {TV_FORMATS} from "@/engine/data/tvFormats";
import {UNSCRIPTED_FORMATS} from "@/engine/data/unscriptedFormats";
import {Tv} from "lucide-react";

interface SeriesConfigFieldsProps {
  format: ProjectFormat;
  tvFormat: TvFormatKey;
  onTvFormatChange: (value: TvFormatKey) => void;
  unscriptedFormat: UnscriptedFormatKey;
  onUnscriptedFormatChange: (value: UnscriptedFormatKey) => void;
  episodes: number;
  onEpisodesChange: (value: number) => void;
  releaseModel: ReleaseModelKey;
  onReleaseModelChange: (value: ReleaseModelKey) => void;
}

/**
 * TV/Unscripted configuration: format type, episode count, release model.
 * Renders nothing for films.
 */
export const SeriesConfigFields = ({
  format,
  tvFormat,
  onTvFormatChange,
  unscriptedFormat,
  onUnscriptedFormatChange,
  episodes,
  onEpisodesChange,
  releaseModel,
  onReleaseModelChange,
}: SeriesConfigFieldsProps) => {
  if (format === "film") return null;

  const isUnscripted = format === "unscripted";
  const formatData = isUnscripted
    ? UNSCRIPTED_FORMATS[unscriptedFormat]
    : TV_FORMATS[tvFormat];

  return (
    <div className="p-5 bg-white/[0.02] border border-white/5 space-y-6">
      {/* Format type select */}
      {isUnscripted ? (
        <div className="space-y-2">
          <Label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/40 font-black italic">
            Unscripted Format
          </Label>
          <Select
            value={unscriptedFormat}
            onValueChange={(v) => onUnscriptedFormatChange(v as UnscriptedFormatKey)}
          >
            <SelectTrigger
              aria-label="Unscripted Format"
              className="h-12 bg-black/40 border-white/5 rounded-none font-display font-black italic uppercase tracking-tight text-xs"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-none border-white/10 bg-black/95 backdrop-blur-xl">
              {Object.entries(UNSCRIPTED_FORMATS).map(([key, value]) => (
                <SelectItem
                  key={key}
                  value={key}
                  className="rounded-none font-display font-black italic uppercase text-[10px] tracking-widest py-3"
                >
                  {value.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div className="space-y-2">
          <Label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/40 font-black italic">
            TV Format
          </Label>
          <Select
            value={tvFormat}
            onValueChange={(v) => onTvFormatChange(v as TvFormatKey)}
          >
            <SelectTrigger
              aria-label="TV Format"
              className="h-12 bg-black/40 border-white/5 rounded-none font-display font-black italic uppercase tracking-tight text-xs"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-none border-white/10 bg-black/95 backdrop-blur-xl">
              {Object.entries(TV_FORMATS).map(([key, value]) => (
                <SelectItem
                  key={key}
                  value={key}
                  className="rounded-none font-display font-black italic uppercase text-[10px] tracking-widest py-3"
                >
                  {value.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Episodes slider */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/40 font-black italic">
            Episodes
          </Label>
          <span className="text-xs font-display font-black italic text-primary">
            {episodes}
          </span>
        </div>
        <input
          type="range"
          min={formatData.minEpisodes}
          max={formatData.maxEpisodes}
          value={episodes}
          onChange={(e) => onEpisodesChange(parseInt(e.target.value))}
          className="w-full h-1 bg-white/10 appearance-none cursor-pointer accent-primary"
        />
        <div className="flex justify-between text-[8px] text-muted-foreground/30 font-black uppercase tracking-widest">
          <span>{formatData.minEpisodes} eps</span>
          <span>{formatData.maxEpisodes} eps</span>
        </div>
      </div>

      {/* Release model select */}
      <div className="space-y-2">
        <Label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/40 font-black italic">
          Release Model
        </Label>
        <Select
          value={releaseModel}
          onValueChange={(v) => onReleaseModelChange(v as ReleaseModelKey)}
        >
          <SelectTrigger
            aria-label="Release Model"
            className="h-12 bg-black/40 border-white/5 rounded-none font-display font-black italic uppercase tracking-tight text-xs"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-none border-white/10 bg-black/95 backdrop-blur-xl">
            <SelectItem
              value="weekly"
              className="rounded-none font-display font-black italic uppercase text-[10px] tracking-widest py-3"
            >
              Weekly (Episodic)
            </SelectItem>
            <SelectItem
              value="binge"
              className="rounded-none font-display font-black italic uppercase text-[10px] tracking-widest py-3"
            >
              Binge (All at once)
            </SelectItem>
            <SelectItem
              value="hybrid"
              className="rounded-none font-display font-black italic uppercase text-[10px] tracking-widest py-3"
            >
              Hybrid (Split Season)
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-3 pt-2 text-[9px] text-muted-foreground/30 font-black uppercase tracking-[0.3em] italic">
        <Tv className="h-3 w-3 text-primary/40" strokeWidth={3} />
        {isUnscripted
          ? "Lower cost, faster production"
          : "S1 metrics will be calculated dynamically"}
      </div>
    </div>
  );
};
