import { Project, TvFormatKey, UnscriptedFormatKey } from '../../types';
import { TV_FORMATS } from '../../data/tvFormats';
import { UNSCRIPTED_FORMATS } from '../../data/unscriptedFormats';
import { randRange, clamp } from '../../utils';

/**
 * Rule 4: Dictionary Handler for different TV formats.
 * Volatility and base caps are driven by the format metadata.
 */
export function calculateWeeklyRating(project: Project, baseAppeal: number = 50): number {
  if (project.type !== 'TELEVISION') return 0;

  let volatility = 10;
  let floor = -5;
  let ceiling = 5;

  if (project.tvFormat) {
    const formatData = TV_FORMATS[project.tvFormat];
    if (formatData) {
      // Scripted dramas are stabler, Sitcoms have more variance
      if (project.tvFormat === 'sitcom') volatility = 15;
      else if (project.tvFormat === 'prestige_drama') volatility = 5;
    }
  } else if (project.unscriptedFormat) {
    const formatData = UNSCRIPTED_FORMATS[project.unscriptedFormat];
    if (formatData) {
      // Reality is highly volatile
      if (project.unscriptedFormat === 'dating_island' || project.unscriptedFormat === 'reality_ensemble') {
        volatility = 40;
        floor = -20;
        ceiling = 20;
      }
    }
  }

  const swing = randRange(floor, ceiling) * (volatility / 10);
  const finalRating = clamp(baseAppeal + swing, 1, 100);

  return Math.round(finalRating * 10) / 10; // 1 decimal place
}
