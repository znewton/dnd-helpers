import path from 'path';
import Axios, { AxiosError } from 'axios';
import { JsonCache } from '../utils';

export const FiveEToolsBasePath =
	'https://raw.githubusercontent.com/5etools-mirror-1/5etools-mirror-1.github.io/58a8d513ee627e6f8312a2642e672a652bf2b9c0';
export const FiveEToolsCache = new JsonCache(path.join(__dirname, '../cache'));

export type Entry =
	| IEntry
	| ITableEntry
	| IListEntry
	| IWrapperEntry
	| ILinkEntry
	| IItemEntry
	| IQuoteEntry
	| ISpellCastingEntry
	| string;
export interface IEntry {
	type:
		| 'entries'
		| 'inset'
		| 'inline'
		| 'section'
		| 'variant'
		| 'variantSub'
		| 'variantInner';
	name?: string | undefined;
	entries: Entry[];
}
export interface IHref {
	type: 'internal' | string;
	path: string;
	hash?: string | undefined;
	hashPreEncoded?: boolean | undefined;
}
export interface ILinkEntry {
	type: 'link';
	href: IHref;
	text: string;
}
export type TableEntryCell =
	| number
	| string
	| {
			entry?: Entry | undefined;
			roll?:
				| {
						exact?: number | undefined;
						min?: number | undefined;
						max?: number | undefined;
				  }
				| undefined;
	  };
export interface ITableEntry {
	type: 'table';
	caption: string;
	colLabels: string[];
	colStyles: string[];
	rows: (string | TableEntryCell)[][];
}
export interface IItemEntry {
	type: 'item' | 'itemSpell';
	name: string;
	entry: Entry;
}
export interface IListEntry {
	type: 'list';
	items: (string | IItemEntry)[];
}
export interface IWrapperEntry {
	type: 'wrapper';
	data: any;
	wrapped: Entry;
}
export interface IQuoteEntry {
	type: 'quote';
	entries: Entry[];
	by: string;
}
export interface ISpellCastingEntry {
	type: 'spellcasting';
	name?: string | undefined;
	headerEntries?: Entry[] | undefined;
	spells?:
		| { [level: string]: { slots: number; spells: string[] } }
		| undefined;
	footerEntries?: Entry[] | undefined;
}

export interface IImage {
	type: string;
	href: {
		type: string;
		path: string;
	};
}

export interface ICombatTime {
	number: number;
	unit: 'action' | 'bonus' | 'reaction' | string;
}
export type CombatTime = 'Varies' | ICombatTime;

export interface IAbility<T> {
	str: T;
	dex: T;
	con: T;
	int: T;
	wis: T;
	cha: T;
}
export interface ISkill<T> {
	acrobatics: T;
	'animal handling': T;
	arcana: T;
	athletics: T;
	deception: T;
	history: T;
	insight: T;
	intimidation: T;
	investigation: T;
	medicine: T;
	nature: T;
	perception: T;
	performance: T;
	persuasion: T;
	religion: T;
	'sleight of hand': T;
	stealth: T;
	survival: T;
}

export async function getJsonData<T>(
	filename: string,
	baseUrl: string,
	notFoundDefault: T
): Promise<T> {
	const cachedJson: T | undefined = await FiveEToolsCache.get(filename);
	const json: T =
		cachedJson ??
		(
			await Axios.get(`${baseUrl}/${filename}`).catch(
				(err: AxiosError) => {
					if (err.response?.status === 404) {
						return { data: undefined };
					}
					throw err;
				}
			)
		).data ??
		notFoundDefault;
	if (!cachedJson) {
		FiveEToolsCache.set(filename, json).catch(process.stderr.write);
	}
	return json;
}

export interface ICopyModPrependArr {
	mode: 'prependArr';
	items: any | any[];
}
export interface ICopyModAppendArr {
	mode: 'appendArr';
	items: any | any[];
}
export interface ICopyModInsertArr {
	mode: 'insertArr';
	index: number;
	items: any | any[];
}
export interface ICopyModReplaceArr {
	mode: 'replaceArr';
	replace: { index: 7 } | string;
	items: any | any[];
}
export interface ICopyModRemoveArr {
	mode: 'removeArr';
	names: string | string[];
}
export interface ICopyModReplaceTxt {
	mode: 'replaceTxt';
	replace: string;
	with: string;
	flags?: string | undefined;
}

