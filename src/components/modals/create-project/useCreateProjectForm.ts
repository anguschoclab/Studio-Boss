import {useState, useEffect, useMemo} from "react";
import {useGameStore} from "@/store/gameStore";
import {useUIStore} from "@/store/uiStore";
import {GENRES, TARGET_AUDIENCES} from "@/engine/data/genres";
import {BUDGET_TIERS} from "@/engine/data/budgetTiers";
import {TV_FORMATS} from "@/engine/data/tvFormats";
import {UNSCRIPTED_FORMATS} from "@/engine/data/unscriptedFormats";
import {generateProjectTitle} from "@/engine/generators/titles";
import {
  BudgetTierKey,
  ProjectFormat,
  TvFormatKey,
  UnscriptedFormatKey,
  ReleaseModelKey,
} from "@/engine/types";

/**
 * Form state + derived estimates + submission for the CreateProjectModal.
 * Owns all field state, the title-autogen effect, and the per-format
 * budget/schedule calculation.
 */
export function useCreateProjectForm() {
  const { showCreateProject, closeCreateProject } = useUIStore();
  const createProject = useGameStore((s) => s.createProject) || (() => {});

  const [title, setTitle] = useState("");
  const [format, setFormat] = useState<ProjectFormat>("film");
  const [genre, setGenre] = useState<string>(GENRES[0]);
  const [budgetTier, setBudgetTier] = useState<BudgetTierKey>("mid");
  const [targetAudience, setTargetAudience] = useState<string>(TARGET_AUDIENCES[0]);
  const [flavor, setFlavor] = useState("");
  const [tvFormat, setTvFormat] = useState<TvFormatKey>("prestige_drama");
  const [unscriptedFormat, setUnscriptedFormat] = useState<UnscriptedFormatKey>("competition");
  const [episodes, setEpisodes] = useState<number>(10);
  const [releaseModel, setReleaseModel] = useState<ReleaseModelKey>("weekly");

  useEffect(() => {
    if (showCreateProject && !title) {
      setTitle(generateProjectTitle(genre));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCreateProject, genre]);

  const estimates = useMemo(() => {
    const tier = BUDGET_TIERS[budgetTier];
    let weeklyCost = tier.weeklyCost;
    let devWeeks = tier.developmentWeeks;
    let prodWeeks = tier.productionWeeks;
    let budget = tier.budget;

    if (format === "tv") {
      const tvData = TV_FORMATS[tvFormat];
      weeklyCost = tier.weeklyCost * tvData.productionCostMultiplier;
      devWeeks = Math.ceil(tier.developmentWeeks * tvData.developmentWeeksModifier);
      prodWeeks = Math.ceil(episodes * tvData.productionWeeksPerEpisode);
      budget = weeklyCost * prodWeeks + tier.budget * 0.2;
    } else if (format === "unscripted") {
      const uData = UNSCRIPTED_FORMATS[unscriptedFormat];
      weeklyCost = tier.weeklyCost * uData.productionCostMultiplier;
      devWeeks = Math.ceil(tier.developmentWeeks * uData.developmentWeeksModifier);
      prodWeeks = Math.ceil(episodes * uData.productionWeeksPerEpisode);
      budget = weeklyCost * prodWeeks + tier.budget * 0.1;
    }

    return { weeklyCost, devWeeks, prodWeeks, budget };
  }, [format, budgetTier, tvFormat, unscriptedFormat, episodes]);

  const canSubmit = !!title.trim();

  const handleCreate = () => {
    if (!title.trim()) return;

    createProject({
      title: title.trim(),
      format,
      genre,
      budgetTier,
      targetAudience,
      flavor,
      attachedTalentIds: [],
      ...(format === "tv" ? { tvFormat, episodes, releaseModel } : {}),
      ...(format === "unscripted" ? { unscriptedFormat, episodes, releaseModel } : {}),
    });

    closeCreateProject();
    setTitle("");
    setFlavor("");
  };

  return {
    fields: {
      title,
      format,
      genre,
      budgetTier,
      targetAudience,
      flavor,
      tvFormat,
      unscriptedFormat,
      episodes,
      releaseModel,
    },
    setters: {
      setTitle,
      setFormat,
      setGenre,
      setBudgetTier,
      setTargetAudience,
      setFlavor,
      setTvFormat,
      setUnscriptedFormat,
      setEpisodes,
      setReleaseModel,
    },
    estimates,
    canSubmit,
    handleCreate,
    showCreateProject,
    closeCreateProject,
  };
}
