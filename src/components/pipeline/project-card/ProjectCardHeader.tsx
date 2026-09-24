import {Project} from "@/engine/types";
import {Bookmark, BookmarkCheck} from "lucide-react";
import {cn} from "@/lib/utils";

interface ProjectCardHeaderProps {
  project: Project;
  /** e.g. "S2" for series or "FILM"/"TV"/"UNSCRIPTED". */
  displayFormat: string;
  /** Uppercase budget tier label (e.g. "MID BUDGET"). */
  tierLabel: string;
  bookmarked: boolean;
  onToggleBookmark: () => void;
}

/**
 * Card header: title, genre/tier meta row, bookmark toggle, and format badge.
 */
export const ProjectCardHeader = ({
  project,
  displayFormat,
  tierLabel,
  bookmarked,
  onToggleBookmark,
}: ProjectCardHeaderProps) => (
  <div className="flex items-start justify-between gap-6 relative z-10">
    <div className="min-w-0 space-y-2">
      <h4 className="font-display font-black text-xl text-foreground/90 uppercase tracking-tighter italic truncate group-hover:text-primary transition-all duration-700 leading-none drop-shadow-[0_0_10px_rgba(255,255,255,0.05)]">
        {project.title}
      </h4>
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-black text-muted-foreground/20 uppercase tracking-[0.3em] group-hover:text-muted-foreground/60 transition-all duration-700 italic">
          {project.genre.toUpperCase()}
        </span>
        <span className="text-[10px] text-muted-foreground/10">•</span>
        <span className="text-[10px] font-black text-muted-foreground/20 uppercase tracking-[0.3em] group-hover:text-muted-foreground/60 transition-all duration-700 italic">
          {tierLabel.toUpperCase()}
        </span>
      </div>
    </div>
    <div className="flex items-center gap-3">
      <button
        type="button"
        aria-label={bookmarked ? "Remove bookmark" : "Add bookmark"}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          onToggleBookmark();
        }}
        title={bookmarked ? "Remove bookmark" : "Add bookmark"}
        className={cn(
          "h-8 w-8 flex items-center justify-center border transition-all duration-700 rounded-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-black",
          bookmarked
            ? "bg-primary/10 border-primary/40 text-primary shadow-[0_0_15px_rgba(var(--primary),0.2)]"
            : "bg-white/5 border-white/10 text-muted-foreground/40 hover:text-primary hover:border-primary/40"
        )}
      >
        {bookmarked ? (
          <BookmarkCheck className="h-4 w-4" strokeWidth={3} aria-hidden="true" />
        ) : (
          <Bookmark className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
        )}
      </button>
      <div className="px-3 py-1 bg-white/5 border border-white/10 text-[9px] uppercase tracking-[0.3em] font-black h-fit rounded-none text-muted-foreground/60 group-hover:border-white/30 group-hover:text-foreground transition-all duration-700 italic">
        {displayFormat}
      </div>
    </div>
  </div>
);
