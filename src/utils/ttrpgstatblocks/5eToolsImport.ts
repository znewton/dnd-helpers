/* eslint-disable */
import type { ability, Monster } from './types';
import type {
	Creature5eTools,
	Size,
	_SpeedVal,
	EntrySpellcasting,
	EntrySpellcastingFrequency,
	_ArrayOfSpell,
	Align,
	Alignment,
} from './bestiary';
import { SOURCE_JSON_TO_FULL } from '../ownership';

function stringify(
	property:
		| Record<string, any>
		| string
		| any[]
		| number
		| boolean
		| undefined,
	depth: number = 0,
	joiner: string = ' ',
	parens = true
): string {
	if (depth === 5 || property === null || property === undefined) {
		return '';
	}
	if (typeof property === 'string') {
		return property;
	}
	if (typeof property === 'number') {
		return `${property}`;
	}
	if (Array.isArray(property)) {
		const value = property.map((p) => stringify(p, depth + 1)).join(joiner);
		if (parens) {
			return `(${value})`;
		}
		return value;
	}
	if (typeof property === 'object') {
		const result: string[] = [];
		Object.values(property).forEach((value) => {
			result.push(stringify(value, depth + 1));
		});
		return result.join(' ');
	}
	return '';
}

const abilityMap: { [key: string]: string } = {
	str: 'strength',
	dex: 'dexterity',
	con: 'constitution',
	wis: 'wisdom',
	int: 'intelligence',
	cha: 'charisma',
};

function parseString(str: string) {
	if (!str) return '';
	return str
		.replace(/{@condition (.+?)}/g, '$1')
		.replace(/{@item (.+?)}/g, '$1')
		.replace(/{@spell ([\s\S]+?)}/g, '$1')
		.replace(/{@recharge (.+?)}/g, '(Recharge $1-6)')
		.replace(/{@recharge}/g, '(Recharge 6)')
		.replace(/{@h}/g, '')
		.replace(/{@damage (.+?)}/g, '$1')
		.replace(/{@atk ms}/g, 'Melee Spell Attack')
		.replace(/{@atk rs}/g, 'Ranged Spell Attack')
		.replace(/{@atk mw}/g, 'Melee Weapon Attack')
		.replace(/{@atk rw}/g, 'Ranged Weapon Attack')
		.replace(/{@atk mw,rw}/g, 'Melee / Ranged Weapon Attack')
		.replace(/{@creature (.+?)}/g, '$1')
		.replace(/{@skill (.+?)}/g, '$1')
		.replace(/{@dice (.+?)}/g, '$1')
		.replace(/{@hit (\d+?)}/g, '+$1')
		.replace(/{@dc (\d+?)}/g, '$1')
		.replace(/{@quickref (.+?)\|\|.+?}/, '$1');
}

/**
 * Make all properties in T optional
 */
type ExactPartial<T> = {
	[P in keyof T]?: T[P] | undefined;
};
export function build5eMonsterFromJson(
	monster: Creature5eTools
): ExactPartial<Monster> {
	return {
		image: undefined,
		name: monster.name,
		source: getSource(monster),
		type: getType(monster.type),
		subtype: '',
		size: monster.size
			? SIZE_ABV_TO_FULL[monster.size[0] as Size]
			: undefined,
		alignment: getMonsterAlignment(monster),
		hp:
			monster.hp && 'average' in monster.hp
				? monster.hp?.average
				: undefined,
		hit_dice:
			monster.hp && 'formula' in monster.hp ? monster.hp?.formula : '',
		ac: getAc(monster.ac) || undefined,
		speed: getSpeedString(monster),
		stats: [
			monster.str ?? 10,
			monster.dex ?? 10,
			monster.con ?? 10,
			monster.int ?? 10,
			monster.wis ?? 10,
			monster.cha ?? 10,
		],
		damage_immunities: parseString(parseImmune(monster.immune)),
		damage_resistances: parseString(parseImmune(monster.resist)),
		damage_vulnerabilities: parseString(parseImmune(monster.vulnerable)),
		condition_immunities: parseString(parseImmune(monster.conditionImmune)),
		saves: getSaves(monster),
		skillsaves: getSkillsaves(monster),
		senses: getSenses(monster),
		languages: stringify(monster.languages || undefined, 0, ', ', false),
		cr: getCR(monster.cr),
		traits: monster.trait?.flatMap(normalizeEntries) ?? [],
		actions: monster.action?.flatMap(normalizeEntries) ?? [],
		bonus_actions: monster.bonus?.flatMap(normalizeEntries) ?? [],
		reactions: monster.reaction?.flatMap(normalizeEntries) ?? [],
		legendary_actions: monster.legendary?.flatMap(normalizeEntries) ?? [],
		mythic_actions: [
			...((monster.mythicHeader
				? [
						{
							name: '',
							entries: monster.mythicHeader,
						},
				  ]
				: []
			).flatMap(normalizeEntries) ?? []),
			...(monster.mythic?.flatMap(normalizeEntries) ?? []),
		],
		spells: getSpells(monster),
		spellsNotes: getSpellNotes(monster).join(' '),
	};
}

