const fs = require('fs');

function appendToData(filepath, targetArrayStr, itemsToAdd) {
    let content = fs.readFileSync(filepath, 'utf8');

    // We want to find the EXACT array end to avoid regex issues.
    // e.g. "export const PREFIXES = [" ... "];"
    const startIdx = content.indexOf(`export const ${targetArrayStr} = [`);
    if (startIdx === -1) {
        console.error(`Could not find start of ${targetArrayStr}`);
        return;
    }

    // Find the NEXT ]; after startIdx
    const endIdx = content.indexOf('];', startIdx);
    if (endIdx === -1) {
        console.error(`Could not find end of ${targetArrayStr}`);
        return;
    }

    const before = content.substring(0, endIdx);
    const after = content.substring(endIdx);

    // Trim whitespace and add a comma if there isn't one
    let cleanedBefore = before.trimEnd();
    if (!cleanedBefore.endsWith(',')) {
        cleanedBefore += ',';
    }

    const replacement = cleanedBefore + "\n  " + itemsToAdd.join(",\n  ") + "\n" + after;
    fs.writeFileSync(filepath, replacement);
    console.log(`Updated ${targetArrayStr}`);
}

function appendToTitles(filepath, targetKey, itemsToAdd) {
    let content = fs.readFileSync(filepath, 'utf8');

    // For WORDS objects: e.g. "  ADJECTIVE: [" ... "],"
    let startIdx = content.indexOf(`  ${targetKey}: [`);
    if (startIdx === -1) {
        startIdx = content.indexOf(`  '${targetKey}': [`);
        if (startIdx === -1) {
            startIdx = content.indexOf(`  ${targetKey}: [`); // Try without quotes
        }
    }

    if (startIdx === -1) {
        console.error(`Could not find start of ${targetKey}`);
        return;
    }

    // Find the next "],"
    const endIdx = content.indexOf('],', startIdx);
    if (endIdx === -1) {
        console.error(`Could not find end of ${targetKey}`);
        return;
    }

    const before = content.substring(0, endIdx);
    const after = content.substring(endIdx);

    let cleanedBefore = before.trimEnd();
    if (!cleanedBefore.endsWith(',')) {
        cleanedBefore += ',';
    }

    const joiner = targetKey === 'Drama' || targetKey === 'Sci-Fi' ? ",\n    " : ",\n  ";
    const prefix = targetKey === 'Drama' || targetKey === 'Sci-Fi' ? "\n    " : "\n  ";

    const replacement = cleanedBefore + prefix + itemsToAdd.join(joiner) + "\n  " + after.trimStart();
    fs.writeFileSync(filepath, replacement);
    console.log(`Updated ${targetKey}`);
}


// --- NAMES ---
const namesPath = 'src/engine/data/names.data.ts';
const newPrefixes = [
  "'Vanguard'", "'Paradigm'", "'Synergistic'", "'Optimal'", "'Metrics'", "'Focus-Grouped'", "'A/B-Tested'", "'Demographic'",
  "'Shareholder'", "'Leveraged'", "'Asset'", "'Derivative'", "'Plagiarized'", "'Generative'", "'Prompt-Engineered'",
  "'Tax-Exempt'", "'Subsidized'", "'Offshore'", "'Shell'", "'Laundered'", "'Overleveraged'", "'Boutique'", "'Uncancelled'",
  "'Crypto-Funded'", "'De-Aged'", "'Shelved'", "'Straight-to-Streaming'", "'Zero-Day'", "'Market-Tested'", "'Brand-Safe'",
  "'Four-Quadrant'", "'Ghostwritten'", "'Re-Edited'", "'Director-Jailed'", "'CGI-Heavy'", "'Defamatory'", "'Venture-Backed'",
  "'Crowdfunded'", "'Cash-Grab'", "'Tax-Haven'", "'Pivoting'", "'Monopolized'"
];
const newSuffixes = [
  "'Cartel'", "'Syndicate'", "'Conglomerate'", "'Monopoly'", "'Subsidiary'", "'Holdings'", "'Trust'", "'Hedge Fund'",
  "'Private Equity'", "'Offshore'", "'Tax Haven'", "'Shell Corporation'", "'Content Farm'", "'Clickfarm'", "'Data Mine'",
  "'Algorithm'", "'Metrics'", "'Analytics'", "'Demographics'", "'Focus Group'", "'Deliverables'", "'Synergies'", "'Pipelines'",
  "'Ecosystem'", "'Portfolio'", "'Asset'", "'Web3 Venture'", "'Metaverse Property'", "'NFT Collection'", "'Deepfake'"
];
const newMottos = [
  "'Because art is just a tax write-off.'",
  "'Optimizing the human experience.'",
  "'We buy your dreams and sell them back to you.'",
  "'Quantity has a quality all its own.'",
  "'The algorithm loved it.'",
  "'We focus grouped the soul out of it.'",
  "'Please don\\'t unionize.'",
  "'Replacing our writers with interns.'",
  "'Merchandising rights reserved.'",
  "'We only greenlight existing IP.'",
  "'Content to fold laundry to.'",
  "'We paid for the bots to make it trend.'",
  "'Cancel us, we need the PR.'",
  "'Our CEO makes 400x your salary.'",
  "'Content is a commodity.'",
  "'We own the rights to your nostalgia.'",
  "'Optimized for second screens.'",
  "'Don\\'t read the contract.'",
  "'Artificially inflating box office since 1999.'",
  "'No original ideas allowed.'",
  "'Catering exclusively to demographics.'",
  "'Written by an intern, directed by an algorithm.'",
  "'Pre-approved by the board of directors.'",
  "'We don\\'t make movies, we make content.'",
  "'Because you\\'ll watch anything on a plane.'",
  "'Synergy isn\\'t just a buzzword, it\\'s our religion.'",
  "'We pivot to whatever is trending.'",
  "'Lowering expectations daily.'",
  "'Your subscription is non-refundable.'",
  "'We have the rights, you have the money.'",
  "'Failing upwards.'",
  "'Monetizing your childhood trauma.'"
];

