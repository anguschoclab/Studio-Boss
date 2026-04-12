import { Buyer, MandateType, Project, ProjectContractType, StateImpact } from '@/engine/types';
import { RandomGenerator } from '../utils/rng';

const MANDATE_TYPES: MandateType[] = [
  'sci-fi', 'comedy', 'drama', 'budget_freeze', 'broad_appeal', 'prestige'
];

const AVAILABLE_MANDATES = new Map<string, MandateType[]>();
AVAILABLE_MANDATES.set('none', MANDATE_TYPES);
for (let i = 0; i < MANDATE_TYPES.length; i++) {
  const type = MANDATE_TYPES[i];
  AVAILABLE_MANDATES.set(type, MANDATE_TYPES.filter(m => m !== type));
}

export function updateBuyers(buyers: Buyer[], currentWeek: number, rng: RandomGenerator): StateImpact {
  const impact: StateImpact = {
    buyerUpdates: [],
    newHeadlines: []
  };

  buyers.forEach((buyer) => {
    if (!buyer.currentMandate || buyer.currentMandate.activeUntilWeek <= currentWeek || rng.next() < 0.05) {
      const currentType = buyer.currentMandate?.type || 'none';
      const availableTypes = AVAILABLE_MANDATES.get(currentType) || MANDATE_TYPES;
      const newMandateType = rng.pick(availableTypes);
      const duration = Math.floor(rng.range(12, 36));

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
      
      if (headlineText && rng.next() < 0.6) { 
        impact.newHeadlines!.push({
          id: rng.uuid('NWS'),
          week: currentWeek,
          category: 'market',
          text: headlineText
        });
      }
    }
  });

  return impact;
}

export function calculateFitScore(project: Project, buyer: Buyer, currentWeek: number, allProjects: Record<string, Project>, rng: RandomGenerator): number {
  let score = 50; 

  let recentSimilarProjectsCount = 0;
  for (const key in allProjects) {
    if (!Object.prototype.hasOwnProperty.call(allProjects, key)) continue;
    const p = allProjects[key];
    if (
      p.state === 'released' &&
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

  if (recentSimilarProjectsCount >= 5 && project.genre?.toLowerCase().includes('superhero')) {
    saturationPenalty *= 3;
    saturationPenalty += 75;
  }

  if (saturationPenalty > 0) {
    score -= saturationPenalty;
  }

  if (recentSimilarProjectsCount === 0) {
    score += 15;
  }

  if (buyer.currentMandate) {
    const mandate = buyer.currentMandate.type;
    const lowerGenre = project.genre.toLowerCase();
    if (mandate === 'sci-fi' && (lowerGenre.includes('sci-fi') || lowerGenre.includes('fantasy'))) score += 30;
    if (mandate === 'comedy' && lowerGenre.includes('comedy')) score += 30;
    if (mandate === 'drama' && lowerGenre.includes('drama')) score += 30;

    if (mandate === 'prestige' && project.budgetTier === 'high') score += 20;
    if (mandate === 'prestige' && project.budgetTier === 'blockbuster') score += 10;
    if (mandate === 'prestige' && project.budgetTier === 'low') score -= 20;

    if (mandate === 'broad_appeal' && (project.budgetTier === 'mid' || project.budgetTier === 'high')) score += 20;
    if (mandate === 'broad_appeal' && project.targetAudience.toLowerCase().includes('family')) score += 15;

    // 🎭 The Method Actor Tuning: Buyers experiencing a "budget_freeze" mandate will aggressively target low-budget projects and heavily penalize blockbusters.
    if (mandate === 'budget_freeze') {
      if (project.budgetTier === 'blockbuster') score -= 60;
      if (project.budgetTier === 'high') score -= 40;
      if (project.budgetTier === 'low') score += 35;
    }
  }

  if (buyer.archetype === 'network' && project.budgetTier === 'blockbuster') score -= 20;
  if (buyer.archetype === 'premium' && project.budgetTier === 'low') score -= 30;

  // 🎭 The Method Actor Tuning: Network buyers heavily penalize low-buzz projects as they require immediate viewership, whereas Premium buyers take risks on low-budget prestige projects.
  if (buyer.archetype === 'network' && project.buzz < 40) score -= 25;
  const scriptHeat = 'scriptHeat' in project ? (project as any).scriptHeat : 50;
  if (buyer.archetype === 'premium' && project.budgetTier === 'low' && scriptHeat > 70) score += 20;

  const buzzFactor = (project.buzz / 100) * 20; 
  score += buzzFactor;
  score += rng.range(-10, 10);

  return Math.max(0, Math.min(100, score));
}

export function negotiateContract(project: Project, buyer: Buyer, requestedType: ProjectContractType, currentWeek: number, allProjects: Record<string, Project>, rng: RandomGenerator): boolean {
    const fitScore = calculateFitScore(project, buyer, currentWeek, allProjects, rng);
    const requiredScore = requestedType === 'upfront' ? 65 : 40;
    return fitScore >= requiredScore;
}
