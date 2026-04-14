import fs from 'fs';
import path from 'path';
import { AIService } from './aiService';

const ARCHIVE_PATH = path.resolve(__dirname, '../data/narrative/archive.json');

/**
 * Autonomous Content Farmer
 * Scans the archive for tiers with < 5 templates and refines them.
 */
async function refillArchive() {
  const archive = JSON.parse(fs.readFileSync(ARCHIVE_PATH, 'utf-8'));
  let changed = false;

  console.log('--- Starting Bard Engine Content Farm ---');

  for (const domain in archive) {
    // Skip Dictionary domain (static constants)
    if (domain === 'Dictionary') continue;

    for (const subDomain in archive[domain]) {
      const subDomainData = archive[domain][subDomain];
      
      // If the sub-domain is a flat array, it's a simple list (handled above by skipping Dictionary, 
      // but added here for safety for other domains that might use flat structures)
      if (Array.isArray(subDomainData)) continue;

      // Handle Tones (if the subdomain contains nested tone objects)
      const possibleTones = Object.keys(subDomainData);
      const isToneStructure = ['Trade', 'Tabloid', 'Social', 'Standard'].some(t => possibleTones.includes(t));

      if (isToneStructure) {
        for (const tone of possibleTones) {
          for (const tier in subDomainData[tone]) {
            await processTier(domain, subDomain, tier, subDomainData[tone][tier], tone);
          }
        }
      } else {
        // Standard intensity-only structure
        for (const tier in subDomainData) {
          await processTier(domain, subDomain, tier, subDomainData[tier]);
        }
      }
    }
  }

  async function processTier(domain: string, subDomain: string, tier: string, templates: string[], tone: string = 'Standard') {
    if (templates.length < 10) {
      console.log(`[DEFICIT] ${domain}.${subDomain}.${tier} (${tone}) has ${templates.length} templates. Refilling...`);
      
      const history = domain === 'Talent' && subDomain === 'Scandal' 
        ? ["{{actor}} was arrested for a DUI last month.", "{{actor}}'s last film flopped after an onset meltdown."]
        : [];

      const newBatch = await AIService.generateNarrativeBatch(domain, subDomain, tier, 10 - templates.length, {
        tone,
        history
      });
      
      if (newBatch.length > 0) {
        templates.push(...newBatch);
        changed = true;
        console.log(`[SUCCESS] Added ${newBatch.length} templates to ${domain}.${subDomain}.${tier}`);
      }
    }
  }

  if (changed) {
    fs.writeFileSync(ARCHIVE_PATH, JSON.stringify(archive, null, 2));
    console.log('--- Archive Updated Successfully ---');
  } else {
    console.log('--- Archive Already Exhaustive. No Refill Needed ---');
  }
}

// Run the script
refillArchive().catch(console.error);
