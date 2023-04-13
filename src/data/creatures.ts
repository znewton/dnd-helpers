import {
	Entry,
	extendObject,
	FiveEToolsBasePath,
	getCopyRefKey,
	getJsonData,
	IAbility,
	ICopySpec,
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
	_copy?: ICopySpec<ICreatureFluff> | undefined;
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
	_copy?: ICopySpec<ICreature> | undefined;
	fluff?: ICreatureFluff | undefined;
	variant?: Entry[] | undefined;
}

function filloutCreatureFluff(
	fluff: ICreatureFluff | undefined,
	fluffBestiaryMap: Record<string, ICreatureFluff | undefined>
): ICreatureFluff | undefined {
	if (!fluff) {
		return undefined;
	}
	if (fluff._copy !== undefined) {
		const fluffToCopy = fluffBestiaryMap[getCopyRefKey(fluff._copy)];
		if (!fluffToCopy) {
			throw new Error(
				`Could not copy ${getCopyRefKey(fluff._copy)} for ${fluff.name}`
			);
		}
		return extendObject<ICreatureFluff>(
			fluff,
			// For recursive copies
			filloutCreatureFluff(fluffToCopy, fluffBestiaryMap)
		);
	}
	return fluff;
}

function filloutCreature(
	creature: ICreature,
	refs: {
		fluffBestiaryMap: Record<string, ICreatureFluff | undefined>;
		bestiaryMap: Record<string, ICreature | undefined>;
	}
): ICreature {
	const fluff = filloutCreatureFluff(
		refs.fluffBestiaryMap[getCopyRefKey(creature)],
		refs.fluffBestiaryMap
	);
	if (creature._copy !== undefined) {
		const creatureToCopy = refs.bestiaryMap[getCopyRefKey(creature._copy)];
		if (!creatureToCopy) {
			throw new Error(
				`Could not copy ${getCopyRefKey(creature._copy)} for ${
					creature.name
				}`
			);
		}
		return {
			...extendObject<ICreature>(
				creature,
				// For recursive copies
				filloutCreature(creatureToCopy, refs)
			),
			fluff,
		};
	}
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
	const bestiaryMap: Record<string, ICreature | undefined> = {};
	bestiaryJsons.forEach(({ monster }) => {
		monster.forEach((creature) => {
			bestiaryMap[getCopyRefKey(creature)] = creature;
		});
	});
	const fluffBestiaryJsons = await Promise.all(fluffBestiaryReadPs);
	const fluffBestiaryMap: Record<string, ICreatureFluff | undefined> = {};
	fluffBestiaryJsons.forEach(({ monsterFluff }) => {
		monsterFluff.forEach((fluff) => {
			fluffBestiaryMap[getCopyRefKey(fluff)] = fluff;
		});
	});
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
