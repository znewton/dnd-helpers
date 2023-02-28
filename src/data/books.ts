import Axios, { AxiosError } from 'axios';
import config from '../config';
import { FiveEToolsBasePath, FiveEToolsCache } from './common';

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
const booksBaseUrl = `${FiveEToolsBasePath}/data`;
export async function listBooks(): Promise<ISourceBook[]> {
  const { ownedSourceBooks } = config;
  const cachedBooksJson: { book: ISourceBook[] } | undefined = await FiveEToolsCache
    .get(booksJsonFileName);
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
    FiveEToolsCache.set(booksJsonFileName, booksJson).catch(process.stderr.write);
  }
  return booksJson.book.map((book) => ({
    ...book,
    owned: ownedSourceBooks.includes(book.id.toLowerCase()),
  }));
}
