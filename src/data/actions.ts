import config from '../config';
import { isOwned } from '../utils';
import {
  CombatTime,
  Entry, FiveEToolsBasePath, getJsonData,
} from './common';

export interface IAction {
  name: string;
  source: string;
  page: number;
  time?: CombatTime[] | undefined;
  entries: Entry[];
  seeAlsoAction: string[];
}

type ActionsJson = { action: IAction[]; };
const actionsFilename = 'actions.json';
const actionsBaseUrl = `${FiveEToolsBasePath}/data`;

export async function listActions(): Promise<IAction[]> {
  const { ownedSourceBooks } = config;
  const actionsJson: ActionsJson = await getJsonData(
    actionsFilename,
    actionsBaseUrl,
    { action: [] },
  );
  return actionsJson.action
    .filter((item) => isOwned(ownedSourceBooks, item));
}
