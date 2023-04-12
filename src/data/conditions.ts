import { isOwned } from '../utils';
import { Entry, FiveEToolsBasePath, getJsonData } from './common';

export interface ICondition {
	name: string;
	source: string;
	page: number;
	entries: Entry[];
}
export interface IDisease {
	name: string;
	source: string;
	page: number;
	entries: Entry[];
}

type ConditionsDiseasesJson = { condition: ICondition[]; disease: IDisease[] };
const conditionsDiseasesFilename = 'conditionsdiseases.json';
const conditionsDiseasesBaseUrl = `${FiveEToolsBasePath}/data`;

export async function listConditions(): Promise<ICondition[]> {
	const conditionsDiseasesJson = await getJsonData<ConditionsDiseasesJson>(
		conditionsDiseasesFilename,
		conditionsDiseasesBaseUrl,
		{ condition: [], disease: [] }
	);
	return conditionsDiseasesJson.condition.filter((condition) =>
		isOwned(condition)
	);
}
export async function listDiseases(): Promise<IDisease[]> {
	const conditionsDiseasesJson = await getJsonData<ConditionsDiseasesJson>(
		conditionsDiseasesFilename,
		conditionsDiseasesBaseUrl,
		{ condition: [], disease: [] }
	);
	return conditionsDiseasesJson.disease.filter((condition) =>
		isOwned(condition)
	);
}
