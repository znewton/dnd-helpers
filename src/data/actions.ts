import config from '../config';
import {
  Entry, FiveEToolsBasePath, getJsonData,
} from './common';

export interface IActionUseTime {
  number: number;
  unit: string;
}
export interface IAction {
  name: string;
  source: string;
  page: number;
  time: (string | IActionUseTime)[];
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
    .filter((action) => ownedSourceBooks.includes(action.source.toLowerCase()));
}
