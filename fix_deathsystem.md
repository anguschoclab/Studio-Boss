<<<<<<< SEARCH
  const { coStarIds, griefLevel } = calculateGriefImpact(
    state.entities.talents?.[deathEvent.talentId]!,
    state
  );
=======
  const deadTalent = state.entities.talents?.[deathEvent.talentId];
  if (!deadTalent) return impacts;

  const { coStarIds, griefLevel } = calculateGriefImpact(
    deadTalent,
    state
  );
>>>>>>> REPLACE
<<<<<<< SEARCH
    impacts.push({
      type: "SYSTEM_TICK",
      payload: {
        deathEvents,
        deathCount: deathEvents.length,
      },
    } as any);
=======
    impacts.push({
      type: "SYSTEM_TICK",
      payload: {
        deathEvents,
        deathCount: deathEvents.length,
      },
    } as unknown as StateImpact);
>>>>>>> REPLACE
<<<<<<< SEARCH
export function getDeathStatistics(
  state: GameState,
  weeks: number = 52
): {
=======
export function getDeathStatistics(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _state: GameState,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _weeks: number = 52
): {
>>>>>>> REPLACE
