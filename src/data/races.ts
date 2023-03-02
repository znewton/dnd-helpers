import config from '../config';
import {
  Entry, FiveEToolsBasePath, getJsonData, IAbility, IImage, ISkill,
} from './common';
import type { CreatureSize, ICreatureSpeed } from './creatures';

export interface IRaceFluff {
  name: string;
  source: string;
  entries: Entry[];
  images?: IImage[] | undefined;
}
export interface IRace {
  name: string;
  source: string;
  page: number;
  entries: Entry[];
  size: (keyof typeof CreatureSize)[];
  speed: ICreatureSpeed;
  ability: Partial<IAbility<number>>[];
  skillProficiencies: Partial<ISkill<boolean>>[];
  languageProficiencies: { [language: string]: boolean | number | undefined }[];
  // TODO: Legacy races. "reprintedAs" on some of them.
  fluff?: IRaceFluff | undefined;
}

type RacesJson = { race: IRace[]; };
type RacesFluffJson = { raceFluff: IRaceFluff[]; };
const racesFilename = 'races.json';
const racesFluffFilename = 'fluff-races.json';
const racesBaseUrl = `${FiveEToolsBasePath}/data`;

export async function listRaces(): Promise<IRace[]> {
  const { ownedSourceBooks } = config;
  const racesJson: RacesJson = await getJsonData(
    racesFilename,
    racesBaseUrl,
    { race: [] },
  );
  const racesFluffJson: RacesFluffJson = await getJsonData(
    racesFluffFilename,
    racesBaseUrl,
    { raceFluff: [] },
  );
  const racesFluffMap: Record<string, IRaceFluff> = {};
  racesFluffJson.raceFluff.forEach((raceFluff) => {
    racesFluffMap[raceFluff.name] = raceFluff;
  });
  return racesJson.race
    .filter((race) => ownedSourceBooks.includes(race.source.toLowerCase()))
    .map((race) => ({
      ...race,
      fluff: racesFluffMap[race.name],
    }));
}
