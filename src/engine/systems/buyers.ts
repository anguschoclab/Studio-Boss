import { Buyer, MandateType, Project, ProjectContractType } from '@/engine/types';
import { StateImpact } from '../types/state.types';
import { pick, randRange, secureRandom } from '../utils';

const MANDATE_TYPES: MandateType[] = [
  'sci-fi', 'comedy', 'drama', 'budget_freeze', 'broad_appeal', 'prestige'
];

// Pre-compute available mandate types per mandate to avoid O(N) array allocations in the loop
const AVAILABLE_MANDATES = new Map<string, MandateType[]>();
AVAILABLE_MANDATES.set('none', MANDATE_TYPES);
for (let i = 0; i < MANDATE_TYPES.length; i++) {
  const type = MANDATE_TYPES[i];
  AVAILABLE_MANDATES.set(type, MANDATE_TYPES.filter(m => m !== type));
}

export function updateBuyers(buyers: Buyer[], currentWeek: number): StateImpact {
  const impact: StateImpact = {
    buyerUpdates: [],
    newHeadlines: []
  };

  buyers.forEach((buyer) => {
    // If mandate expired or random 5% chance to shift early
    if (!buyer.currentMandate || buyer.currentMandate.activeUntilWeek <= currentWeek || secureRandom() < 0.05) {
      const currentType = buyer.currentMandate?.type || 'none';
      const availableTypes = AVAILABLE_MANDATES.get(currentType) || MANDATE_TYPES;
      const newMandateType = pick(availableTypes);
      const duration = Math.floor(randRange(12, 36));

      impact.buyerUpdates!.push({
        buyerId: buyer.id,
        update: {
          currentMandate: {
            type: newMandateType,
            activeUntilWeek: currentWeek + duration,
          }
        }
      });

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
      
      if (headlineText && secureRandom() < 0.6) { // Don't spam headlines every single shift
        impact.newHeadlines!.push({
          category: 'market',
          text: headlineText
        });
      }
    }
  });

  return impact;
}


export function calculateFitScore(project: Project, buyer: Buyer, currentWeek: number = 0, allProjects: Project[] = []): number {
  let score = 50; // Base score

  // Market Saturation Penalty
  // Calculate dynamic market trend by finding similar genre projects released within the last 52 weeks
  // ⚡ Bolt: Replaced O(N) .filter() array allocation with a direct for-loop count to eliminate garbage collection pressure
  let recentSimilarProjectsCount = 0;
  for (let i = 0; i < allProjects.length; i++) {
    const p = allProjects[i];
    if (
      p.status === 'released' &&
      p.genre === project.genre &&
      p.releaseWeek !== null &&
      (currentWeek - p.releaseWeek) <= 52 &&
      p.id !== project.id
    ) {
      recentSimilarProjectsCount++;
    }
  }

  let saturationPenalty = recentSimilarProjectsCount * 5;

  if (recentSimilarProjectsCount >= 5) {
    saturationPenalty += 20;
  }

  // The Festival Buyer: Heavily penalize oversaturated tentpole genres (like Superhero)
  if (recentSimilarProjectsCount >= 5 && project.genre.toLowerCase().includes('superhero')) {
    saturationPenalty *= 3;
    saturationPenalty += 75;
  }

  if (saturationPenalty > 0) {
    score -= saturationPenalty;
  }

  // Trend-modifier: Calendar Gap Bonus
  if (recentSimilarProjectsCount === 0) {
    score += 15;
  }

  // Mandate matching (Skip if no mandate)
  if (buyer.currentMandate) {
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
      if (project.budgetTier === 'low') score += 20;
    }
  }

  // Archetype specific preferences
  if (buyer.archetype === 'network' && project.budgetTier === 'blockbuster') score -= 20;
  if (buyer.archetype === 'premium' && project.budgetTier === 'low') score -= 30;

  // Global modifiers: Buzz and Randomness
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
