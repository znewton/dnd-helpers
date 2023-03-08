import {
  Entry, FiveEToolsBasePath, getJsonData, IAbility, IImage, ISkill,
} from './common';
import config from '../config';

export enum CreatureSize {
  F = 'Fine',
  D = 'Diminutive',
  T = 'Tiny',
  S = 'Small',
  M = 'Medium',
  L = 'Large',
  H = 'Huge',
  G = 'Gargantuan',
  C = 'Colossal',
  V = 'Varies',
}
export enum CreatureAlignment {
  G = 'Good',
  N = 'Neutral',
  E = 'Evil',
  L = 'Lawful',
  C = 'Chaotic',
  U = 'Unaligned',
}
export interface ICreatureDetailedAC {
  ac: number;
  from: string[];
}
export interface ICreatureHP {
  average?: number;
  formula?: string;
  special?: string;
}
export interface ICreatureDetailedMovement {
  number: number;
  condition: string;
}
export interface ICreatureSpeed {
  walk?: number | ICreatureDetailedMovement;
  fly?: number | ICreatureDetailedMovement;
  burrow?: number | ICreatureDetailedMovement;
  climb?: number | ICreatureDetailedMovement;
}
export interface ICreatureFluff {
  name: string;
  source: string;
  entries?: Entry[];
  images?: IImage[];
  _copy?: Pick<ICreatureFluff, 'name' | 'source'>
}
export interface ICreature extends IAbility<number> {
  name: string;
  source: string;
  otherSources?: { source: string; page: number; }[]
  page: number;
  size: (keyof typeof CreatureSize)[];
  type: string | { type: string };
  alignment: (keyof typeof CreatureAlignment)[];
  ac: (number | ICreatureDetailedAC)[];
  hp: ICreatureHP;
  speed: ICreatureSpeed;
  save?: Partial<IAbility<string>> | undefined;
  skill?: Partial<ISkill<string>> | undefined;
  senses?: string[] | undefined;
  /**
   * Passive Perception
   */
  passive: number;
  cr: string;
  trait?: Entry[] | undefined;
  action?: Entry[] | undefined;
  environment: string[] | undefined;
  fluff?: ICreatureFluff | undefined;
}

type MonsterJson = { monster: Omit<ICreature, 'fluff'>[] };
type MonsterFluffJson = { monsterFluff: ICreatureFluff[] };
const creaturesBaseUrl = `${FiveEToolsBasePath}/data/bestiary`;
export async function listCreatures(
  options: { includeFluff: boolean } = { includeFluff: true },
): Promise<ICreature[]> {
  const { ownedSourceBooks } = config;
  const bestiaryFiles = ownedSourceBooks.map((alias) => `bestiary-${alias}.json`);
  const bestiaryReadPs: Promise<MonsterJson>[] = [];
  [...bestiaryFiles].forEach((fileName) => {
    bestiaryReadPs.push(getJsonData<MonsterJson>(
      fileName,
      creaturesBaseUrl,
      { monster: [] },
    ));
  });
  const fluffBestiaryReadPs: Promise<MonsterFluffJson>[] = [];
  if (options.includeFluff) {
    const fluffBestiaryFiles = ownedSourceBooks.map((alias) => `fluff-bestiary-${alias}.json`);
    [...fluffBestiaryFiles].forEach((fileName) => {
      fluffBestiaryReadPs.push(getJsonData<MonsterFluffJson>(
        fileName,
        creaturesBaseUrl,
        { monsterFluff: [] },
      ));
    });
  }
  const bestiaryJsons = await Promise.all(bestiaryReadPs);
  const fluffBestiaryJsons = await Promise.all(fluffBestiaryReadPs);
  const fluffBestiary: { [name: string]: ICreatureFluff | undefined } = {};
  fluffBestiaryJsons.forEach(({ monsterFluff }) => {
    monsterFluff.forEach((fluff) => {
      fluffBestiary[fluff.name] = fluff;
    });
  });
  const bestiary: ICreature[] = [];
  bestiaryJsons.forEach(({ monster }) => {
    monster.forEach((creature) => {
      bestiary.push({
        ...creature,
        fluff: fluffBestiary[creature.name],
      });
    });
  });
  return bestiary;
}