appendToData(namesPath, 'PREFIXES', newPrefixes);
appendToData(namesPath, 'SUFFIXES', newSuffixes);
appendToData(namesPath, 'MOTTOS', newMottos);


// --- HEADLINES ---
const headlinesPath = 'src/engine/data/headlines.data.ts';
const newMarket = [
  "'Audiences walk out of {projectName} complaining about \"unrelatable poor people\"'",
  "'Theater chains consider charging extra for seats with good sightlines'",
  "'Indie cinema declared officially dead for the fourth time this year'",
  "'Quarterly earnings report reveals studio makes more from merchandise than actual films'",
  "'Box office plunges as audiences demand more legacy franchise reboots'",
  "'Venture capitalists pour millions into new startup promising \"algorithm-perfect pacing\"'",
  "'Studios quietly lobby government to classify background actors as \"digital assets\"'",
  "'Mergers and acquisitions heat up as tech giants look to swallow remaining studios'",
  "'Consumer spending on streaming overtakes basic utilities in several major cities'",
  "'Market reacts poorly to studio\\'s decision to release a film under 2 hours long'",
  "'Shareholders demand answers after major tentpole grosses only triple its budget'",
  "'Box office unexpectedly saved by {projectName}, confusing every executive in town'",
  "'Nostalgia bait proves highly lucrative yet again in Q3 financial breakdown'"
];
const newTalent = [
  "'{directorName} insists the boom mic visible in every shot of {projectName} is a \"post-modern commentary\"'",
  "'Lead actor of {projectName} demands their character be digitally inserted into real historical events'",
  "'Studio forces {directorName} to apologize for calling Marvel movies \"theme park rides\" during press tour'",
  "'{actorName} goes method for {projectName}, refuses to shower for three months'",
  "'Crew of {projectName} reports the \"intimacy coordinator\" is just an HR rep with a clipboard'",
  "'{actressName} drops out of {projectName} after realizing she plays a mother to an actor only two years younger'",
  "'Publicist for {actorName} denies rumors of an on-set feud, threatens journalists who ask about it'",
  "'{directorName} spends $10M of the {projectName} budget on acquiring the rights to a single pop song'",
  "'Test audiences for {projectName} confused why {actorName} is attempting a British accent'",
  "'Star of {projectName} claims they were abducted by aliens to avoid doing the morning talk show circuit'",
  "'{directorName} fired from {projectName} after insisting the film needs to be shot entirely on 70mm film'",
  "'{actorName} launches a line of overpriced wellness gummies on the red carpet for {projectName}'",
  "'Studio panics after test audiences for {projectName} declare the villain \"was actually completely right\"'",
  "'{actressName} insists on a \"no eye contact\" clause in her contract for {projectName}'",
  "'{directorName} demands a 10-minute standing ovation at Cannes for {projectName}, hires extras to clap'"
];
const newRival = [
  "'{rival} greenlights a ${budget}M {genre} film based entirely on a 15-second TikTok trend'",
  "'{rival} CEO caught on hot mic calling the fans of their ${budget}M {genre} franchise \"absolute suckers\"'",
  "'{rival} announces their new ${budget}M {genre} cinematic universe will skip theaters and go straight to ad-supported streaming'",
  "'{rival} fires the director of their ${budget}M {genre} film, replacing them with a boardroom committee'",
  "'{rival} attempts to launch a ${budget}M {genre} franchise, but forgets to secure the trademark'",
  "'{rival} spends more on the marketing for their ${budget}M {genre} film than the actual production budget'",
  "'{rival} desperately tries to convince audiences their ${budget}M {genre} reboot is \"not like the other reboots\"'",
  "'{rival} blames the catastrophic failure of their ${budget}M {genre} film on \"superhero fatigue\"'",
  "'{rival} caught paying for positive reviews on Letterboxd for their critically panned ${budget}M {genre} film'",
  "'{rival} announces a ${budget}M {genre} sequel to a film that hasn\\'t even finished shooting yet'",
  "'{rival} insists the unfinished CGI in their ${budget}M {genre} trailer is just \"a stylistic choice\"'",
  "'{rival} greenlights a ${budget}M {genre} origin story for a character nobody remembers'",
  "'{rival} stock plummets after their ${budget}M {genre} tentpole grosses less than an indie horror movie'",
  "'{rival} forces their actors to perform a humiliating TikTok dance to promote their ${budget}M {genre} film'",
  "'{rival} accidentally leaks the entire plot of their ${budget}M {genre} film through a fast-food tie-in'"
];

