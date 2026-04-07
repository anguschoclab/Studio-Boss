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
    formats: ['USF-48a00125-5154-ba24-4ab4-c91480a2', 'USF-d22654ac-142b-5759-6291-7ea95667', 'USF-45407068-5e63-77d2-8333-826dec65', 'USF-95cfaa39-4fa0-4044-8107-fcd826b9', 'USF-3e841f73-2194-ac92-1646-37d3130f', 'USF-c609ac9a-0006-dd98-6c4e-7d1aaf8f', 'USF-4cd0f127-7e3e-2f6a-e2e4-b0675975', 'USF-7fe93bb0-cdc7-be10-f21e-150b0637', 'USF-624be257-9011-3c81-5b89-75a75bca', 'USF-4b733f64-97e9-f30a-dd53-79bb9445', 'USF-509a4929-e602-455f-7089-c1640917', 'USF-187994ab-1f67-d24f-8ea6-1f214fc5', 'USF-ea4863f6-b432-1f72-1239-4c26e52d', 'USF-46aa5e67-96d1-fb7f-265d-a25214a6', 'USF-c3798113-11ca-5003-c7b5-68e671d0', 'USF-b8888d29-4bb3-ef52-aeae-a7220a93']
  },
  {
    id: 'UTX-5f11f0da-da72-b9bb-fbfe-78ca3183',
    name: 'Lifestyle & Home',
    formats: ['USF-22aabad8-6359-691d-4ca3-f517411b', 'USF-8246534a-a00d-9461-62b3-a7477190', 'USF-050b1f34-09bc-fdac-f936-00ba6af6', 'USF-6572a5f9-d119-ffa1-be76-8126b56e', 'USF-85e0e162-7a68-4757-8e72-adf6d1c2', 'USF-e4cd62a4-3d4c-80f4-74a8-5571895e', 'USF-3af4ed44-8d9c-ba93-e912-8fdf230e', 'USF-1491f6b2-179e-4078-2e5a-06560d22', 'USF-52de8643-b2b2-3dd4-8c71-9dc3f31e', 'USF-4bcfd3ec-8986-e47c-a05a-2c163930', 'USF-40c054e1-d621-108d-2a11-9bc08731']
  },
  {
    id: 'UTX-1a2325e6-e0e1-e73a-704c-c7f1e093',
    name: 'Reality Drama',
    formats: ['USF-c53cddac-c5db-4ff5-90ee-58c2a532', 'USF-9651e62a-3ecd-1c80-59aa-20f263ed', 'USF-559ad50d-6099-0964-3093-d9d952e8', 'USF-06c05aef-10e1-eb70-e18a-1850a326', 'USF-0bb66a02-f0b4-fa03-1220-e0aab43a', 'USF-d54e94ee-721a-7cb8-106b-2050e8e5', 'USF-dcaeb121-cc49-85a3-c66c-bf56570b', 'USF-737c9451-3d2e-c1a1-e982-6b1f4bc0', 'USF-e5532c01-b55f-70f5-2201-28d17e75', 'USF-ea86167b-5584-cecf-f7eb-1fddba61', 'USF-45204860-f70b-1b2e-a6cd-2cd594a0', 'USF-4f7e9096-94ad-7c57-7c04-02695556']
  },
  {
    id: 'UTX-26e36d8a-7a2b-e8f6-1091-744012e8',
    name: 'Survival & Adventure',
    formats: ['USF-50066227-37dd-42fe-f9fa-3552d3b7', 'USF-29a417b3-1c2a-8afe-3099-c39b249e', 'USF-c2697e69-cce9-55e1-b188-04280833', 'USF-e8190ae3-3725-ffec-4404-d2a4f922', 'USF-a40d50e4-5d13-dc4b-09e9-7fda852d', 'USF-21058841-ed4b-d1c9-1995-77ea6cc3', 'USF-fd0bf421-58dd-0a20-e803-a45551fb', 'USF-832ac67a-aed8-6abd-f1a6-13f90250', 'USF-403d4f29-31d6-084f-a274-de082adb', 'USF-309dc467-48f1-2eff-58c2-e71f5166', 'USF-a2a94577-6fa2-168c-a432-cca67a65', 'USF-2426fc3a-6cc0-e0a7-3c1e-1cfcd726', 'USF-b3595514-2169-3c92-e78b-2284e1dc', 'USF-47c1e9a8-a011-e4e3-864e-6e8828cd']
  },
  {
    id: 'UTX-b2a2e0bc-dfdd-c075-2402-7639839d',
    name: 'Celebrity & Entertainment',
    formats: ['USF-9651e62a-3ecd-1c80-59aa-20f263ed', 'USF-b67cdc7a-fb89-61c7-7d58-6dd38828', 'USF-2df8dff4-4dab-076e-d2e6-d87177df', 'USF-03c3c546-002a-9a3d-a96d-3df86ed8', 'USF-ecbf1081-660a-f165-d443-a5bd8173', 'USF-db6f256d-7657-3fc8-a639-0c5de875', 'USF-401ace3a-30ce-ec34-13c5-b6af79a9', 'USF-bbf471b1-ee34-dafd-b73b-e5414ba7', 'USF-cdf8f0b7-7b29-96bf-4550-458ecff2']
  },
  {
    id: 'UTX-d4d54427-d7af-85d9-c0b2-77008cd3',
    name: 'Food & Cooking',
    formats: ['USF-9bf8a72f-65f4-ddc9-8cc6-0fa6f8ef', 'USF-103b8329-a985-f91a-9d7f-71b84150', 'USF-530ac596-03c4-4e3b-a5a1-b6aaa1de', 'USF-8af04dda-20a5-8778-9df0-d2564a2d', 'USF-4c1aa860-6b14-6595-e27b-b60303a3', 'USF-1340e9a8-e285-650b-80f8-d1c066e9', 'USF-937a5263-d177-20ba-1bde-be9471aa']
  },
  {
    id: 'UTX-48f28ae1-b962-1377-eac5-58dc80b2',
    name: 'Business & Money',
    formats: ['USF-465cd66a-de29-3507-4988-a69ec1d5', 'USF-c75667be-983d-859f-cf68-3607172a', 'USF-d54e94ee-721a-7cb8-106b-2050e8e5', 'USF-05cfe2f9-4e47-c9d8-40ef-5b496619', 'USF-0a6f7275-b494-6415-e3b0-c648ad6a', 'USF-b60b3d9e-0ae1-914f-895f-caf8f942', 'USF-343dd99c-5dc8-0e2b-c2c0-667d56b4']
  },
  {
    id: 'UTX-66bcc7a8-9d5f-f9fa-94f1-e133a16f',
    name: 'Paranormal & Weird',
    formats: ['USF-7c193667-f493-5700-32ca-97893f13', 'USF-80aacbaa-de15-3b5d-a697-b7cad875', 'USF-f1e0839e-7bf1-e41c-344d-191755fb', 'USF-f92e898b-89e8-f672-f5c4-df3e2f52', 'USF-c54466cf-5595-9bdb-6a7b-6493562d']
  },
  {
    id: 'UTX-0eb0308d-862d-0504-20b8-67a6e60b',
    name: 'Social Experiments & Pranks',
    formats: ['USF-5de22f03-c473-e9f9-7b3b-74639bd6', 'USF-e1b9e510-7907-e2da-42ab-07015a02', 'USF-e371e555-8b58-810c-e4cd-e6b40e3a', 'USF-bd08ac1e-b94c-48ef-58dd-e76f4144', 'USF-cb34c6e8-9655-2987-d818-341856bb', 'USF-ebad5b9c-37bb-a426-afb9-192e8136', 'USF-49ab27b1-e478-465d-5d48-f3fb2a5c']
  },
  {
    id: 'UTX-49488a0b-9679-66c3-1678-757e7939',
    name: 'Pets & Nature',
    formats: ['USF-012f44a7-a895-07f0-b46f-c45748a9', 'USF-29fc0966-a3ee-bc12-f20d-cef244b1', 'USF-c609ac9a-0006-dd98-6c4e-7d1aaf8f', 'USF-d50f47c2-596c-f4af-de4b-3c1735db']
  }
];