function getSaves(monster: Creature5eTools): Monster['saves'] {
	const entries: { [K in ability]?: number }[] = [];
	Object.entries(monster.save ?? {}).forEach(
		(thr: [ability: keyof typeof abilityMap, value: string]) => {
			if (!thr || !thr[1]) return;
			const [, v] = thr[1]?.match(/.*?(\d+)/) ?? [];
			if (!v) return;
			entries.push({
				[abilityMap[thr[0] as string | number] as string]: v,
			});
		}
	);
	return entries;
}

function getType(type: Creature5eTools['type']) {
	if (!type) return;
	if (typeof type === 'string') {
		return type;
	}
	return type.type;
}
function getCR(type: Creature5eTools['cr']) {
	if (!type) return;
	if (typeof type === 'string') {
		return type;
	}
	return type.cr;
}

function getSpellNotes(monster: Creature5eTools) {
	const spellNotes: string[] = [];

	for (const element of monster.spellcasting || []) {
		if (!element) continue;
		spellNotes.push(stringify(element.footerEntries, 0, ', ', false));
	}

	return spellNotes;
}

function parseImmune(
	immune:
		| Creature5eTools['immune']
		| Creature5eTools['resist']
		| Creature5eTools['vulnerable']
		| Creature5eTools['conditionImmune']
): string {
	if (!immune) return '';
	const ret = [];
	for (const imm of immune) {
		if (typeof imm === 'string') {
			ret.push(imm);
			continue;
		}
		if ('special' in imm) {
			ret.push(imm.special);
			continue;
		}
		if ('immune' in imm) {
			ret.push(
				`${parseImmune(imm.immune)}${imm.note ? ' ' : ''}${
					imm.note ? imm.note : ''
				}`
			);
			continue;
		}
		if ('resist' in imm) {
			ret.push(
				`${parseImmune(imm.resist)}${imm.note ? ' ' : ''}${
					imm.note ? imm.note : ''
				}`
			);
			continue;
		}
	}
	return ret.join(', ');
}

function getAc(acField: Creature5eTools['ac'] = []) {
	const [item] = acField;
	if (!item) return;
	if (typeof item === 'number') {
		return item;
	}
	if (typeof item === 'string') {
		const [_, ac] = (item as string).match(/(\d+)/) ?? [];
		return ac ? Number(ac) : null;
	}
	if (typeof item !== 'object') return;
	if ('special' in item) {
		return null;
	}
	return item.ac;
}

const spellMap: { [K in keyof EntrySpellcasting['spells']]: string } = {
	0: 'Cantrips (at will)',
	1: '1st level',
	2: '2nd level',
	3: '3rd level',
	4: '4th level',
	5: '5th level',
	6: '6th level',
	7: '7th level',
	8: '8th level',
	9: '9th level',
};

type ExtractedSpells = Array<string | Record<string, string>>;

function getSpellStringFromArray(spellsArray: _ArrayOfSpell) {
	const ret: string[] = [];
	for (const entry of spellsArray) {
		if (typeof entry === 'string') {
			ret.push(entry);
			continue;
		}
		if (!entry.hidden && entry.entry && entry.entry.length) {
			ret.push(entry.entry);
		}
	}
	return parseString(ret.join(', '));
}
type SpellFrequency = Array<[frequency: number, spells: string]>;
function getSpellsFromFrequency(
	spells: EntrySpellcastingFrequency
): SpellFrequency {
	const ret: SpellFrequency = [];
	for (const freqString of Object.keys(spells)) {
		const spellArray = spells[freqString as keyof typeof spells];
		if (!spellArray) continue;
		const frequency = Number(freqString.replace(/[^0-9]/, ''));
		ret.push([frequency, getSpellStringFromArray(spellArray)]);
	}
	return ret;
}

