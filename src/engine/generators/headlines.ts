import { Headline, RivalStudio, HeadlineCategory, Project, Contract, Talent } from '@/engine/types';
import { fillTemplate } from '../utils';
import { RandomGenerator } from '../utils/rng';
import { MARKET_HEADLINES, TALENT_HEADLINES, RIVAL_TEMPLATES } from '../data/headlines.data';

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

  const selectedProject = rng.pick(projectsWithDirectors.length > 0 ? projectsWithDirectors : (projects.length > 0 ? projects : []));
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
    directorName: selectedDirector?.name || rng.pick(highDrawTalent.filter(t => t.roles.includes('director')))?.name || 'A-list director',
    actorName: rng.pick(actors)?.name || 'Major movie star',
    actressName: rng.pick(actors.slice().reverse())?.name || 'Highly acclaimed actress',
    pct: String(rng.rangeInt(5, 30))
  };

  for (let i = 0; i < count; i++) {
    const roll = rng.next();
    let text: string;
    let category: HeadlineCategory;

    if (roll < 0.35 && rivals.length > 0) {
      const rival = rng.pick(rivals);
      text = fillTemplate(rng.pick(RIVAL_TEMPLATES), {
        ...vars,
        rival: rival.name,
        budget: String(rng.rangeInt(20, 200)),
        genre: rng.pick(genrePool),
      });
      category = 'rival';
    } else if (roll < 0.7) {
      text = fillTemplate(rng.pick(MARKET_HEADLINES), vars);
      category = 'market';
    } else {
      text = fillTemplate(rng.pick(TALENT_HEADLINES), vars);
      category = 'talent';
    }

    headlines.push({ id: rng.uuid('h'), text, week, category });
  }

  return headlines;
}

