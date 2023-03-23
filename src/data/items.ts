import { isOwned } from '../utils';
import { Entry, FiveEToolsBasePath, getJsonData } from './common';

export interface IItemTypeAdditionalEntries {
  appliesTo: string;
  source: string;
  entries: Entry[];
}

export interface IItemEntry {
  name: string;
  source: string;
  // TODO: these have special templates like {{item.detail1}} or {{item.resist}}
  entriesTemplate: Entry[];
}

export enum ItemDamageTypeAbbrev {
  A = 'Acid',
  B = 'Bludgeoning',
  C = 'Cold',
  F = 'Fire',
  O = 'Force',
  L = 'Lightning',
  N = 'Necrotic',
  P = 'Piercing',
  I = 'Poison',
  Y = 'Psychic',
  R = 'Radiant',
  S = 'Slashing',
  T = 'Thunder',
}

export enum ItemTypeAbbrev {
  R = 'Ranged Weapon',
  M = 'Melee Weapon',
  A = 'Ammunition',
  HA = 'Heavy Armor',
  MA = 'Medium Armor',
  LA = 'Light Armor',
  S = 'Shield',
  SCF = 'Spellcasting Focus',
  AIR = 'Vehicle (Air)',
  SHP = 'Vehicle (Water)',
  SPC = 'Vehicle (Space)',
  VEH = 'Vehicle (Land)',
  AT = 'Artisan Tools',
  EXP = 'Explosive',
  EM = 'Eldritch Machine',
  F = 'Food',
  GS = 'Gaming Set',
  INS = 'Instrument',
  TG = 'Trade Good',
  RG = 'Ring',
  RD = 'Rod',
  WD = 'Wand',
  GV = 'Generic Variant',
  G = 'Adventuring Gear',
  MNT = 'Mount',
  MR = 'Master Rune',
  OTH = 'Other',
  P = 'Potion',
  SC = 'Scroll',
  T = 'Tools',
  TAH = 'Tack & Harness',
  '$' = 'Treasure',
}

export enum ItemPropertyAbbrev {
  A = 'Ammunition',
  AF = 'Ammunition (Firearm)',
  BF = 'Burst Fire',
  F = 'Finesse',
  H = 'Heavy',
  L = 'Light',
  LD = 'Loading',
  R = 'Reach',
  RLD = 'Reload',
  S = 'Special',
  T = 'Thrown',
  '2H' = 'Two-Handed',
  V = 'Versatile',
}

export enum ItemRechargeToFull {
  round = 'Every Round',
  restShort = 'Short Rest',
  restLong = 'Long Rest',
  dawn = 'Dawn',
  dusk = 'Dusk',
  midnight = 'Midnight',
  special = 'Special',
}

export interface IItemType {
  abbreviation: keyof typeof ItemTypeAbbrev;
  source: string;
  page: number;
  name?: string;
  entries: Entry[];
}

export interface IItemProperty {
  abbreviation: keyof typeof ItemPropertyAbbrev;
  source: string;
  page: number;
  entries?: Entry[];
  // TODO: these have special templates like {{prop_name}} and {{item.range}}
  template?: string;
}

export interface IItemBase {
  name: string;
  source: string;
  otherSources?: { source: string, page: number }[];
  page: number;
  type?: keyof typeof ItemTypeAbbrev;
  /**
   * Spellcasting Focus Type
   */
  scfType?: string;
  rarity: string;
  weight?: number;
  value?: number;
  weaponCategory?: string;
  property: (keyof typeof ItemPropertyAbbrev)[];
  age?: string;
  /**
   * Weapons
   */
  range?: string;
  dmg1?: string;
  dmg2?: string;
  dmgType?: keyof typeof ItemDamageTypeAbbrev;
  weapon?: boolean;
  spear?: boolean;
  firearm?: boolean;
  sword?: boolean;
  bow?: boolean;
  /**
   * Armor
   */
  ac?: number;
  armor?: boolean;
  stealth?: boolean;
  strength?: string;
  /**
   * Sometimes like `arrow|phb`
   */
  ammoType?: string;
  entries?: Entry[];
  /**
   * Sometimes like `sling bullet|phb`
   */
  packContents?: ({ item: string; quantity: number; } | string | { special: string; })[];
}

interface IModifySpeed {
  equal?: {
    // E.g. "fly": "walk" -> Fly speed becomes walk speed
    [key: string]: string | number;
  };
  multiply?: {
    // E.g. "walk": 2 -> walk speed multiplied by 2
    [key: string]: string | number;
  };
  static?: {
    // E.g. "walk": 30 -> walk speed becomes 30 ft
    [key: string]: string | number;
  };
  bonus?: {
    // E.g. "*": 5 -> all movement increased by 5
    [key: string]: string | number;
  };
}
type AbilityAbbrevs = {
  con: 'constitution';
  str: 'strength';
  dex: 'dexterity';
  int: 'intelligence';
  wis: 'wisdom';
  cha: 'charisma';
};
type AbilityModifier = {
  // E.g. "con": 2 -> Constitution +2
  [Property in keyof AbilityAbbrevs]: number;
};
type AbilityModifierChoice = {
  // E.g. "from": ["dex", "str"], "count": 1, "amount": 2 -> Choose to increase 1 of dex or strength by 2
  from: [keyof AbilityAbbrevs][];
  count: number;
  amount: 2;
};