function extractSpellsBlocks(spellBlock: EntrySpellcasting): ExtractedSpells {
	const ret: ExtractedSpells = [
		parseString((spellBlock.headerEntries ?? []).join('\n')),
	];

	if ('spells' in spellBlock) {
		try {
			for (const level in Object.keys(spellBlock.spells ?? {})) {
				const block =
					spellBlock.spells[level as keyof typeof spellBlock.spells];
				if (!block) continue;
				const { spells } = block;
				let name: string = `${
					(spellMap as Record<string, string>)[
						level as keyof typeof spellBlock.spells
					]
				}`;
				name += 'slots' in block ? ` (${block.slots} slots)` : '';

				const sp = parseString(spells.join(', '));
				ret.push({ [name]: sp });
			}
		} catch (e) {
			throw new Error('There was an error parsing the spells.');
		}
	}
	if ('will' in spellBlock) {
		if (spellBlock.will.length > 0) {
			try {
				ret.push({
					'At will': getSpellStringFromArray(spellBlock.will),
				});
			} catch (e) {
				throw new Error(
					'There was an error parsing the at-will spells.'
				);
			}
		}
	}
	if ('ritual' in spellBlock) {
		if (spellBlock.ritual.length > 0) {
			try {
				ret.push({
					Rituals: getSpellStringFromArray(spellBlock.ritual),
				});
			} catch (e) {
				throw new Error(
					'There was an error parsing the ritual spells.'
				);
			}
		}
	}

	const frequencyCasting = [
		'rest',
		'daily',
		'weekly',
		'yearly',
		'charges',
	] as const;
	const frequencyMap: { [K in (typeof frequencyCasting)[number]]: string } = {
		rest: '/rest each',
		daily: '/day each',
		weekly: '/week each',
		yearly: '/year each',
		charges: ' charges',
	};
	for (const frequency of frequencyCasting) {
		if (frequency in spellBlock) {
			if (spellBlock[frequency] === undefined) continue;
			const entries = getSpellsFromFrequency(
				spellBlock[frequency] as EntrySpellcastingFrequency
			);
			for (const entry of entries.sort((a, b) => b[0] - a[0])) {
				ret.push({
					[`${entry[0]}${frequencyMap[frequency]}`]: entry[1],
				});
			}
		}
	}

	return ret;
}

function getSpells(monster: Creature5eTools): ExtractedSpells {
	if (!monster.spellcasting || !monster.spellcasting.length) return [];

	return monster.spellcasting.flatMap(extractSpellsBlocks);
}
function getMonsterAlignment(monster: Creature5eTools): string | undefined {
	if (!monster.alignment) return undefined;
	return getAlignmentString(monster.alignment);
}
function getAlignmentString(
	alignment: Align[] | Align | Alignment
): string | undefined {
	if (!alignment) return undefined; // used in sidekicks
	const alignments: string[] = [];
	if (Array.isArray(alignment)) {
		for (const align of alignment) {
			const alignmentString = getAlignmentString(align);
			if (!alignmentString) continue;
			alignments.push(alignmentString);
		}
	} else if (typeof alignment === 'object') {
		if ('special' in alignment && alignment.special != null) {
			return alignment.special;
		}
		if ('alignment' in alignment) {
			return `${(alignment.alignment ?? [])
				.map((a) => getAlignmentString(a))
				.join(' ')}${
				alignment.chance ? ` (${alignment.chance}%)` : ''
			}${alignment.note ? ` (${alignment.note})` : ''}`;
		}
	} else {
		const code = alignment.toUpperCase();
		switch (code) {
			case 'L':
				return 'lawful';
			case 'N':
				return 'neutral';
			case 'NX':
				return 'neutral (law/chaos axis)';
			case 'NY':
				return 'neutral (good/evil axis)';
			case 'C':
				return 'chaotic';
			case 'G':
				return 'good';
			case 'E':
				return 'evil';
			// "special" values
			case 'U':
				return 'unaligned';
			case 'A':
				return 'any alignment';
		}
		return alignment;
	}
	return alignments.join(' or ');
}

