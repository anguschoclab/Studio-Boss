import { Headline, RivalStudio, HeadlineCategory, Project, Contract, Talent } from '@/engine/types';
type TalentProfile = Talent;
import { fillTemplate, pick, secureRandom, getContractsByProjectId } from '../utils';
import { MARKET_HEADLINES, TALENT_HEADLINES, RIVAL_TEMPLATES } from '../data/headlines.data';

let counter = 0;

export function generateHeadlines(
  week: number,
  rivals: RivalStudio[],
  projects: Project[] = [],
  talentPool: TalentProfile[] = [],
  contractsByProjectId?: Record<string, string[]>,
  contractsRecord?: Record<string, Contract>
): Headline[] {
  const count = 1 + Math.floor(secureRandom() * 3);
  const headlines: Headline[] = [];
  const genrePool = ['sci-fi', 'drama', 'action', 'thriller', 'comedy', 'horror', 'fantasy'];

  // Helper: get contracts for a project using the contractsByProjectId index
  const getProjectContracts = (projectId: string): Contract[] => {
    if (contractsByProjectId && contractsRecord) {
      return getContractsByProjectId(contractsByProjectId, contractsRecord, projectId);
    }
    return [];
  };

  // Prepare context for talent headlines
  const projectsWithDirectors = projects.filter(p => {
    const projectContracts = getProjectContracts(p.id);
    return projectContracts.some(c => {
      const talent = talentPool.find(t => t.id === c.talentId);
      return talent?.roles.includes('director');
    });
  });

  const selectedProject = pick(projectsWithDirectors.length > 0 ? projectsWithDirectors : projects);
  const selectedDirector = selectedProject ? (() => {
    const pContracts = getProjectContracts(selectedProject.id);
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
    directorName: selectedDirector?.name || pick(highDrawTalent.filter(t => t.roles.includes('director')))?.name || 'A-list director',
    actorName: pick(actors)?.name || 'Major movie star',
    actressName: pick(actors.slice().reverse())?.name || 'Highly acclaimed actress',
    pct: String(Math.floor(5 + secureRandom() * 25))
  };

  for (let i = 0; i < count; i++) {
    const roll = secureRandom();
    let text: string;
    let category: HeadlineCategory;

    if (roll < 0.35 && rivals.length > 0) {
      const rival = pick(rivals);
      text = fillTemplate(pick(RIVAL_TEMPLATES), {
        ...vars,
        rival: rival.name,
        budget: String(Math.floor(20 + secureRandom() * 180)),
        genre: pick(genrePool),
      });
      category = 'rival';
    } else if (roll < 0.7) {
      text = fillTemplate(pick(MARKET_HEADLINES), vars);
      category = 'market';
    } else {
      text = fillTemplate(pick(TALENT_HEADLINES), vars);
      category = 'talent';
    }

    headlines.push({ id: `h-${++counter}-${week}`, text, week, category });
  }

  return headlines;
}
