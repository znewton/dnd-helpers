import Axios, { AxiosError } from 'axios';
import path from 'path';
import config from './config';
import { JsonCache } from './utils/cache';

const fiveEToolsBasePath = 'https://raw.githubusercontent.com/5etools-mirror-1/5etools-mirror-1.github.io/master';
const cache = new JsonCache(path.join(__dirname, '../cache'));

interface ISourceBook {
  name: string;
  id: string;
  source: string;
  group: string;
  coverUrl: string;
  published: string;
  author: string;
  contents: any[];
  owned?: boolean;
}
const booksJsonFileName = 'books.json';
const booksBaseUrl = `${fiveEToolsBasePath}/data`;
export async function listBooks(): Promise<ISourceBook[]> {
  const { ownedSourceBooks } = config;
  const cachedBooksJson: { book: ISourceBook[] } | undefined = await cache.get(booksJsonFileName);
  const booksJson: { book: ISourceBook[] } | undefined = cachedBooksJson
    ?? (await Axios.get(`${booksBaseUrl}/${booksJsonFileName}`).catch((err: AxiosError) => {
      if (err.status === 404) {
        return { data: undefined };
      }
      throw err;
    })).data;
  if (!booksJson) {
    return [];
  }
  if (!cachedBooksJson) {
    cache.set(booksJsonFileName, booksJson).catch(process.stderr.write);
  }
  return booksJson.book.map((book) => ({
    ...book,
    owned: ownedSourceBooks.includes(book.id.toLowerCase()),
  }));
}

export async function listItems(): Promise<void> {
  throw new Error('Not Implemented');
}

type Entry = IEntry | ITableEntry | IListEntry | IWrapperEntry | string;
interface IEntry {
  type: 'entries' | 'inset';
  name?: string;
  entries: Entry[];
}
interface ITableEntry {
  type: 'table';
  caption: string;
  colLabels: string[];
  colStyles: string[];
  rows: string[][];
}
interface IListEntry {
  type: 'list';
  items: string[];
}
interface IWrapperEntry {
  type: 'wrapper';
  data: any;
  wrapped: Entry;
}

interface IImage {
  type: string;
  href: {
    type: string;
    path: string;
  }
}
interface ICreatureFluff {
  name: string;
  source: string;
  entries?: Entry[];
  images?: IImage[];
  _copy?: Pick<ICreatureFluff, 'name' | 'source'>
}
interface ICreature {
  name: string;
  source: string;
  page: number;
  size: string[]; // TODO: size enum
  fluff?: ICreatureFluff;
}
const creaturesBaseUrl = `${fiveEToolsBasePath}/data/bestiary`;
export async function listCreatures(
  options: { includeFluff: boolean } = { includeFluff: false },
): Promise<void> {
  const { ownedSourceBooks } = config;
  const bestiaryFiles = ownedSourceBooks.map((alias) => `bestiary-${alias}.json`);
  const bestiaryReadPs: Promise<{ monster: ICreature[] }>[] = [];
  [...bestiaryFiles].forEach((fileName) => {
    bestiaryReadPs.push((async () => {
      const cachedBestiaryJson: { monster: ICreature[] } | undefined = await cache.get(fileName);
      const bestiaryJson: { monster: ICreature[] } = cachedBestiaryJson
        ?? (await Axios.get(`${creaturesBaseUrl}/${fileName}`).catch((err: AxiosError) => {
          if (err.status === 404) {
            return { data: undefined };
          }
          throw err;
        })).data ?? { monster: [] };
      if (!cachedBestiaryJson) {
        cache.set(fileName, bestiaryJson).catch(process.stderr.write);
      }
      return bestiaryJson;
    })());
  });
  const fluffBestiaryReadPs: Promise<{ monsterFluff: ICreature[] }>[] = [];
  if (options.includeFluff) {
    const fluffBestiaryFiles = ownedSourceBooks.map((alias) => `fluff-bestiary-${alias}.json`);
    [...fluffBestiaryFiles].forEach((fileName) => {
      fluffBestiaryReadPs.push((async () => {
        const cachedFluffBestiaryJson: { monsterFluff: ICreature[] } | undefined = await cache
          .get(fileName);
        const fluffBestiaryJson: { monsterFluff: ICreature[] } = cachedFluffBestiaryJson
        ?? (await Axios.get(`${creaturesBaseUrl}/${fileName}`).catch((err: AxiosError) => {
          if (err.status === 404) {
            return { data: undefined };
          }
          throw err;
        })).data ?? { monsterFluff: [] };
        if (!cachedFluffBestiaryJson) {
          cache.set(fileName, fluffBestiaryJson).catch(process.stderr.write);
        }
        return fluffBestiaryJson;
      })());
    });
  }
  const bestiaryJsons = await Promise.all(bestiaryReadPs);
  const fluffBestiaryJsons = await Promise.all(bestiaryReadPs);
}

export async function listSpells(): Promise<void> {
  throw new Error('Not Implemented');
}
