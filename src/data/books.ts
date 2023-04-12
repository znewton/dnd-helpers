import { isOwned } from '../utils';
import { FiveEToolsBasePath, getJsonData } from './common';

export interface ISourceBook {
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

type BookJson = { book: ISourceBook[] };
const booksJsonFileName = 'books.json';
const booksBaseUrl = `${FiveEToolsBasePath}/data`;
export async function listBooks(): Promise<ISourceBook[]> {
	const booksJson: BookJson = await getJsonData(
		booksJsonFileName,
		booksBaseUrl,
		{ book: [] }
	);
	return booksJson.book.map((book) => ({
		...book,
		owned: isOwned({ source: book.id }),
	}));
}
