import re

with open('src/engine/data/archetypes.ts', 'r') as f:
    content = f.read()

# Add AgencyArchetype
if 'AgencyArchetype' not in content:
    content = content.replace("import { ArchetypeKey } from '../types';", "import { ArchetypeKey, AgencyArchetype } from '../types';")

# Add AGENCY_ARCHETYPES
agency_arch = """
export interface AgencyArchetypeData {
  key: AgencyArchetype;
  name: string;
  description: string;
}

export const AGENCY_ARCHETYPES: Record<AgencyArchetype, AgencyArchetypeData> = {
  powerhouse: {
    key: 'powerhouse',
    name: 'Powerhouse',
    description: 'Identity: The Powerhouse — Controls the biggest stars and demands package deals. Will flat out refuse to work with indie studios or unproven directors.'
  },
  boutique: {
    key: 'boutique',
    name: 'Boutique',
    description: 'Identity: The Boutique — Highly specialized, prioritizing artistic integrity and auteur directors over massive paydays.'
  },
  shark: {
    key: 'shark',
    name: 'Shark',
    description: 'Identity: The Shark — Will ruthlessly negotiate for backend points, poach talent from rivals, and protect their clients from PR crises.'
  }
};
"""

if 'AGENCY_ARCHETYPES' not in content:
    content += "\n" + agency_arch

with open('src/engine/data/archetypes.ts', 'w') as f:
    f.write(content)
