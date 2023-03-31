import config from '../config';

/**
 * Adventurers League
 */
const SRC_AL_PREFIX = 'AL';
const AL_PREFIX = 'Adventurers League: ';
/**
 * Plane Shift
 */
const SRC_PS_PREFIX = 'PS';
const PS_PREFIX = 'Plane Shift: ';
/**
 * Unearthed Archana
 */
const SRC_UA_PREFIX = 'UA';
const UA_PREFIX = 'Unearthed Arcana: ';
/**
 * Tales from the Yawning Portal
 */
const SRC_TYP_PREFIX = 'Tf';
const TYP_NAME = 'Tales from the Yawning Portal';

/**
 * Map of All Source Abbreviations to Full Names
 * Ported from [Fantasy Statblocks](https://github.com/valentine195/fantasy-statblocks)
 */
export const SOURCE_JSON_TO_FULL: { [abbreviation: string]: string } = {
  CoS: 'Curse of Strahd',
  DMG: "Dungeon Master's Guide",
  EEPC: "Elemental Evil Player's Companion",
  EET: 'Elemental Evil: Trinkets',
  HotDQ: 'Hoard of the Dragon Queen',
  LMoP: 'Lost Mine of Phandelver',
  Mag: 'Dragon Magazine',
  MM: 'Monster Manual',
  OotA: 'Out of the Abyss',
  PHB: "Player's Handbook",
  PotA: 'Princes of the Apocalypse',
  RoT: 'The Rise of Tiamat',
  RoTOS: 'The Rise of Tiamat Online Supplement',
  SCAG: "Sword Coast Adventurer's Guide",
  SKT: "Storm King's Thunder",
  ToA: 'Tomb of Annihilation',
  ToD: 'Tyranny of Dragons',
  TTP: 'The Tortle Package',
  [`${SRC_TYP_PREFIX}tYP`]: TYP_NAME,
  [`${SRC_TYP_PREFIX}-AtG`]: `${TYP_NAME}: Against the Giants`,
  [`${SRC_TYP_PREFIX}-DiT`]: `${TYP_NAME}: Dead in Thay`,
  [`${SRC_TYP_PREFIX}-TFoF`]: `${TYP_NAME}: The Forge of Fury`,
  [`${SRC_TYP_PREFIX}-THSoT`]: `${TYP_NAME}: The Hidden Shrine of Tamoachan`,
  [`${SRC_TYP_PREFIX}-TSC`]: `${TYP_NAME}: The Sunless Citadel`,
  [`${SRC_TYP_PREFIX}-ToH`]: `${TYP_NAME}: Tomb of Horrors`,
  [`${SRC_TYP_PREFIX}-WPM`]: `${TYP_NAME}: White Plume Mountain`,
  VGM: "Volo's Guide to Monsters",
  XGE: "Xanathar's Guide to Everything",
  OGA: 'One Grung Above',
  MTF: "Mordenkainen's Tome of Foes",
  WDH: 'Waterdeep: Dragon Heist',
  WDMM: 'Waterdeep: Dungeon of the Mad Mage',
  GGR: "Guildmasters' Guide to Ravnica",
  KKW: "Krenko's Way",
  LLK: 'Lost Laboratory of Kwalish',
  GoS: 'Ghosts of Saltmarsh',
  AI: 'Acquisitions Incorporated',
  OoW: 'The Orrery of the Wanderer',
  ESK: 'Essentials Kit',
  DIP: 'Dragon of Icespire Peak',
  HftT: 'Hunt for the Thessalhydra',
  DC: 'Divine Contention',
  SLW: "Storm Lord's Wrath",
  SDW: "Sleeping Dragon's Wake",
  BGDIA: "Baldur's Gate: Descent Into Avernus",
  LR: 'Locathah Rising',
  AL: "Adventurers' League",
  SAC: 'Sage Advice Compendium',
  ERLW: 'Eberron: Rising from the Last War',
  EFR: 'Eberron: Forgotten Relics',
  RMBRE: 'The Lost Dungeon of Rickedness: Big Rick Energy',
  RMR: 'Dungeons & Dragons vs. Rick and Morty: Basic Rules',
  MFF: "Mordenkainen's Fiendish Folio",
  AWM: 'Adventure with Muk',
  IMR: 'Infernal Machine Rebuild',
  SADS: 'Sapphire Anniversary Dice Set',
  EGW: "Explorer's Guide to Wildemount",
  ToR: 'Tide of Retribution',
  DD: 'Dangerous Designs',
  FS: 'Frozen Sick',
  US: 'Unwelcome Spirits',
  MOT: 'Mythic Odysseys of Theros',
  IDRotF: 'Icewind Dale: Rime of the Frostmaiden',
  TCE: "Tasha's Cauldron of Everything",
  VRGR: "Van Richten's Guide to Ravenloft",
  HoL: 'The House of Lament',
  Screen: "Dungeon Master's Screen",
  ScreenWildernessKit: "Dungeon Master's Screen: Wilderness Kit",
  HF: "Heroes' Feast",
  CM: 'Candlekeep Mysteries',
  [`${SRC_AL_PREFIX}CurseOfStrahd`]: `${AL_PREFIX}Curse of Strahd`,
  [`${SRC_AL_PREFIX}ElementalEvil`]: `${AL_PREFIX}Elemental Evil`,
  [`${SRC_AL_PREFIX}RageOfDemons`]: `${AL_PREFIX}Rage of Demons`,
  [`${SRC_PS_PREFIX}A`]: `${PS_PREFIX}Amonkhet`,
  [`${SRC_PS_PREFIX}I`]: `${PS_PREFIX}Innistrad`,
  [`${SRC_PS_PREFIX}K`]: `${PS_PREFIX}Kaladesh`,
  [`${SRC_PS_PREFIX}Z`]: `${PS_PREFIX}Zendikar`,
  [`${SRC_PS_PREFIX}X`]: `${PS_PREFIX}Ixalan`,
  [`${SRC_PS_PREFIX}D`]: `${PS_PREFIX}Dominaria`,
  [`${SRC_UA_PREFIX}Artificer`]: `${UA_PREFIX}Artificer`,
  [`${SRC_UA_PREFIX}EladrinAndGith`]: `${UA_PREFIX}Eladrin and Gith`,
  [`${SRC_UA_PREFIX}Eberron`]: `${UA_PREFIX}Eberron`,
  [`${SRC_UA_PREFIX}FeatsForRaces`]: `${UA_PREFIX}Feats for Races`,
  [`${SRC_UA_PREFIX}FeatsForSkills`]: `${UA_PREFIX}Feats for Skills`,
  [`${SRC_UA_PREFIX}FiendishOptions`]: `${UA_PREFIX}Fiendish Options`,
  [`${SRC_UA_PREFIX}Feats`]: `${UA_PREFIX}Feats`,
  [`${SRC_UA_PREFIX}GothicHeroes`]: `${UA_PREFIX}Gothic Heroes`,
  [`${SRC_UA_PREFIX}ModernMagic`]: `${UA_PREFIX}Modern Magic`,
  [`${SRC_UA_PREFIX}StarterSpells`]: `${UA_PREFIX}Starter Spells`,
  [`${SRC_UA_PREFIX}TheMysticClass`]: `${UA_PREFIX}The Mystic Class`,
  [`${SRC_UA_PREFIX}ThatOldBlackMagic`]: `${UA_PREFIX}That Old Black Magic`,
  [`${SRC_UA_PREFIX}TheRangerRevised`]: `${UA_PREFIX}The Ranger, Revised`,
  [`${SRC_UA_PREFIX}WaterborneAdventures`]: `${UA_PREFIX}Waterborne Adventures`,
  [`${SRC_UA_PREFIX}VariantRules`]: `${UA_PREFIX}Variant Rules`,
  [`${SRC_UA_PREFIX}LightDarkUnderdark`]: `${UA_PREFIX}Light, Dark, Underdark!`,
  [`${SRC_UA_PREFIX}RangerAndRogue`]: `${UA_PREFIX}Ranger and Rogue`,
  [`${SRC_UA_PREFIX}ATrioOfSubclasses`]: `${UA_PREFIX}A Trio of Subclasses`,
  [`${SRC_UA_PREFIX}BarbarianPrimalPaths`]: `${UA_PREFIX}Barbarian Primal Paths`,
  [`${SRC_UA_PREFIX}RevisedSubclasses`]: `${UA_PREFIX}Revised Subclasses`,
  [`${SRC_UA_PREFIX}KitsOfOld`]: `${UA_PREFIX}Kits of Old`,
  [`${SRC_UA_PREFIX}BardBardColleges`]: `${UA_PREFIX}Bard: Bard Colleges`,
  [`${SRC_UA_PREFIX}ClericDivineDomains`]: `${UA_PREFIX}Cleric: Divine Domains`,
  [`${SRC_UA_PREFIX}Druid`]: `${UA_PREFIX}Druid`,
  [`${SRC_UA_PREFIX}RevisedClassOptions`]: `${UA_PREFIX}Revised Class Options`,
  [`${SRC_UA_PREFIX}Fighter`]: `${UA_PREFIX}Fighter`,
  [`${SRC_UA_PREFIX}Monk`]: `${UA_PREFIX}Monk`,
  [`${SRC_UA_PREFIX}Paladin`]: `${UA_PREFIX}Paladin`,
  [`${SRC_UA_PREFIX}ModifyingClasses`]: `${UA_PREFIX}Modifying Classes`,
  [`${SRC_UA_PREFIX}Sorcerer`]: `${UA_PREFIX}Sorcerer`,
  [`${SRC_UA_PREFIX}WarlockAndWizard`]: `${UA_PREFIX}Warlock and Wizard`,
  [`${SRC_UA_PREFIX}TheFaithful`]: `${UA_PREFIX}The Faithful`,
  [`${SRC_UA_PREFIX}WizardRevisited`]: `${UA_PREFIX}Wizard Revisited`,
  [`${SRC_UA_PREFIX}ElfSubraces`]: `${UA_PREFIX}Elf Subraces`,
  [`${SRC_UA_PREFIX}MassCombat`]: `${UA_PREFIX}Mass Combat`,
  [`${SRC_UA_PREFIX}ThreePillarExperience`]: `${UA_PREFIX}Three-Pillar Experience`,
  [`${SRC_UA_PREFIX}GreyhawkInitiative`]: `${UA_PREFIX}Greyhawk Initiative`,
  [`${SRC_UA_PREFIX}ThreeSubclasses`]: `${UA_PREFIX}Three Subclasses`,
  [`${SRC_UA_PREFIX}OrderDomain`]: `${UA_PREFIX}Order Domain`,
  [`${SRC_UA_PREFIX}CentaursMinotaurs`]: `${UA_PREFIX}Centaurs and Minotaurs`,
  [`${SRC_UA_PREFIX}GiantSoulSorcerer`]: `${UA_PREFIX}Giant Soul Sorcerer`,
  [`${SRC_UA_PREFIX}RacesOfEberron`]: `${UA_PREFIX}Races of Eberron`,
  [`${SRC_UA_PREFIX}RacesOfRavnica`]: `${UA_PREFIX}Races of Ravnica`,
  [`${SRC_UA_PREFIX}WGE`]: "Wayfinder's Guide to Eberron",
  [`${SRC_UA_PREFIX}OfShipsAndSea`]: `${UA_PREFIX}Of Ships and the Sea`,
  [`${SRC_UA_PREFIX}Sidekicks`]: `${UA_PREFIX}Sidekicks`,
  [`${SRC_UA_PREFIX}ArtificerRevisited`]: `${UA_PREFIX}Artificer Revisited`,
  [`${SRC_UA_PREFIX}BarbarianAndMonk`]: `${UA_PREFIX}Barbarian and Monk`,
  [`${SRC_UA_PREFIX}SorcererAndWarlock`]: `${UA_PREFIX}Sorcerer and Warlock`,
  [`${SRC_UA_PREFIX}BardAndPaladin`]: `${UA_PREFIX}Bard and Paladin`,
  [`${SRC_UA_PREFIX}ClericDruidWizard`]: `${UA_PREFIX}Cleric, Druid, and Wizard`,
  [`${SRC_UA_PREFIX}FighterRangerRogue`]: `${UA_PREFIX}Fighter, Ranger, and Rogue`,
  [`${SRC_UA_PREFIX}ClassFeatureVariants`]: `${UA_PREFIX}Class Feature Variants`,
  [`${SRC_UA_PREFIX}FighterRogueWizard`]: `${UA_PREFIX}Fighter, Rogue, and Wizard`,
  [`${SRC_UA_PREFIX}PrestigeClassesRunMagic`]: `${UA_PREFIX}Prestige Classes and Rune Magic`,
  [`${SRC_UA_PREFIX}Ranger`]: `${UA_PREFIX}Ranger`,
  [`${SRC_UA_PREFIX}2020SubclassesPt1`]: `${UA_PREFIX}2020 Subclasses, Part 1`,
  [`${SRC_UA_PREFIX}2020SubclassesPt2`]: `${UA_PREFIX}2020 Subclasses, Part 2`,
  [`${SRC_UA_PREFIX}2020SubclassesPt3`]: `${UA_PREFIX}2020 Subclasses, Part 3`,
  [`${SRC_UA_PREFIX}2020SubclassesPt4`]: `${UA_PREFIX}2020 Subclasses, Part 4`,
  [`${SRC_UA_PREFIX}2020SubclassesPt5`]: `${UA_PREFIX}2020 Subclasses, Part 5`,
  [`${SRC_UA_PREFIX}2020SpellsAndMagicTattoos`]: `${UA_PREFIX}2020 Spells and Magic Tattoos`,
  [`${SRC_UA_PREFIX}2020PsionicOptionsRevisited`]: `${UA_PREFIX}2020 Psionic Options Revisited`,
  [`${SRC_UA_PREFIX}2020SubclassesRevisited`]: `${UA_PREFIX}2020 Subclasses Revisited`,
  [`${SRC_UA_PREFIX}2020Feats`]: `${UA_PREFIX}2020 Feats`,
  [`${SRC_UA_PREFIX}2021GothicLineages`]: `${UA_PREFIX}2021 Gothic Lineages`,
  [`${SRC_UA_PREFIX}2021FolkOfTheFeywild`]: `${UA_PREFIX}2021 Folk of the Feywild`,
  [`${SRC_UA_PREFIX}2021DraconicOptions`]: `${UA_PREFIX}2021 Draconic Options`,
  [`${SRC_UA_PREFIX}2021MagesOfStrixhaven`]: `${UA_PREFIX}2021 Mages of Strixhaven`,
  WBtW: 'The Wild Beyond the Witchlight',
  CRCotN: 'Critical Role: Call of the Netherdeep',
};

type OtherSources = { source: string, page: number }[];

const freeSources = Object.keys(SOURCE_JSON_TO_FULL)
  // Unearthed Arcana is a free WotC publication
  .filter((src) => src.startsWith(SRC_UA_PREFIX));

export function getOwnedSourceBooks(): string[] {
  const { ownedSourceBooks } = config;
  const ownedSourceBooksEx = [
    ...ownedSourceBooks,
    ...freeSources,
  ].map((src) => src.toLowerCase());
  return ownedSourceBooksEx;
}

export function isOwned(
  object: { source: string; otherSources?: OtherSources | undefined },
) {
  const ownedSourceBooks = getOwnedSourceBooks();
  if (ownedSourceBooks.includes(object.source.toLowerCase())) {
    return true;
  }
  if (object.otherSources) {
    // eslint-disable-next-line no-restricted-syntax
    for (const otherSource of object.otherSources) {
      if (ownedSourceBooks.includes(otherSource.source.toLowerCase())) {
        return true;
      }
    }
  }
  return false;
}
