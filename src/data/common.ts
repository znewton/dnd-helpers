import path from 'path';
import Axios, { AxiosError } from 'axios';
import { JsonCache } from '../utils';

export const FiveEToolsBasePath = 'https://raw.githubusercontent.com/5etools-mirror-1/5etools-mirror-1.github.io/58a8d513ee627e6f8312a2642e672a652bf2b9c0';
export const FiveEToolsCache = new JsonCache(path.join(__dirname, '../cache'));

export type Entry = IEntry | ITableEntry | IListEntry | IWrapperEntry | ILinkEntry | IItemEntry | IQuoteEntry | string;
export interface IEntry {
  type: 'entries' | 'inset' | 'inline' | 'section';
  name?: string;
  entries: Entry[];
}
export interface IHref {
  type: 'internal' | string;
  path: string;
  hash?: string | undefined;
  hashPreEncoded?: boolean | undefined;
}
export interface ILinkEntry {
  type: 'link';
  href: IHref;
  text: string;
}
export type TableEntryCell = number | string | {
  entry?: Entry | undefined;
  roll?: {
    exact?: number | undefined;
    min?: number | undefined;
    max?: number | undefined;
  } | undefined;
};
export interface ITableEntry {
  type: 'table';
  caption: string;
  colLabels: string[];
  colStyles: string[];
  rows: (string | TableEntryCell)[][];
}
export interface IItemEntry {
  type: 'item' | 'itemSpell';
  name: string;
  entry: Entry;
}
export interface IListEntry {
  type: 'list';
  items: (string | IItemEntry)[];
}
export interface IWrapperEntry {
  type: 'wrapper';
  data: any;
  wrapped: Entry;
}
export interface IQuoteEntry {
  type: 'quote';
  entries: Entry[];
  by: string;
}

export interface IImage {
  type: string;
  href: {
    type: string;
    path: string;
  }
}

export interface ICombatTime {
  number: number;
  unit: 'action' | 'bonus' | 'reaction' | string;
}
export type CombatTime = 'Varies' | ICombatTime;

export interface IAbility<T> {
  str: T;
  dex: T;
  con: T;
  int: T;
  wis: T;
  cha: T;
}
export interface ISkill<T> {
  acrobatics: T;
  'animal handling': T;
  arcana: T;
  athletics: T;
  deception: T;
  history: T;
  insight: T;
  intimidation: T;
  investigation: T;
  medicine: T;
  nature: T;
  perception: T;
  performance: T;
  persuasion: T;
  religion: T;
  'sleight of hand': T;
  stealth: T;
  survival: T;
}

export async function getJsonData<T>(
  filename: string,
  baseUrl: string,
  notFoundDefault: T,
): Promise<T> {
  const cachedJson: T | undefined = await FiveEToolsCache.get(filename);
  const json: T = cachedJson
    ?? (await Axios.get(`${baseUrl}/${filename}`).catch((err: AxiosError) => {
      if (err.response?.status === 404) {
        return { data: undefined };
      }
      throw err;
    })).data ?? notFoundDefault;
  if (!cachedJson) {
    FiveEToolsCache.set(filename, json).catch(process.stderr.write);
  }
  return json;
}