function getSpeedString(monster: Creature5eTools): string {
	const { speed } = monster;
	if (!speed) return '\u2014';
	if (typeof speed === 'number') return `${speed}`;

	function getVal(speedProp: _SpeedVal) {
		if (typeof speedProp === 'number') return speedProp;
		return speedProp.number != null ? speedProp.number : speedProp;
	}

	function getCond(speedProp: _SpeedVal) {
		if (typeof speedProp === 'number') return '';
		return speedProp?.condition ?? '';
	}

	const stack: string[] = [];
	const types = ['walk', 'burrow', 'climb', 'fly', 'swim'] as const;
	for (const type of types) {
		if (
			type != 'walk' &&
			!(type in speed) &&
			!(type in (speed.alternate ?? {}))
		) {
			continue;
		}
		stack.push(
			`${type === 'walk' ? '' : `${type} `}${getVal(
				speed[type] ?? 0
			)} ft. ${getCond(speed[type] ?? 0)}`.trim()
		);

		if (speed.alternate && speed.alternate[type]) {
			speed.alternate[type]?.forEach((s) => {
				stack.push(
					`${type === 'walk' ? '' : `${type} `}${getVal(
						s ?? 0
					)} ft. ${getCond(s)}`.trim()
				);
			});
		}
	}
	let joiner = ', ';
	if (speed.choose) {
		joiner = '; ';
		const from = speed.choose.from.sort();
		if (from.length > 1) {
			`${from.slice(0, from.length - 1).join(', ')} or ${
				from[from.length - 1]
			} ${speed.choose.amount} ft.${
				speed.choose.note ? ` ${speed.choose.note}` : ''
			}`;
		} else {
			stack.push(
				`${from} ${speed.choose.amount} ft.${
					speed.choose.note ? ` ${speed.choose.note}` : ''
				}`
			);
		}
	}
	return stack.join(joiner);
}

function getSenses(monster: Creature5eTools): string {
	if (typeof monster.senses === 'string') return monster.senses;
	const senses = [monster.senses?.join(', ').trim() ?? ''];
	if (monster.passive) {
		senses.push(`passive Perception ${monster.passive}`);
	}
	return senses.join(', ');
}

function getSource(monster: Creature5eTools) {
	const sources: string[] = [];
	if (monster.source?.length) {
		sources.push(SOURCE_JSON_TO_FULL[monster.source] ?? monster.source);
	}
	if (monster.otherSources?.length) {
		sources.push(
			...monster.otherSources.map(
				(s) => SOURCE_JSON_TO_FULL[s.source] ?? s.source
			)
		);
	}
	return sources;
}
type Entry =
	| number
	| string
	| {
			type: string;
			name: string;
			items: Array<
				| { name: string; entry: string }
				| { name: string; entries: string[] }
			>;
	  };
type NormalizedEntry = { name: string; desc: string };

/**
 * in some cases 5e.tool data json has not only strings, but objects inside, such as items, or dragon attacks
 * current code assumes that in mixed content simple stings go before list of items
 *
 * transforms complex traits into list of traits, e.g.
 *
 * ```
 * const input = {
 * 	"name": "Breath Weapons {@recharge 5}",
 * 	"entries": [
 * 		"The dragon uses one of the following breath weapons.",
 * 		{
 * 			"type": "list",
 * 			"style": "list-hang-notitle",
 * 			"items": [
 * 				{
 * 					"type": "item",
 * 					"name": "Fire Breath.",
 * 					"entry": "The dragon exhales fire in a 60-foot line that is 5 feet wide. Each creature in that line must make a {@dc 18} Dexterity saving throw, taking 45 ({@damage 13d6}) fire damage on a failed save, or half as much damage on a successful one."
 * 				},
 * 				{
 * 					"type": "item",
 * 					"name": "Sleep Breath.",
 * 					"entry": "The dragon exhales sleep gas in a 60-foot cone. Each creature in that area must succeed on a {@dc 18} Constitution saving throw or fall {@condition unconscious} for 10 minutes. This effect ends for a creature if the creature takes damage or someone uses an action to wake it."
 * 				}
 * 			]
 * 		}
 * 	]
 * };
 *
 * const output = [
 * 		{
 * 			"name": "Breath Weapons {@recharge 5}",
 * 			"desc": "The dragon uses one of the following breath weapons."
 * 		},
 * 		{
 * 			"name": "Fire Breath.",
 * 			"desc": "The dragon exhales fire in a 60-foot line that is 5 feet wide. Each creature in that line must make a {@dc 18} Dexterity saving throw, taking 45 ({@damage 13d6}) fire damage on a failed save, or half as much damage on a successful one."
 * 		},
 * 		{
 * 			"name": "Sleep Breath.",
 * 			"desc": "The dragon exhales sleep gas in a 60-foot cone. Each creature in that area must succeed on a {@dc 18} Constitution saving throw or fall {@condition unconscious} for 10 minutes. This effect ends for a creature if the creature takes damage or someone uses an action to wake it."
 * 		},
 * 	]
 *```
 */