appendToData(headlinesPath, 'MARKET_HEADLINES', newMarket);
appendToData(headlinesPath, 'TALENT_HEADLINES', newTalent);
appendToData(headlinesPath, 'RIVAL_TEMPLATES', newRival);


// --- TITLES ---
const titlesPath = 'src/engine/generators/titles.ts';
const newAdjectives = [
  "'Demographic-Agnostic'", "'Focus-Group-Approved'", "'Post-Cancellable'", "'Machine-Learned'",
  "'Over-Indexed'", "'Asset-Backed'", "'Risk-Adjusted'", "'Syndication-Ready'", "'Cross-Platform'",
  "'Transmedia'", "'Shareholder-Approved'", "'Vertical-Slice'", "'Hyper-Local'", "'Pre-Packaged'",
  "'Demographic-Driven'", "'IP-Driven'", "'Corporate-Mandated'", "'Focus-Grouped'", "'Tax-Deductible'",
  "'Nostalgia-Bait'", "'Cash-Grab'", "'Venture-Backed'", "'Four-Quadrant'", "'Metrics-Driven'",
  "'Market-Researched'", "'Sanitized'", "'Subsidized'", "'Leveraged'", "'Uncredited'", "'Ghost-Directed'",
  "'Defunct'", "'B-Roll'", "'Delisted'", "'Generative'", "'Syndicated'", "'Ad-Supported'", "'Mid'",
  "'Try-Hard'", "'Desperate'", "'Narcissistic'", "'Chronically-Online'", "'Gaslighting'", "'Overhyped'",
  "'Underfunded'", "'Mismanaged'", "'Gross-Point'"
];
const newNouns = [
  "'Quarterly Earnings'", "'Shareholder Meeting'", "'Boardroom Coup'", "'Hostile Takeover'",
  "'Merger and Acquisition'", "'Tax Loophole'", "'NDA Violation'", "'PR Spin'", "'Damage Control'",
  "'Focus Group Feedback'", "'Audience Retention'", "'Tax Write-Off'", "'Nepo Baby'", "'Pitch Deck'",
  "'Boardroom'", "'Shareholder'", "'Vibe Shift'", "'Deliverable'", "'Asset'", "'Portfolio'",
  "'Ecosystem'", "'Pipeline'", "'Tax Shelter'", "'Shell Corporation'", "'Holding'", "'Monopoly'",
  "'Subsidiary'", "'Data Mine'", "'Web3 Venture'", "'NFT Collection'", "'Demographic Target'",
  "'Market Research'", "'Algorithm'", "'Deepfake'", "'Generative Media'", "'Aggregator'",
  "'Synergy'", "'Metrics'", "'Analytics'", "'Content Solution'", "'Cartel'", "'Notes App'",
  "'Hot Mic'", "'Non-Apology'", "'Stan'", "'Sponsorship'", "'Accountability'", "'Discourse'",
  "'Generational Wealth'", "'Parasocial Relationship'"
];
const newDramaPatterns = [
  "['The', 'ADJECTIVE', 'Focus Group']",
  "['PR Spin', 'and', 'Damage Control']",
  "['The', 'Shareholder', 'Paradox']",
  "['Tax Write-Off', 'in', 'PLACE']",
  "['The', 'Nepo Baby', 'Dilemma']",
  "['Hostile Takeover']",
  "['The', 'ADJECTIVE', 'Boardroom']",
  "['The', 'NDA Violation']",
  "['Metrics', 'and', 'Men']",
  "['Generational Wealth', 'in', 'PLACE']",
  "['The', 'ADJECTIVE', 'Apology Video']",
  "['Notes App', 'Tears']",
  "['The', 'Vibe Shift']",
  "['Quarterly Earnings']"
];
const newSciFiPatterns = [
  "['The', 'ADJECTIVE', 'Algorithm']",
  "['Generative', 'NOUN']",
  "['Beyond the', 'Data Mine']",
  "['The', 'Web3', 'Incident']",
  "['Deepfake', 'Chronicles']",
  "['The', 'Content Solution']",
  "['Project', 'Synergy']",
  "['The', 'Ecosystem']",
  "['NFT Collection', 'Zero']",
  "['The', 'ADJECTIVE', 'Aggregator']",
  "['Machine-Learned', 'Love']",
  "['The', 'Cross-Platform', 'Entity']"
];

appendToTitles(titlesPath, 'ADJECTIVE', newAdjectives);
appendToTitles(titlesPath, 'NOUN', newNouns);
appendToTitles(titlesPath, 'Drama', newDramaPatterns);
appendToTitles(titlesPath, 'Sci-Fi', newSciFiPatterns);
