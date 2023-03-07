import config from '../config';
import { isOwned } from '../utils';
import {
  Entry, FiveEToolsBasePath, getJsonData, IEntry,
} from './common';

export interface IQuickRefEntry extends IEntry {
  type: 'section';
  page: number;
  source: string;
  name: string;
  entries: Entry[];
  data: { quickref: number };
}
export interface IQuickRef {
  name: string;
  source: string;
  page: number;
  entries: Entry[];
}

type QuickRefsJson = {
  data: {
    'bookref-quick': (Entry & { type: 'entries', entries: IQuickRefEntry[] })[];
  };
};
const quickRefsFilename = 'bookref-quick.json';
const quickRefsBaseUrl = `${FiveEToolsBasePath}/data/generated`;

export async function listQuickRef(): Promise<IQuickRef[]> {
  const { ownedSourceBooks } = config;
  const quickRefsJson: QuickRefsJson = await getJsonData(
    quickRefsFilename,
    quickRefsBaseUrl,
    { data: { 'bookref-quick': [] } },
  );
  const quickRefEntries: IQuickRefEntry[] = [];
  quickRefsJson.data['bookref-quick'].forEach((quickRefSection) => {
    quickRefSection.entries.forEach((quickRefEntry) => {
      quickRefEntries.push(quickRefEntry);
    });
  });
  return quickRefEntries
    .filter((quickRefEntry) => isOwned(ownedSourceBooks, quickRefEntry));
}
