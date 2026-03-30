import { Buyer, MandateType, Project, ProjectContractType } from '@/engine/types';
import { pick, randRange, secureRandom } from '../utils';

const MANDATE_TYPES: MandateType[] = [
  'sci-fi', 'comedy', 'drama', 'budget_freeze', 'broad_appeal', 'prestige'
];

export function updateBuyers(buyers: Buyer[], currentWeek: number): { updatedBuyers: Buyer[]; newHeadlines: string[] } {
  const updatedBuyers = [...buyers];
  const newHeadlines: string[] = [];

  updatedBuyers.forEach((buyer, index) => {
    // If mandate expired or random 5% chance to shift early
    if (!buyer.currentMandate || buyer.currentMandate.activeUntilWeek <= currentWeek || secureRandom() < 0.05) {
      const newMandateType = pick(MANDATE_TYPES.filter(m => m !== buyer.currentMandate?.type));
      const duration = Math.floor(randRange(12, 36));

      updatedBuyers[index] = {
        ...buyer,
        currentMandate: {
          type: newMandateType,
          activeUntilWeek: currentWeek + duration,
        }
      };

      let headlineText = "";
      switch (newMandateType) {
        case 'sci-fi':
          headlineText = `Industry chatter: ${buyer.name} is desperately looking for the next big Sci-Fi hit.`;
          break;
        case 'comedy':
          headlineText = `${buyer.name} shifts focus, seeking half-hour comedies for their upcoming slate.`;
          break;
        case 'drama':
          headlineText = `New mandate at ${buyer.name}: high-stakes drama is the priority.`;
          break;
        case 'budget_freeze':
          headlineText = `Austerity hits ${buyer.name}! Execs are instituting a sudden budget freeze on new pitches.`;
          break;
        case 'broad_appeal':
          headlineText = `${buyer.name} pivots to four-quadrant, broad appeal projects after subscriber churn.`;
          break;
        case 'prestige':
          headlineText = `Awards chase: ${buyer.name} announces a massive fund specifically for prestige projects.`;
          break;
      }
      if (secureRandom() < 0.6) { // Don't spam headlines every single shift
        newHeadlines.push(headlineText);
      }
    }
  });

  return { updatedBuyers, newHeadlines };
}

export function calculateFitScore(project: Project, buyer: Buyer, currentWeek: number = 0, allProjects: Project[] = []): number {
  let score = 50; // Base score

  // Market Saturation Penalty
  // Calculate dynamic market trend by finding similar genre projects released within the last 52 weeks
  const recentSimilarProjects = allProjects.filter(p =>
    p.status === 'released' &&
    p.genre === project.genre &&
    p.releaseWeek !== null &&
    (currentWeek - p.releaseWeek) <= 52 &&
    p.id !== project.id // exclude self
  );

  let saturationPenalty = recentSimilarProjects.length * 5;

  // Inject trend-modifier: heavy penalty if genre is oversaturated (e.g., >= 5 similar releases)
  // This dynamic market trend math punishes chasing saturated markets, reducing score significantly
  if (recentSimilarProjects.length >= 5) {
    saturationPenalty += 20;
  }

  // New market saturation math: dynamic market trends
  // The Festival Buyer: Heavily penalize oversaturated tentpole genres (like Superhero) to force players to consider market conditions
  // If 5 superhero movies were released last year, buyers should heavily penalize new superhero pitches in the greenlight phase.
  if (recentSimilarProjects.length >= 5 && project.genre.toLowerCase().includes('superhero')) {
    saturationPenalty *= 3; // Tripling the penalty for oversaturated Superhero genre
    saturationPenalty += 75; // Applying an even more massive flat penalty for chasing an exhausted superhero market
  }

  if (saturationPenalty > 0) {
    score -= saturationPenalty;
  }

  // Trend-modifier: Calendar Gap Bonus
  // If there have been no similar projects released in the last 52 weeks, the market is starved for this genre.
  // We inject a positive dynamic market trend bonus here to reward players for finding gaps in the release calendar.
  if (recentSimilarProjects.length === 0) {
    score += 15;
  }

  if (!buyer.currentMandate) return score;

  const mandate = buyer.currentMandate.type;

  // Genre matching
  const lowerGenre = project.genre.toLowerCase();
  if (mandate === 'sci-fi' && (lowerGenre.includes('sci-fi') || lowerGenre.includes('fantasy'))) score += 30;
  if (mandate === 'comedy' && lowerGenre.includes('comedy')) score += 30;
  if (mandate === 'drama' && lowerGenre.includes('drama')) score += 30;

  // Prestige matching
  if (mandate === 'prestige' && project.budgetTier === 'high') score += 20;
  if (mandate === 'prestige' && project.budgetTier === 'blockbuster') score += 10;
  if (mandate === 'prestige' && project.budgetTier === 'low') score -= 20;

  // Broad appeal
  if (mandate === 'broad_appeal' && (project.budgetTier === 'mid' || project.budgetTier === 'high')) score += 20;
  if (mandate === 'broad_appeal' && project.targetAudience.toLowerCase().includes('family')) score += 15;

  // Budget Freeze
  if (mandate === 'budget_freeze') {
    if (project.budgetTier === 'blockbuster') score -= 50;
    if (project.budgetTier === 'high') score -= 30;
    if (project.budgetTier === 'low') score += 20; // They prefer cheap during a freeze
  }

  // Archetype specific preferences
  if (buyer.archetype === 'network' && project.budgetTier === 'blockbuster') score -= 20;
  if (buyer.archetype === 'premium' && project.budgetTier === 'low') score -= 30;

  // Add some randomness and scale by project buzz
  const buzzFactor = (project.buzz / 100) * 20; // Buzz gives up to +20
  score += buzzFactor;
  score += randRange(-10, 10);

  return Math.max(0, Math.min(100, score));
}

export function negotiateContract(project: Project, buyer: Buyer, requestedType: ProjectContractType, currentWeek: number = 0, allProjects: Project[] = []): boolean {
    const fitScore = calculateFitScore(project, buyer, currentWeek, allProjects);

    // Higher threshold for Upfront because the buyer takes all the risk
    const requiredScore = requestedType === 'upfront' ? 65 : 40;

    return fitScore >= requiredScore;
}
