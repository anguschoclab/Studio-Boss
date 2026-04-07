import { UnscriptedFormatKey } from '@/engine/types';

export interface UnscriptedFormatTaxonomyItem {
  id: string;
  name: string;
  formats: UnscriptedFormatKey[];
}

export const UNSCRIPTED_FORMAT_TAXONOMY: UnscriptedFormatTaxonomyItem[] = [
  {
    id: 'UTX-88bb97c1-8b01-5282-b7e1-8f5a5e30',
    name: 'Competition & Game Shows',
    formats: ['USF-43d3c07f-53dd-c40f-c5dd-8c6b939b', 'USF-9797a13c-f27d-aefc-11e8-7cd7ec5c', 'USF-50e167f2-8fe8-7f70-bdfa-d9bf14ff', 'USF-5c7ad721-2b33-e09b-d48f-681fd73f', 'USF-9bf8a72f-65f4-ddc9-8cc6-0fa6f8ef', 'USF-40c054e1-d621-108d-2a11-9bc08731', 'USF-6b9fe837-c014-594c-6b53-dc1f5774', 'USF-5cb39dd9-eedd-84bf-8e62-850e8494', 'USF-0b8bb7bb-79ae-2ccd-82b2-4b2404c2', 'USF-c81c4ed2-ebef-f141-fbee-ff967f2db225', 'USF-3cc51981-4be6-b48b-4e9b-6f2decd9']
  },
  {
    id: 'UTX-a220819e-f002-7c8a-c159-d15d4cd6',
    name: 'Dating & Romance',
    formats: ['USF-daa7d189-075a-adc7-7f0d-7700c4e7', 'USF-5de22f03-c473-e9f9-7b3b-74639bd6', 'USF-e8190ae3-3725-ffec-4404-d2a4f922', 'USF-1c9527c4-a31f-243a-cfad-8d4621b4', 'USF-fcab0a5a-cd86-5785-02e1-f228bb04', 'USF-77f06fea-0733-ca6c-4e24-f64a2b22', 'USF-5f6ee0eb-a2fa-cd81-30cb-3424ec28', 'USF-994bd22d-f146-a6f8-5fa3-648c1b8d', 'USF-43dbdcd7-d43d-7225-8ffb-bfa57574', 'USF-d10a564e-8a2d-f691-29d8-c05993a7', 'USF-980a712a-2452-01cf-4041-5876cd40']
  },
  {
    id: 'UTX-c9cdd78a-388f-b2b5-8d7e-de0e0b87',
    name: 'Documentary & Docuseries',
    formats: ['docuseries', 'true_crime_doc', 'cult_expose_doc', 'true_con_doc', 'sports_docuseries', 'nature_doc', 'true_crime_docuseries', 'true_crime_cold_case', 'tech_startup_doc', 'cult_survivor_doc', 'child_star_documentary', 'crypto_scam_investigation', 'crypto_scam_expose', 'cult_exposé_doc', 'underground_fight_club_doc', 'true_crime_live_investigation']
  },
  {
    id: 'UTX-5f11f0da-da72-b9bb-fbfe-78ca3183',
    name: 'Lifestyle & Home',
    formats: ['lifestyle', 'home_renovation', 'wedding_reality', 'luxury_real_estate', 'reality_real_estate', 'tiny_house_hunters', 'flea_market_flip', 'vintage_restoration', 'celebrity_house_flip', 'paranormal_renovation', 'makeover_intervention_extreme']
  },
  {
    id: 'UTX-1a2325e6-e0e1-e73a-704c-c7f1e093',
    name: 'Reality Drama',
    formats: ['reality_ensemble', 'celebrity_reality', 'polygamy_doc', 'plastic_surgery', 'hoarder_cleanup', 'extreme_cheapskates', 'influencer_house', 'luxury_yacht_crew', 'billionaire_yacht_crew', 'sports_wives_drama', 'rich_kids_survival', 'billionaire_lifestyle']
  },
  {
    id: 'UTX-26e36d8a-7a2b-e8f6-1091-744012e8',
    name: 'Survival & Adventure',
    formats: ['survival_challenge', 'survival_island', 'extreme_fitness', 'gold_mining', 'bounty_hunter', 'treasure_hunting', 'travel_food', 'travel_adventure_race', 'extreme_survival_coop', 'survival_betrayal', 'influencer_survival', 'celebrity_farm_survival', 'space_tourism_reality', 'extreme_job_swap']
  },
  {
    id: 'UTX-b2a2e0bc-dfdd-c075-2402-7639839d',
    name: 'Celebrity & Entertainment',
    formats: ['celebrity_reality', 'celebrity_rehab', 'celebrity_dating', 'celebrity_escape_room', 'celebrity_boxing_league', 'celebrity_ghost_hunting', 'celebrity_survival_challenge', 'standup_special_event', 'influencer_boxing_league']
  },
  {
    id: 'UTX-d4d54427-d7af-85d9-c0b2-77008cd3',
    name: 'Food & Cooking',
    formats: ['cooking_battle', 'baking_championship', 'extreme_cooking', 'baking_disasters', 'amateur_baking_disasters', 'extreme_baking_wars', 'toddler_chef_competition']
  },
  {
    id: 'UTX-48f28ae1-b962-1377-eac5-58dc80b2',
    name: 'Business & Money',
    formats: ['business_pitch', 'pawn_shop_doc', 'extreme_cheapskates', 'extreme_couponing_wars', 'crypto_millionaire_matchmaker', 'high_stakes_poker', 'startup_pitch_wars']
  },
  {
    id: 'UTX-66bcc7a8-9d5f-f9fa-94f1-e133a16f',
    name: 'Paranormal & Weird',
    formats: ['paranormal_investigation', 'paranormal_reality', 'ghost_hunting_extreme', 'zombie_survival_reality', 'doomsday_preppers_elite']
  },
  {
    id: 'UTX-0eb0308d-862d-0504-20b8-67a6e60b',
    name: 'Social Experiments & Pranks',
    formats: ['social_experiment', 'hidden_camera', 'social_media_experiment', 'prank_show_escalation', 'undercover_boss_parody', 'reality_courtroom', 'extreme_cheap_travel_show']
  },
  {
    id: 'UTX-49488a0b-9679-66c3-1678-757e7939',
    name: 'Pets & Nature',
    formats: ['pet_rescue', 'wildlife_rescue', 'nature_doc', 'extreme_pet_makeover']
  }
];
