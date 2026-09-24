import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter} from "@/components/ui/dialog";
import {FormActions} from "../forms/FormActions";
import {generateProjectTitle} from "@/engine/generators/titles";
import {Sparkles} from "lucide-react";
import {useCreateProjectForm} from "./create-project/useCreateProjectForm";
import {ProjectTitleField} from "./create-project/ProjectTitleField";
import {FormatSelector} from "./create-project/FormatSelector";
import {SeriesConfigFields} from "./create-project/SeriesConfigFields";
import {ProjectMetaFields} from "./create-project/ProjectMetaFields";
import {BudgetTierField} from "./create-project/BudgetTierField";
import {FlavorField} from "./create-project/FlavorField";

/**
 * Modal for initiating a new studio project (Film, TV Series, or Unscripted).
 * Collects essential metadata such as title, format, genre, budget tier, and target audience,
 * then dispatches the project creation to the game store.
 * Field state and budget estimates live in useCreateProjectForm.
 */
export const CreateProjectModal = () => {
  const {
    fields,
    setters,
    estimates,
    canSubmit,
    handleCreate,
    showCreateProject,
    closeCreateProject,
  } = useCreateProjectForm();

  return (
    <Dialog open={showCreateProject} onOpenChange={closeCreateProject}>
      <DialogContent
        className="sm:max-w-[640px] rounded-none border-white/10 bg-black/90 backdrop-blur-2xl shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden"
        aria-describedby={undefined}
      >
        <DialogHeader className="relative z-10 border-b border-white/5 pb-6 mb-4">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          <DialogTitle className="flex items-center gap-3 font-display font-black uppercase italic tracking-tighter text-3xl text-foreground">
            <Sparkles className="w-8 h-8 text-primary animate-pulse" strokeWidth={2.5} />
            Greenlight Project
          </DialogTitle>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 italic">
            Pipeline Protocol • Initialize Asset
          </p>
        </DialogHeader>

        <div className="space-y-5 relative z-10 pt-2">
          <ProjectTitleField
            value={fields.title}
            onChange={setters.setTitle}
            onGenerate={() => setters.setTitle(generateProjectTitle(fields.genre))}
          />

          <FormatSelector value={fields.format} onChange={setters.setFormat} />

          <SeriesConfigFields
            format={fields.format}
            tvFormat={fields.tvFormat}
            onTvFormatChange={setters.setTvFormat}
            unscriptedFormat={fields.unscriptedFormat}
            onUnscriptedFormatChange={setters.setUnscriptedFormat}
            episodes={fields.episodes}
            onEpisodesChange={setters.setEpisodes}
            releaseModel={fields.releaseModel}
            onReleaseModelChange={setters.setReleaseModel}
          />

          <ProjectMetaFields
            genre={fields.genre}
            onGenreChange={setters.setGenre}
            targetAudience={fields.targetAudience}
            onTargetAudienceChange={setters.setTargetAudience}
          />

          <BudgetTierField
            value={fields.budgetTier}
            onChange={setters.setBudgetTier}
            estimates={estimates}
          />

          {/* Talent Attaching Notice */}
          <div className="flex items-center gap-3 text-[9px] text-muted-foreground/30 font-black uppercase tracking-[0.3em] italic px-1">
            <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
            Talent will be attached after greenlight
          </div>

          <FlavorField value={fields.flavor} onChange={setters.setFlavor} />
        </div>

        <DialogFooter className="relative z-10 pt-4 border-t border-border/40 mt-6">
          <FormActions
            align="between"
            className="flex-1"
            onCancel={closeCreateProject}
            onSubmit={handleCreate}
            cancelLabel="Cancel"
            submitLabel="Greenlight Project"
            submitDisabled={!canSubmit}
            submitTooltip={!canSubmit ? "A project title is required to proceed" : undefined}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
