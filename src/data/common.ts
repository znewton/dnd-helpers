import path from 'path';
import { JsonCache } from '../utils';

export const FiveEToolsBasePath = 'https://raw.githubusercontent.com/5etools-mirror-1/5etools-mirror-1.github.io/master';
export const FiveEToolsCache = new JsonCache(path.join(__dirname, '../cache'));

export type Entry = IEntry | ITableEntry | IListEntry | IWrapperEntry | string;
export interface IEntry {
  type: 'entries' | 'inset';
  name?: string;
  entries: Entry[];
}
export interface ITableEntry {
  type: 'table';
  caption: string;
  colLabels: string[];
  colStyles: string[];
  rows: string[][];
}
export interface IListEntry {
  type: 'list';
  items: string[];
}
export interface IWrapperEntry {
  type: 'wrapper';
  data: any;
  wrapped: Entry;
}
