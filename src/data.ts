import Axios from 'axios';
import path from 'path';
import config from './config';
import { JsonCache } from './utils/cache';

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
const booksJsonCacheKey = 'books.json';
const booksJsonUrl = 'https://raw.githubusercontent.com/5etools-mirror-1/5etools-mirror-1.github.io/master/data/books.json';
export async function listBooks(): Promise<ISourceBook[]> {
  const { ownedSourceBooks } = config;
  const booksJson: { book: ISourceBook[] } = await cache.get(booksJsonCacheKey)
    ?? (await Axios.get(booksJsonUrl)).data;
  cache.set(booksJsonCacheKey, booksJson).catch(process.stderr.write);
  return booksJson.book.map((book) => ({
    ...book,
    owned: ownedSourceBooks.includes(book.id.toLowerCase()),
  }));
}

export async function listItems(): Promise<void> {
  throw new Error('Not Implemented');
}

export async function listCreatures(): Promise<void> {
  throw new Error('Not Implemented');
}

export async function listSpells(): Promise<void> {
  throw new Error('Not Implemented');
}
