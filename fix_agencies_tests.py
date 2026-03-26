import re

with open('src/engine/generators/agencies.ts', 'r') as f:
    content = f.read()

# I can see that actualName is assigned like `const actualName = name || 'Agency ${i}';` from the original code which I didn't completely overwrite!
# The `generateAgencies` looks like it still has the original code where it picks from `AGENCY_NAMES`.
# My earlier sed/replacement probably failed to match properly. I will rewrite `generateAgencies` entirely using string matching to be safe.

new_gen = """
const POWERHOUSE_PREFIXES = ['United Global', 'Apex', 'Titan', 'Creative Artists', 'William Morrison'];
const BOUTIQUE_PREFIXES = ['Silver Lake', 'Artisan', 'Lighthouse', 'Indie', 'Auteur'];
const SHARK_PREFIXES = ['Viper', 'Goldstein &', 'Predator', 'Ironclad', 'Cutthroat'];

export function generateAgencies(count: number): Agency[] {
  const agencies: Agency[] = [];

  for (let i = 0; i < count; i++) {
    let archetype: AgencyArchetype;
    let actualName = '';

    if (i < 2) {
      archetype = 'powerhouse';
      actualName = pick(POWERHOUSE_PREFIXES) + pick([' Partners', ' Representation', ' Agency', ' Group', ' Collective']);
    } else if (i % 3 === 0) {
      archetype = 'shark';
      actualName = pick(SHARK_PREFIXES) + pick([' Management', ' Media', ' Brokers', ' Associates']);
    } else {
      archetype = 'boutique';
      actualName = pick(BOUTIQUE_PREFIXES) + pick([' Reps', ' Artists', ' Guild', ' Defenders']);
    }

    let tier: AgencyTier;
    if (archetype === 'powerhouse') {
        tier = 'powerhouse';
    } else if (archetype === 'shark') {
        tier = 'major';
    } else {
        tier = pick(['mid-tier', 'boutique', 'specialist']);
    }

    let culture: AgencyCulture;
    if (archetype === 'powerhouse') culture = pick(['shark', 'volume']);
    else if (archetype === 'shark') culture = 'shark';
    else culture = pick(['family', 'prestige']);

    const leverage = archetype === 'powerhouse' ? Math.floor(randRange(85, 100)) : (archetype === 'shark' ? Math.floor(randRange(80, 95)) : Math.floor(randRange(20, 60)));
    const traits: string[] = [];

    if (archetype === 'shark') {
      traits.push('Demands massive backend points');
      traits.push('Aggressive poaching tactics');
    } else if (archetype === 'powerhouse') {
      traits.push('Requires entire package hire');
      traits.push('Refuses to work with indie studios');
    } else {
      traits.push('Only represents auteur directors');
      traits.push('Brings their own script doctor');
    }

    agencies.push({
      id: `agency-${crypto.randomUUID()}`,
      name: actualName,
      archetype,
      tier,
      culture,
      prestige: tier === 'powerhouse' ? Math.floor(randRange(80, 100)) : (tier === 'major' ? Math.floor(randRange(60, 85)) : Math.floor(randRange(30, 70))),
      leverage,
      traits
    });
  }

  return agencies;
}
"""

content = re.sub(r"const AGENCY_NAMES = \[[\s\S]*?export function generateAgencies\(count: number\): Agency\[\] \{[\s\S]*?  return agencies;\n\}", new_gen.strip(), content)

with open('src/engine/generators/agencies.ts', 'w') as f:
    f.write(content)
