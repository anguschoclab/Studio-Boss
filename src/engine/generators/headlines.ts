import { pick } from '../utils';
import { Headline, RivalStudio, HeadlineCategory, Project, Contract, Talent } from '@/engine/types';
import { fillTemplate } from '../utils';
import { RandomGenerator } from '../utils/rng';
import { 
  MARKET_HEADLINES, 
  TALENT_HEADLINES, 
  RIVAL_TEMPLATES,
  BOX_OFFICE_MILESTONES,
  STREAMING_RECORDS,
  SCANDAL_TEMPLATES,
  DISPUTE_TEMPLATES
} from '../data/headlines.data';

export function generateHeadlines(
  rng: RandomGenerator,
  week: number, 
  rivals: RivalStudio[],
  projects: Project[] = [],
  contracts: Contract[] = [],
  talentPool: Talent[] = []
): Headline[] {
  const count = rng.rangeInt(1, 3);
  const headlines: Headline[] = [];
  const genrePool = ['sci-fi', 'drama', 'action', 'thriller', 'comedy', 'horror', 'fantasy'];

  // Prepare context for talent headlines
  const projectsWithDirectors = projects.filter(p => {
    const projectContracts = contracts.filter(c => c.projectId === p.id);
    return projectContracts.some(c => {
      const talent = talentPool.find(t => t.id === c.talentId);
      return talent?.roles.includes('director');
    });
  });

  const selectedProject = pick(projectsWithDirectors.length > 0 ? projectsWithDirectors : (projects.length > 0 ? projects : []), rng);
  const selectedDirector = selectedProject ? (() => {
    const pContracts = contracts.filter(c => c.projectId === selectedProject.id);
    const dContract = pContracts.find(c => {
      const talent = talentPool.find(t => t.id === c.talentId);
      return talent?.roles.includes('director');
    });
    return talentPool.find(t => t.id === dContract?.talentId);
  })() : null;

  // Enhance context with actors and actresses
  const highDrawTalent = talentPool.filter(t => t.draw > 70);
  const actors = highDrawTalent.filter(t => t.roles.includes('actor'));

  const vars = {
    projectName: selectedProject?.title || 'upcoming blockbuster',
    directorName: selectedDirector?.name || pick(highDrawTalent.filter(t => t.roles.includes('director')), rng)?.name || 'A-list director',
    actorName: pick(actors, rng)?.name || 'Major movie star',
    actressName: pick(actors.slice().reverse(), rng)?.name || 'Highly acclaimed actress',
    pct: String(rng.rangeInt(5, 30)),
    amount: String(rng.rangeInt(100, 900)),
    platform: pick(['Netflix', 'Max', 'Disney+', 'Hulu', 'Prime Video', 'Apple TV+'], rng)
  };

  for (let i = 0; i < count; i++) {
    const roll = rng.next();
    let text: string;
    let category: HeadlineCategory;

    if (roll < 0.20 && rivals.length > 0) {
      const rival = pick(rivals, rng);
      text = fillTemplate(pick(RIVAL_TEMPLATES, rng), {
        ...vars,
        rival: rival.name,
        budget: String(rng.rangeInt(20, 200)),
        genre: pick(genrePool, rng),
      });
      category = 'rival';
    } else if (roll < 0.40) {
      text = fillTemplate(pick(MARKET_HEADLINES, rng), vars);
      category = 'market';
    } else if (roll < 0.60) {
      text = fillTemplate(pick(TALENT_HEADLINES, rng), vars);
      category = 'talent';
    } else if (roll < 0.75) {
      text = fillTemplate(pick(BOX_OFFICE_MILESTONES, rng), {
        ...vars,
        genre: selectedProject?.genre || pick(genrePool, rng)
      });
      category = 'box_office';
    } else if (roll < 0.85) {
      text = fillTemplate(pick(STREAMING_RECORDS, rng), {
        ...vars,
        genre: selectedProject?.genre || pick(genrePool, rng)
      });
      category = 'streaming';
    } else if (roll < 0.95) {
      text = fillTemplate(pick(SCANDAL_TEMPLATES, rng), vars);
      category = 'scandal';
    } else {
      text = fillTemplate(pick(DISPUTE_TEMPLATES, rng), vars);
      category = 'dispute';
    }

    headlines.push({ id: rng.uuid('NWS'), text, week, category });
  }

  return headlines;
}

