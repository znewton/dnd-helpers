/* eslint-disable no-underscore-dangle */
import {
	Entry,
	FiveEToolsBasePath,
	getJsonData,
	IAbility,
	IImage,
	ISkill,
} from './common';
import { getOwnedSourceBooks } from '../utils';

export enum CreatureSize {
	F = 'Fine',
	D = 'Diminutive',
	T = 'Tiny',
	S = 'Small',
	M = 'Medium',
	L = 'Large',
	H = 'Huge',
	G = 'Gargantuan',
	C = 'Colossal',
	V = 'Varies',
}
export enum CreatureAlignment {
	G = 'Good',
	N = 'Neutral',
	E = 'Evil',
	L = 'Lawful',
	C = 'Chaotic',
	U = 'Unaligned',
}
export interface ICreatureDetailedAC {
	ac: number;
	from: string[];
}
export interface ICreatureHP {
	average?: number;
	formula?: string;
	special?: string;
}
export interface ICreatureDetailedMovement {
	number: number;
	condition: string;
}
export interface ICreatureSpeed {
	walk?: number | ICreatureDetailedMovement;
	fly?: number | ICreatureDetailedMovement;
	burrow?: number | ICreatureDetailedMovement;
	climb?: number | ICreatureDetailedMovement;
}
export interface ICreatureFluff {
	name: string;
	source: string;
	entries?: Entry[];
	images?: IImage[];
	_copy?: Pick<ICreatureFluff, 'name' | 'source'>;
}
export interface ICreature extends IAbility<number> {
	name: string;
	source: string;
	otherSources?: { source: string; page: number }[];
	page: number;
	size: (keyof typeof CreatureSize)[];
	type: string | { type: string };
	alignment: (keyof typeof CreatureAlignment)[];
	ac: (number | ICreatureDetailedAC)[];
	hp: ICreatureHP;
	speed: ICreatureSpeed;
	save?: Partial<IAbility<string>> | undefined;
	skill?: Partial<ISkill<string>> | undefined;
	senses?: string[] | undefined;
	/**
	 * Passive Perception
	 */
	passive: number;
	cr: string;
	trait?: Entry[] | undefined;
	action?: Entry[] | undefined;
	environment: string[] | undefined;
	fluff?: ICreatureFluff | undefined;
}

function getCreatureFluff(
	creatureName: string,
	fluffBestiaryMap: Record<string, ICreatureFluff | undefined>
): ICreatureFluff | undefined {
	return fluffBestiaryMap[creatureName];
}

function filloutCreature(
	creature: ICreature,
	refs: {
		fluffBestiaryMap: Record<string, ICreatureFluff | undefined>;
		bestiaryMap: Record<string, ICreature | undefined>;
	}
): ICreature {
	if ((creature as unknown as any)._copy !== undefined) {
		console.log('Creature with _copy', creature.name, creature.source);
	}
	const fluff = getCreatureFluff(creature.name, refs.fluffBestiaryMap);
	return {
		...creature,
		fluff,
	};
}

type MonsterJson = { monster: Omit<ICreature, 'fluff'>[] };
type MonsterFluffJson = { monsterFluff: ICreatureFluff[] };
const creaturesBaseUrl = `${FiveEToolsBasePath}/data/bestiary`;
export async function listCreatures(
	options: { includeFluff: boolean } = { includeFluff: true }
): Promise<ICreature[]> {
	const ownedSourceBooks = getOwnedSourceBooks();
	const bestiaryFiles = ownedSourceBooks.map(
		(alias) => `bestiary-${alias}.json`
	);
	const bestiaryReadPs: Promise<MonsterJson>[] = [];
	[...bestiaryFiles].forEach((fileName) => {
		bestiaryReadPs.push(
			getJsonData<MonsterJson>(fileName, creaturesBaseUrl, {
				monster: [],
			}).catch((error) => {
				console.error(`Error fetching ${fileName}`, error);
				throw error;
			})
		);
	});
	const fluffBestiaryReadPs: Promise<MonsterFluffJson>[] = [];
	if (options.includeFluff) {
		const fluffBestiaryFiles = ownedSourceBooks.map(
			(alias) => `fluff-bestiary-${alias}.json`
		);
		[...fluffBestiaryFiles].forEach((fileName) => {
			fluffBestiaryReadPs.push(
				getJsonData<MonsterFluffJson>(fileName, creaturesBaseUrl, {
					monsterFluff: [],
				})
			);
		});
	}
	const bestiaryJsons = await Promise.all(bestiaryReadPs);
	const fluffBestiaryJsons = await Promise.all(fluffBestiaryReadPs);
	const fluffBestiaryMap: Record<string, ICreatureFluff | undefined> = {};
	fluffBestiaryJsons.forEach(({ monsterFluff }) => {
		monsterFluff.forEach((fluff) => {
			fluffBestiaryMap[fluff.name] = fluff;
		});
	});
	const bestiaryMap: Record<string, ICreature | undefined> = {};
	const bestiary: ICreature[] = [];
	bestiaryJsons.forEach(({ monster }) => {
		monster.forEach((creature) => {
			bestiary.push(
				filloutCreature(creature, { fluffBestiaryMap, bestiaryMap })
			);
		});
	});
	return bestiary;
}
