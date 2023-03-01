import config from '../config';
import {
  Entry, FiveEToolsBasePath, getJsonData,
} from './common';

export interface ISkillDescription {
  name: string;
  source: string;
  page: number;
  entries: Entry;
}

type SkillsJson = { skill: ISkillDescription[]; };
const skillsFilename = 'skills.json';
const skillsBaseUrl = `${FiveEToolsBasePath}/data`;

export async function listSkillDescriptions(): Promise<ISkillDescription[]> {
  const { ownedSourceBooks } = config;
  const skillsJson: SkillsJson = await getJsonData(
    skillsFilename,
    skillsBaseUrl,
    { skill: [] },
  );
  return skillsJson.skill
    .filter((skill) => ownedSourceBooks.includes(skill.source.toLowerCase()));
}
