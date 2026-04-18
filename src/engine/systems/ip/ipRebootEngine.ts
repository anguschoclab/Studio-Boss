import { IPAsset, Project } from '../../types';
import { RandomGenerator } from '../../utils/rng';

export interface RebootProposal {
  assetId: string;
  assetTitle: string;
  assetTier: IPAsset['tier'];
  baseValue: number;
  proposal: Partial<Project>;
  estimatedBuzz: number;
  developmentCostMultiplier: number;
  angle: 'reimagining' | 'legacy_sequel' | 'prequel' | 'reboot';
  logline: string;
}

const REBOOT_ANGLES: Array<{
  angle: RebootProposal['angle'];
  titleSuffix: string;
  loglineTemplate: string;
  buzzBonus: number;
  costMultiplier: number;
}> = [
  {
    angle: 'reimagining',
    titleSuffix: 'Reimagined',
    loglineTemplate: 'A bold creative reinvention of {title} for a new generation, keeping the spirit while updating the vision.',
    buzzBonus: 15,
    costMultiplier: 1.0,
  },
  {
    angle: 'legacy_sequel',
    titleSuffix: 'Legacy',
    loglineTemplate: 'The original cast returns decades later in this long-awaited continuation of {title}.',
    buzzBonus: 25,
    costMultiplier: 1.4,
  },
  {
    angle: 'prequel',
    titleSuffix: 'Origins',
    loglineTemplate: 'Discover the untold backstory behind the world of {title} in this origin story.',
    buzzBonus: 10,
    costMultiplier: 0.9,
  },
  {
    angle: 'reboot',
    titleSuffix: '',
    loglineTemplate: 'A full reboot of {title} with a fresh cast and modern sensibilities, recapturing what fans love.',
    buzzBonus: 20,
    costMultiplier: 1.2,
  },
];

/**
 * Generates a reboot proposal for a random owned IP asset.
 */
export function generateRebootProposal(
  assets: IPAsset[],
  rng: RandomGenerator
): RebootProposal | null {
  const eligible = assets.filter(
    a => a.rightsOwner === 'STUDIO' && (a.tier === 'BLOCKBUSTER' || a.tier === 'LEGACY' || a.tier === 'CULT_CLASSIC')
  );
  if (eligible.length === 0) return null;

  const asset = rng.pick(eligible);
  const angleData = rng.pick(REBOOT_ANGLES);
  const title = angleData.titleSuffix
    ? `${asset.title}: ${angleData.titleSuffix}`
    : asset.title;

  const nostalgiaBonus = Math.min(30, (asset.baseValue / 1_000_000) * 5);
  const estimatedBuzz = Math.min(100, Math.max(10, 30 + Math.floor(nostalgiaBonus) + angleData.buzzBonus));

  const proposal: Partial<Project> = {
    title,
    format: 'film',
    genre: 'Drama',
    budgetTier: asset.tier === 'CULT_CLASSIC' ? 'mid' : 'high',
    buzz: estimatedBuzz,
    flavor: angleData.loglineTemplate.replace('{title}', asset.title),
    parentProjectId: asset.originalProjectId,
    isSpinoff: true,
  };

  return {
    assetId: asset.id ?? asset.originalProjectId,
    assetTitle: asset.title,
    assetTier: asset.tier,
    baseValue: asset.baseValue,
    proposal,
    estimatedBuzz,
    developmentCostMultiplier: angleData.costMultiplier,
    angle: angleData.angle,
    logline: angleData.loglineTemplate.replace('{title}', asset.title),
  };
}

/**
 * Logic for "Rebooting" historical IP.
 * A rebooted project inherits a "Nostalgia Bonus" based on the original IP's success.
 */
export function applyRebootNostalgia(project: Partial<Project>, sourceAsset: IPAsset): Partial<Project> {
  // Nostalgia Factor: If the original was a massive hit (high baseValue), 
  // the reboot starts with a significant Buzz floor.
  // We scale this so a huge hit provides a +30 buzz bump.
  let nostalgiaBonus = Math.min(30, (sourceAsset.baseValue / 1000000) * 5);
  
  // 🌌 The Universe Builder: Cynical IP Retention. If a studio reboots a legacy IP
  // with a low-budget tier just to retain rights, the market punishes it severely.
  let reviewPenalty = 0;
  if (project.budgetTier === 'low') {
    nostalgiaBonus = -25;
    reviewPenalty = 15;
  }

  return {
    ...project,
    buzz: project.buzz !== undefined ? Math.min(100, Math.max(0, project.buzz + Math.floor(nostalgiaBonus))) : project.buzz,
    reviewScore: project.reviewScore ? Math.max(1, project.reviewScore - reviewPenalty) : project.reviewScore,
    isSpinoff: true,
    parentProjectId: sourceAsset.originalProjectId,
    title: project.title || `Untitled ${sourceAsset.title} Reboot`
  };
}