function normalizeEntries(trait: {
	name?: string | undefined;
	entries?: any[] | undefined;
}): NormalizedEntry[] {
	const flattenedEntries = (trait.entries ?? []).reduce<
		{ name: string; entries: Entry[] }[]
	>(
		(acc, current) => {
			if (typeof current !== 'string' && typeof current !== 'number') {
				const items = current.items?.map((item: any) => {
					if (typeof item === 'string' || typeof item === 'number') {
						return { name: item, entries: [] };
					}
					if ('entry' in item) {
						return { name: item.name, entries: [item.entry] };
					}

					return { name: item.name, entries: item.entries };
				});
				return acc.concat(items ?? []);
			}

			const hasSubItems = acc.length > 1;
			// skip? simple strings if entries already have sub items
			if (!hasSubItems) {
				acc[0]?.entries.push(current);
			}

			return acc;
		},
		[{ name: trait.name ?? '?', entries: [] }]
	);

	return flattenedEntries.map(({ name, entries }) => ({
		name: parseString(name),
		desc: parseString(entries.join('\n')),
	}));
}

const SZ_FINE = 'F';
const SZ_DIMINUTIVE = 'D';
const SZ_TINY = 'T';
const SZ_SMALL = 'S';
const SZ_MEDIUM = 'M';
const SZ_LARGE = 'L';
const SZ_HUGE = 'H';
const SZ_GARGANTUAN = 'G';
const SZ_COLOSSAL = 'C';
const SZ_VARIES = 'V';

const SIZE_ABV_TO_FULL: { [K in Size]: string } = {
	[SZ_FINE]: 'Fine',
	[SZ_DIMINUTIVE]: 'Diminutive',
	[SZ_TINY]: 'Tiny',
	[SZ_SMALL]: 'Small',
	[SZ_MEDIUM]: 'Medium',
	[SZ_LARGE]: 'Large',
	[SZ_HUGE]: 'Huge',
	[SZ_GARGANTUAN]: 'Gargantuan',
	[SZ_COLOSSAL]: 'Colossal',
	[SZ_VARIES]: 'Varies',
};

function getSkillsaves(
	monster: Creature5eTools
): { [K in keyof Creature5eTools['skill']]: number }[] {
	const skills = monster.skill;
	if (!skills) return [];
	const stack = [];
	const plus = [];
	for (const name of Object.keys(skills) as Array<keyof typeof skills>) {
		if (name == 'other') {
			const other = skills[name];
			if (!other) continue;
			for (const entry of other) {
				const { oneOf } = entry;
				if (!oneOf) continue;
				const keys = (
					Object.keys(oneOf) as Array<keyof typeof oneOf>
				).sort();
				const firstKey = keys.shift();
				if (!firstKey) continue;
				const first = oneOf[firstKey];
				const [, v] = first?.match(/.*?(\d+)/) ?? [];
				plus.push({
					[`plus one of the following: ${
						firstKey.charAt(0).toUpperCase() + firstKey.slice(1)
					}`]: v,
				});
				for (const name of keys.slice(1)) {
					const skill = oneOf[name];
					const [, v] = skill?.match(/.*?(\d+)/) ?? [];

					if (!v) continue;
					plus.push({ [name]: v });
				}
			}
			continue;
		}
		const skill = skills[name];
		const [, v] = skill?.match(/.*?(\d+)/) ?? [];

		if (!v) continue;
		stack.push({ [name]: v });
	}
	return [...stack.filter((v) => v), ...plus.filter((v) => v)];
}
