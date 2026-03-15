const fs = require('fs');

let advanceContent = fs.readFileSync('src/engine/core/weekAdvance.ts', 'utf8');

const additionalEvents = `  'Market analysts upgrade entertainment sector outlook.',
  'A high-profile talent dispute makes industry headlines.',
  'Streaming platform announces major content budget increase.',
  'International box office sets new quarterly record.',
  'Film festival announces lineup \u2014 buzz is building.',
  'Regulators announce new content distribution guidelines.',
  'A viral social media trend boosts genre film interest.',
  'Nepotism debate dominates the weekly trades.',
  'Sibling duo announces unexpected co-production.',
  'Famous dynasty patriarch announces retirement.',
  'Former child star attempts a serious prestige comeback.',
  'Public family feud leaks during an awards press tour.'`;

advanceContent = advanceContent.replace(/const EVENT_POOL = \[[^\]]+\];/, `const EVENT_POOL = [\n${additionalEvents}\n];`);

fs.writeFileSync('src/engine/core/weekAdvance.ts', advanceContent);

let headlinesContent = fs.readFileSync('src/engine/generators/headlines.ts', 'utf8');

const additionalTalentHeadlines = `const TALENT_HEADLINES = [
  'A-list director reportedly shopping a passion project around town',
  'Rising star signs multi-picture deal, sending ripples through the industry',
  'Veteran screenwriter comes out of retirement for "one last script"',
  'Casting controversy sparks social media debate over upcoming tentpole',
  'Major talent agency announces restructuring amid industry shifts',
  'Acclaimed cinematographer signs exclusive deal with rival studio',
  'Legacy child demands a rewrite to emphasize their leading role',
  'Industry royalty family packages a prestige drama on their terms',
  'Audiences reject transparent nepotism casting in new blockbuster',
  'Dynasty heir throws a tantrum on set, causing production delays'
];`;

headlinesContent = headlinesContent.replace(/const TALENT_HEADLINES = \[[^\]]+\];/, additionalTalentHeadlines);

fs.writeFileSync('src/engine/generators/headlines.ts', headlinesContent);