export type CopyMod =
	| ICopyModPrependArr
	| ICopyModAppendArr
	| ICopyModInsertArr
	| ICopyModReplaceArr
	| ICopyModRemoveArr
	| ICopyModReplaceTxt;

export type ICopyPreserve<T> = {
	[K in keyof T]: boolean | undefined;
};

export interface ICopySpec<T> {
	name: string;
	source: string;
	_preserve?: ICopyPreserve<T> | undefined;
	_mod?: Record<keyof T, CopyMod> | undefined;
}

export function getCopyRefKey<T>(
	obj: T & {
		name: string;
		source: string;
	}
): string {
	return `${obj.name}:${obj.source}`;
}

export function extendObject<
	T extends { name: string; source: string; _copy?: ICopySpec<T> | undefined }
>(obj: T, copyFromObj?: T): T {
	if (!obj._copy || !copyFromObj) {
		return obj;
	}
	const extendedObj: T = {
		...obj,
	};
	if (obj._copy._preserve || (!obj._copy._preserve && !obj._copy._mod)) {
		Object.entries(copyFromObj).forEach(([key, value]) => {
			// Always preserve name and source
			if (['name', 'source'].includes(key)) return;
			if (!((obj._copy?._preserve as any) ?? {})[key]) {
				(extendedObj as any)[key] = value;
			}
		});
	}
	let replaceText: ICopyModReplaceTxt | undefined;
	if (obj._copy._mod) {
		Object.entries(obj._copy._mod).forEach(([key, value]) => {
			const { mode } = value;
			const prop = key as keyof T | '*';
			if (prop === '*') {
				if (mode === 'replaceTxt') {
					replaceText = value;
				} else {
					console.error(
						`Illegal _copy._mod for ${obj.name}`,
						obj._copy?._mod
					);
					throw new Error(`* key for ${mode} in ${obj.name}`);
				}
				return;
			}
			if (
				[
					'prependArr',
					'appendArr',
					'insertArr',
					'replaceArr',
					'removeArr',
				].includes(mode)
			) {
				if (extendedObj[prop] === undefined) {
					extendedObj[prop] = [] as any;
				}
				if (!Array.isArray(extendedObj[prop])) {
					throw new Error(
						`Non-array (${typeof extendedObj[
							prop
						]}) for ${mode} in ${obj.name} for ${key}`
					);
				}
				const action = (items: any[]) => {
					if (mode === 'prependArr') {
						(extendedObj[prop] as any[]).unshift(...items);
					} else if (mode === 'appendArr') {
						(extendedObj[prop] as any[]).push(...items);
					} else if (mode === 'insertArr') {
						(extendedObj[prop] as any[]).splice(
							value.index,
							0,
							...items
						);
					} else if (mode === 'replaceArr') {
						if (Array.isArray(value.replace)) {
							console.log(
								`_copy._mod for ${obj.name}`,
								obj._copy?._mod
							);
							throw new Error(
								`Unhandled array in ${mode} in ${obj.name}`
							);
						}
						const index: number =
							typeof value.replace === 'string'
								? (extendedObj[prop] as any[]).findIndex(
										(val) =>
											(val as any)?.name === value.replace
								  )
								: value.replace.index;
						(extendedObj[prop] as any[]).splice(
							index,
							index,
							...items
						);
					} else if (mode === 'removeArr') {
						const names = Array.isArray(value.names)
							? value.names
							: [value.names];
						names.forEach((name) => {
							const index = (
								extendedObj[prop] as any[]
							).findIndex((val) => (val as any)?.name === name);
							(extendedObj[prop] as any[]).splice(index, 1);
						});
					}
				};
				if (!(value as any).items) {
					action([]);
				} else if (Array.isArray((value as any).items)) {
					action((value as any).items);
				} else {
					action([(value as any).items]);
				}
			} else {
				console.error(
					`Illegal _copy._mod for ${obj.name}`,
					obj._copy?._mod
				);
				console.error(`Unhandled _mod mode ${mode} in ${obj.name}`);
			}
		});
	}
	if (replaceText) {
		return JSON.parse(
			JSON.stringify(extendedObj).replace(
				new RegExp(replaceText.replace, `${replaceText.flags ?? ''}g`),
				replaceText.with
			)
		);
	}
	return extendedObj;
}
