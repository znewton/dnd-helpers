import Axios, { AxiosError } from 'axios';
import { Entry, FiveEToolsBasePath, FiveEToolsCache } from './common';
import config from '../config';

export enum CreatureSize {
  T = 'Tiny',
  S = 'Small',
  M = 'Medium',
  L = 'Large',
  H = 'Huge',
  G = 'Gargantuan',
}
export enum CreatureAlignment {
  G = 'Good',
  N = 'Neutral',
  E = 'Evil',
  L = 'Lawful',
  C = 'Chaotic',
  U = 'Unaligned',
}
export interface IImage {
  type: string;
  href: {
    type: string;
    path: string;
  }
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
export interface ICreature {
  name: string;
  source: string;
  page: number;
  size: CreatureSize[];
  type: string;
  alignment: CreatureAlignment[];
  ac: (number | ICreatureDetailedAC)[];
  hp: ICreatureHP;
  speed: ICreatureSpeed;
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
  save?: Partial<{
    str: string;
    dex: string;
    con: string;
    int: string;
    wis: string;
    cha: string;
  }> | undefined;
  skill?: Partial<{
    acrobatics: string;
    'animal handling': string;
    arcana: string;
    athletics: string;
    deception: string;
    history: string;
    insight: string;
    intimidation: string;
    investigation: string;
    medicine: string;
    nature: string;
    perception: string;
    performance: string;
    persuasion: string;
    religion: string;
    'sleight of hand': string;
    stealth: string;
    survival: string;
  }> | undefined;
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
const creaturesBaseUrl = `${FiveEToolsBasePath}/data/bestiary`;
export async function listCreatures(
  options: { includeFluff: boolean } = { includeFluff: false },
): Promise<ICreature[]> {
  const { ownedSourceBooks } = config;
  const bestiaryFiles = ownedSourceBooks.map((alias) => `bestiary-${alias}.json`);
  const bestiaryReadPs: Promise<{ monster: ICreature[] }>[] = [];
  [...bestiaryFiles].forEach((fileName) => {
    bestiaryReadPs.push((async () => {
      const cachedBestiaryJson: { monster: ICreature[] } | undefined = await FiveEToolsCache.get(fileName);
      const bestiaryJson: { monster: ICreature[] } = cachedBestiaryJson
          ?? (await Axios.get(`${creaturesBaseUrl}/${fileName}`).catch((err: AxiosError) => {
            if (err.status === 404) {
              return { data: undefined };
            }
            throw err;
          })).data ?? { monster: [] };
      if (!cachedBestiaryJson) {
        FiveEToolsCache.set(fileName, bestiaryJson).catch(process.stderr.write);
      }
      return bestiaryJson;
    })());
  });
  const fluffBestiaryReadPs: Promise<{ monsterFluff: ICreatureFluff[] }>[] = [];
  if (options.includeFluff) {
    const fluffBestiaryFiles = ownedSourceBooks.map((alias) => `fluff-bestiary-${alias}.json`);
    [...fluffBestiaryFiles].forEach((fileName) => {
      fluffBestiaryReadPs.push((async () => {
        const cachedFluffBestiaryJson: { monsterFluff: ICreatureFluff[] } | undefined = await FiveEToolsCache
          .get(fileName);
        const fluffBestiaryJson: { monsterFluff: ICreatureFluff[] } = cachedFluffBestiaryJson
          ?? (await Axios.get(`${creaturesBaseUrl}/${fileName}`).catch((err: AxiosError) => {
            if (err.status === 404) {
              return { data: undefined };
            }
            throw err;
          })).data ?? { monsterFluff: [] };
        if (!cachedFluffBestiaryJson) {
          FiveEToolsCache.set(fileName, fluffBestiaryJson).catch(process.stderr.write);
        }
        return fluffBestiaryJson;
      })());
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