interface IModifyAbility {
  // E.g. "con": 19 -> constitution score becomes 19 (unless already higher)
  static?: AbilityModifier;
  choose?: AbilityModifierChoice;
}

interface IContainerCapacity {
  weight?: number[];
  weightless?: boolean;
}

// TODO: Reference 5etools parser for more info https://github.com/5etools-mirror-1/5etools-mirror-1.github.io/blob/6b51e49fb048372a06bddd741cb670a71ad4d8c5/js/parser.js#L641
export interface IItem extends IItemBase {
  additionalSources?: { source: string; page: number; }[];
  tier?: string;
  reqAttune?: string | boolean;
  // Sometimes like `artificer|tce`
  reqAttuneTags?: {
    class?: string;
    background?: string;
    alignment?: string;
    creatureType?: string;
  }[];
  // Categories
  wondrous?: boolean;
  tattoo?: boolean;
  curse?: boolean;
  poison?: boolean;
  sentient?: boolean;
  staff?: boolean;
  // Bonuses
  bonusSpellAttack?: string;
  bonusSaveDc?: string;
  bonusWeapon?: string;
  bonusWeaponAttack?: string;
  bonusWeaponDamage?: string;
  bonusAc?: string;
  bonusSavingThrow?: string;
  bonusWeaponCritDamage?: string;
  critThreshold?: number;
  grantsProficiency?: boolean;
  modifySpeed?: IModifySpeed;
  ability?: IModifyAbility | AbilityModifier | AbilityModifierChoice;
  immune?: string[];
  resist?: string[];
  conditionImmune?: string[];
  vulnerable?: string[];
  // Other
  containerCapacity: IContainerCapacity;
  atomicPackContents?: boolean;
  focus?: string[];
  lootTables?: string[];
  recharge?: keyof typeof ItemRechargeToFull;
  // Sometimes like {@dice 1d20}
  rechargeAmount?: string | number;
  charges?: number;
  miscTags?: string[];
  detail1?: string;
  poisonTypes?: string[];
  // If true, entries can have like "{#itemEntry Absorbing Tattoo|TCE}"
  // Use either `itemGroup` from items.json or `itemEntry` from items-base.json
  hasRefs?: boolean;
  attachedSpells?: string[];
  // Sometimes like `replicate magic item|tce`
  optionalFeatures?: string[];
  // Vehicles
  crew?: number;
  vehAc?: number;
  vehHp?: number;
  vehSpeed?: number;
  vehDmgThresh?: number;
  capPassenger?: number;
  capCargo?: number;
  seeAlsoVehicle?: string[];
  // Extensions
  baseItem?: string;
  _copy: {
    name: string;
    source: string;
    _preserve: { [key: string]: boolean | undefined };
    _mod?: any; // TODO: look for `insertArr`
  }; // TODO: these extend objects, but those objects themselves can be extended
  // They are also included in ItemGroups
}

interface IItemGroup extends IItem {
  // Like `Acid Absorbing Tattoo|TCE`
  items: string[];
}

/**
 * Item with attached relevant information like
 * extensions (_copy), property information, type information, etc.
 */
export interface IItemEx extends IItem {

}

type ItemsBaseJson = {
  item: IItem[];
  itemProperty: IItemProperty[];
  itemType: IItemType[];
  itemEntry: IItemEntry[];
  itemTypeAdditionalEntries: IItemTypeAdditionalEntries[];
};
const itemsBaseFilename = 'items-base.json';
const itemsBaseBaseUrl = `${FiveEToolsBasePath}/data`;

type ItemsJson = {
  item: IItem[];
  itemGroup: IItemGroup[];
};
const itemsFilename = 'items.json';
const itemsBaseUrl = `${FiveEToolsBasePath}/data`;

export async function listItems(): Promise<IItemEx[]> {
  const itemsBaseJson = await getJsonData<ItemsBaseJson>(
    itemsBaseFilename,
    itemsBaseBaseUrl,
    {
      item: [], itemProperty: [], itemType: [], itemEntry: [], itemTypeAdditionalEntries: [],
    },
  );

  const itemsJson = await getJsonData<ItemsJson>(
    itemsFilename,
    itemsBaseUrl,
    {
      item: [],
      itemGroup: [],
    },
  );

  // TODO: properties, types, additional entries, etc.
  return [...itemsBaseJson.item, ...itemsJson.item]
    .filter((item) => isOwned(item));
}
