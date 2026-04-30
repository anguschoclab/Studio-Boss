import { UnscriptedFormatKey } from '@/engine/types';

export interface UnscriptedFormatTaxonomyItem {
  id: string;
  name: string;
  formats: UnscriptedFormatKey[];
}

export const UNSCRIPTED_FORMAT_TAXONOMY: UnscriptedFormatTaxonomyItem[] = [
  {
    id: 'competition',
    name: 'Competition & Game Shows',
    formats: ['competition', 'game_show', 'talent_competition', 'baking_championship', 'cooking_battle', 'tattoo_competition', 'fashion_design_competition', 'extreme_baking_wars', 'toddler_chef_competition', 'niche_hobby_competition', 'startup_pitch_wars']
  },
  {
    id: 'dating',
    name: 'Dating & Romance',
    formats: ['dating_island', 'dating_experiment', 'dating_in_the_dark', 'trashy_dating_island', 'poly_dating_experiment', 'poly_dating_drama', 'survival_dating', 'virtual_reality_dating', 'ai_dating_experiment', 'dating_competition', 'celebrity_dating']
  },
  {
    id: 'documentary',
    name: 'Documentary & Docuseries',
    formats: ['docuseries', 'true_crime_doc', 'cult_expose_doc', 'true_con_doc', 'sports_docuseries', 'nature_doc', 'true_crime_docuseries', 'true_crime_cold_case', 'tech_startup_doc', 'cult_survivor_doc', 'child_star_documentary', 'crypto_scam_investigation', 'crypto_scam_expose', 'cult_exposé_doc', 'underground_fight_club_doc', 'true_crime_live_investigation']
  },
  {
    id: 'lifestyle',
    name: 'Lifestyle & Home',
    formats: ['lifestyle', 'home_renovation', 'wedding_reality', 'luxury_real_estate', 'reality_real_estate', 'tiny_house_hunters', 'flea_market_flip', 'vintage_restoration', 'celebrity_house_flip', 'paranormal_renovation', 'makeover_intervention_extreme']
  },
  {
    id: 'reality_drama',
    name: 'Reality Drama',
    formats: ['reality_ensemble', 'celebrity_reality', 'polygamy_doc', 'plastic_surgery', 'hoarder_cleanup', 'extreme_cheapskates', 'influencer_house', 'luxury_yacht_crew', 'billionaire_yacht_crew', 'sports_wives_drama', 'rich_kids_survival', 'billionaire_lifestyle']
  },
  {
    id: 'survival_adventure',
    name: 'Survival & Adventure',
    formats: ['survival_challenge', 'survival_island', 'extreme_fitness', 'gold_mining', 'bounty_hunter', 'treasure_hunting', 'travel_food', 'travel_adventure_race', 'extreme_survival_coop', 'survival_betrayal', 'influencer_survival', 'celebrity_farm_survival', 'space_tourism_reality', 'extreme_job_swap']
  },
  {
    id: 'celebrity',
    name: 'Celebrity & Entertainment',
    formats: ['celebrity_reality', 'celebrity_rehab', 'celebrity_dating', 'celebrity_escape_room', 'celebrity_boxing_league', 'celebrity_ghost_hunting', 'celebrity_survival_challenge', 'standup_special_event', 'influencer_boxing_league']
  },
  {
    id: 'food_cooking',
    name: 'Food & Cooking',
    formats: ['cooking_battle', 'baking_championship', 'extreme_cooking', 'baking_disasters', 'amateur_baking_disasters', 'extreme_baking_wars', 'toddler_chef_competition']
  },
  {
    id: 'business',
    name: 'Business & Money',
    formats: ['business_pitch', 'pawn_shop_doc', 'extreme_cheapskates', 'extreme_couponing_wars', 'crypto_millionaire_matchmaker', 'high_stakes_poker', 'startup_pitch_wars']
  },
  {
    id: 'paranormal',
    name: 'Paranormal & Weird',
    formats: ['paranormal_investigation', 'paranormal_reality', 'ghost_hunting_extreme', 'zombie_survival_reality', 'doomsday_preppers_elite']
  },
  {
    id: 'social_experiment',
    name: 'Social Experiments & Pranks',
    formats: ['social_experiment', 'hidden_camera', 'social_media_experiment', 'prank_show_escalation', 'undercover_boss_parody', 'reality_courtroom', 'extreme_cheap_travel_show']
  },
  {
    id: 'pets_nature',
    name: 'Pets & Nature',
    formats: ['pet_rescue', 'wildlife_rescue', 'nature_doc', 'extreme_pet_makeover']
  }
];
