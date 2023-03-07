import config from '../config';
import { isOwned } from '../utils';
import {
  Entry, FiveEToolsBasePath, getJsonData,
} from './common';

export interface ISense {
  name: string;
  source: string;
  page: number;
  entries: Entry[];
}

type SensesJson = { sense: ISense[]; };
const sensesFilename = 'senses.json';
const sensesBaseUrl = `${FiveEToolsBasePath}/data`;

export async function listSenses(): Promise<ISense[]> {
  const { ownedSourceBooks } = config;
  const sensesJson: SensesJson = await getJsonData(
    sensesFilename,
    sensesBaseUrl,
    { sense: [] },
  );
  return sensesJson.sense
    .filter((item) => isOwned(ownedSourceBooks, item));
}
