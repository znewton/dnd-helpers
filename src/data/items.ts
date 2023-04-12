/* eslint-disable no-underscore-dangle */
import { entriesToMarkdown, isOwned } from '../utils';
import { Entry, FiveEToolsBasePath, getJsonData } from './common';

export interface IItemTypeAdditionalEntries {
	appliesTo: string;
	source: string;
	entries: Entry[];
}

export interface IItemEntry {
	name: string;
	source: string;
	// TODO: these have special templates like {{item.detail1}} or {{item.resist}}
	entriesTemplate: Entry[];
}

export enum ItemDamageTypeAbbrev {
	A = 'Acid',
	B = 'Bludgeoning',
	C = 'Cold',
	F = 'Fire',
	O = 'Force',
	L = 'Lightning',
	N = 'Necrotic',
	P = 'Piercing',
	I = 'Poison',
	Y = 'Psychic',
	R = 'Radiant',
	S = 'Slashing',
	T = 'Thunder',
}

export enum ItemTypeAbbrev {
	R = 'Weapon, Ranged',
	M = 'Weapon, Melee',
	A = 'Ammunition',
	HA = 'Heavy Armor',
	MA = 'Medium Armor',
	LA = 'Light Armor',
	S = 'Shield',
	SCF = 'Spellcasting Focus',
	AIR = 'Vehicle (Air)',
	SHP = 'Vehicle (Water)',
	SPC = 'Vehicle (Space)',
	VEH = 'Vehicle (Land)',
	AT = 'Artisan Tools',
	EXP = 'Explosive',
	EM = 'Eldritch Machine',
	F = 'Food',
	GS = 'Gaming Set',
	INS = 'Instrument',
	TG = 'Trade Good',
	RG = 'Ring',
	RD = 'Rod',
	WD = 'Wand',
	GV = 'Generic Variant',
	G = 'Adventuring Gear',
	MNT = 'Mount',
	MR = 'Master Rune',
	OTH = 'Other',
	P = 'Potion',
	SC = 'Scroll',
	T = 'Tools',
	TAH = 'Tack & Harness',
	'$' = 'Treasure',
}

export enum ItemPropertyAbbrev {
	A = 'Ammunition',
	AF = 'Ammunition (Firearm)',
	BF = 'Burst Fire',
	F = 'Finesse',
	H = 'Heavy',
	L = 'Light',
	LD = 'Loading',
	R = 'Reach',
	RLD = 'Reload',
	S = 'Special',
	T = 'Thrown',
	'2H' = 'Two-Handed',
	V = 'Versatile',
}

export enum ItemRechargeToFull {
	round = 'Every Round',
	restShort = 'Short Rest',
	restLong = 'Long Rest',
	dawn = 'Dawn',
	dusk = 'Dusk',
	midnight = 'Midnight',
	special = 'Special',
}

export interface IItemType {
	abbreviation: keyof typeof ItemTypeAbbrev;
	source: string;
	page: number;
	name?: string;
	entries: Entry[];
}

export interface IItemProperty {
	abbreviation: keyof typeof ItemPropertyAbbrev;
	source: string;
	page: number;
	entries?: Entry[];
	// TODO: these have special templates like {{prop_name}} and {{item.range}}
	template?: string;
}

export interface IItemBase {
	name: string;
	source: string;
	otherSources?: { source: string; page: number }[] | undefined;
	page: number;
	type?: keyof typeof ItemTypeAbbrev | undefined;
	/**
	 * Spellcasting Focus Type
	 */
	scfType?: string | undefined;
	rarity: string;
	weight?: number | undefined;
	value?: number | undefined;
	weaponCategory?: string | undefined;
	property?: (keyof typeof ItemPropertyAbbrev)[] | undefined;
	age?: string | undefined;
	/**
	 * Weapons
	 */
	range?: string | undefined;
	dmg1?: string | undefined;
	dmg2?: string | undefined;
	dmgType?: keyof typeof ItemDamageTypeAbbrev | undefined;
	weapon?: boolean | undefined;
	spear?: boolean | undefined;
	firearm?: boolean | undefined;
	sword?: boolean | undefined;
	bow?: boolean | undefined;
	/**
	 * Armor
	 */
	ac?: number | undefined;
	armor?: boolean | undefined;
	stealth?: boolean | undefined;
	strength?: string | undefined;
	/**
	 * Sometimes like `arrow|phb`
	 */
	ammoType?: string | undefined;
	entries?: Entry[] | undefined;
	/**
	 * Sometimes like `sling bullet|phb`
	 */
	packContents?:
		| ({ item: string; quantity: number } | string | { special: string })[]
		| undefined;
}

interface IModifySpeed {
	equal?:
		| {
				// E.g. "fly": "walk" -> Fly speed becomes walk speed
				[key: string]: string | number;
		  }
		| undefined;
	multiply?:
		| {
				// E.g. "walk": 2 -> walk speed multiplied by 2
				[key: string]: string | number;
		  }
		| undefined;
	static?:
		| {
				// E.g. "walk": 30 -> walk speed becomes 30 ft
				[key: string]: string | number;
		  }
		| undefined;
	bonus?:
		| {
				// E.g. "*": 5 -> all movement increased by 5
				[key: string]: string | number;
		  }
		| undefined;
}
type AbilityAbbrevs = {
	con: 'constitution';
	str: 'strength';
	dex: 'dexterity';
	int: 'intelligence';
	wis: 'wisdom';
	cha: 'charisma';
};
type AbilityModifier = {
	// E.g. "con": 2 -> Constitution +2
	[Property in keyof AbilityAbbrevs]: number;
};
type AbilityModifierChoice = {
	// E.g. "from": ["dex", "str"], "count": 1, "amount": 2 -> Choose to increase 1 of dex or strength by 2
	from: [keyof AbilityAbbrevs][];
	count: number;
	amount: 2;
};

interface IModifyAbility {
	// E.g. "con": 19 -> constitution score becomes 19 (unless already higher)
	static?: AbilityModifier | undefined;
	choose?: AbilityModifierChoice | undefined;
}

interface IContainerCapacity {
	weight?: number[] | undefined;
	weightless?: boolean | undefined;
}

// TODO: Reference 5etools parser for more info https://github.com/5etools-mirror-1/5etools-mirror-1.github.io/blob/6b51e49fb048372a06bddd741cb670a71ad4d8c5/js/parser.js#L641
export interface IItemEx extends IItemBase {
	additionalSources?: { source: string; page: number }[] | undefined;
	tier?: string | undefined;
	reqAttune?: string | boolean | undefined;
	// Sometimes like `artificer|tce`
	reqAttuneTags?:
		| {
				class?: string;
				background?: string;
				alignment?: string;
				creatureType?: string;
				race?: string;
		  }[]
		| undefined;
	// Categories
	wondrous?: boolean | undefined;
	tattoo?: boolean | undefined;
	curse?: boolean | undefined;
	poison?: boolean | undefined;
	sentient?: boolean | undefined;
	staff?: boolean | undefined;
	// Bonuses
	bonusSpellAttack?: string | undefined;
	bonusSaveDc?: string | undefined;
	bonusWeapon?: string | undefined;
	bonusWeaponAttack?: string | undefined;
	bonusWeaponDamage?: string | undefined;
	bonusAc?: string | undefined;
	bonusSavingThrow?: string | undefined;
	bonusWeaponCritDamage?: string | undefined;
	critThreshold?: number | undefined;
	grantsProficiency?: boolean | undefined;
	modifySpeed?: IModifySpeed | undefined;
	ability?:
		| IModifyAbility
		| AbilityModifier
		| AbilityModifierChoice
		| undefined;
	immune?: string[] | undefined;
	resist?: string[] | undefined;
	conditionImmune?: string[] | undefined;
	vulnerable?: string[] | undefined;
	// Other
	containerCapacity?: IContainerCapacity | undefined;
	atomicPackContents?: boolean | undefined;
	focus?: string[] | undefined;
	lootTables?: string[] | undefined;
	recharge?: keyof typeof ItemRechargeToFull | undefined;
	// Sometimes like {@dice 1d20}
	rechargeAmount?: string | number | undefined;
	charges?: number | undefined;
	miscTags?: string[] | undefined;
	detail1?: string | undefined;
	poisonTypes?: string[] | undefined;
	// If true, entries can have like "{#itemEntry Absorbing Tattoo|TCE}"
	// Use either `itemGroup` from items.json or `itemEntry` from items-base.json
	hasRefs?: boolean | undefined;
	attachedSpells?: string[] | undefined;
	// Sometimes like `replicate magic item|tce`
	optionalFeatures?: string[] | undefined;
	// Vehicles
	crew?: number | undefined;
	vehAc?: number | undefined;
	vehHp?: number | undefined;
	vehSpeed?: number | undefined;
	vehDmgThresh?: number | undefined;
	capPassenger?: number | undefined;
	capCargo?: number | undefined;
	seeAlsoVehicle?: string[] | undefined;
	// Extensions
	baseItem?: string | undefined;
	_copy?:
		| {
				name: string;
				source: string;
				_preserve?: { [key: string]: boolean | undefined };
				_mod?: any | undefined; // TODO: look for `insertArr`
		  }
		| undefined;
	// They are also included in ItemGroups
}

interface IItemGroup extends IItemEx {
	// Like `Acid Absorbing Tattoo|TCE`
	items: string[];
}

/**
 * Item with paired down and parsed information
 */
export interface IItem
	extends Pick<
		IItemEx,
		| 'name'
		| 'source'
		| 'page'
		| 'otherSources'
		| 'type'
		| 'weapon'
		| 'weaponCategory'
		| 'weight'
		| 'value'
		| 'rarity'
		| 'property'
		| 'reqAttune'
		| 'strength'
		| 'stealth'
		| 'ac'
		| 'range'
		| 'dmg1'
		| 'dmgType'
		| 'dmg2'
	> {
	entries: Entry[];
	propertyDetails: Record<
		string,
		{ fullName: string; entries?: Entry[] | undefined }
	>;
	typeEntries: Entry[];
}

interface IConversionReferenceData {
	itemMap: Record<string, IItemEx>;
	itemTypeMap: Record<string, IItemType>;
	itemEntryMap: Record<string, IItemEntry>;
	itemPropertyMap: Record<string, IItemProperty>;
	itemTypeAdditionalEntriesMap: Record<string, IItemTypeAdditionalEntries>;
	itemGroupMap: Record<string, IItemGroup>;
}

function replaceItemPropTemplate(item: IItemEx, template: string): string {
	return template.replace(/\{\{item\.([a-zA-Z0-9]+)\}\}/g, (_match, prop) => {
		const itemProp = (item as any)[prop];
		if (!itemProp) {
			throw new Error(
				`Item Property, ${prop}, for item entry not found for ${item.name}`
			);
		}
		return `${itemProp}`;
	});
}

function convertItemDataToItem(
	data: IItemEx,
	refs: IConversionReferenceData
): IItem {
	const item: IItem = {
		name: data.name,
		source: data.source,
		page: data.page,
		otherSources: [
			...(data.otherSources ?? []),
			...(data.additionalSources ?? []),
		],
		type: data.type,
		weapon: data.weapon,
		weaponCategory: data.weaponCategory,
		weight: data.weight,
		value: data.value,
		rarity: data.rarity,
		property: data.property,
		reqAttune: data.reqAttune,
		strength: data.strength,
		stealth: data.stealth,
		ac: data.ac,
		range: data.range,
		dmg1: data.dmg1,
		dmg2: data.dmg2,
		dmgType: data.dmgType,
		entries: [...(data.entries ?? [])],
		propertyDetails: {},
		typeEntries: [],
	};
	if (data.hasRefs) {
		const rawEntries = [...item.entries];
		const stringifiedReplacedEntries = JSON.stringify(rawEntries).replace(
			/\{#itemEntry ([a-zA-Z0-9 -']+)\|?[a-zA-Z0-9 -']*\}/g,
			(match, p1) => {
				const itemEntry = refs.itemEntryMap[p1];
				if (!itemEntry) {
					throw new Error(
						`Item Entry for ${data.name}'s ${match} Not Found`
					);
				}
				const stringifiedItemEntry: string = replaceItemPropTemplate(
					data,
					entriesToMarkdown(itemEntry.entriesTemplate)
				);
				return stringifiedItemEntry.replaceAll('\n', '\\n');
			}
		);
		try {
			item.entries = JSON.parse(stringifiedReplacedEntries);
		} catch (e) {
			console.log(stringifiedReplacedEntries);
			console.error(e);
			console.log(stringifiedReplacedEntries.substring(90, 110));
			throw e;
		}
	}
	item.property?.forEach((propertyAbbrev) => {
		const itemProperty = refs.itemPropertyMap[propertyAbbrev];
		if (!itemProperty) return;
		const propName = ItemPropertyAbbrev[propertyAbbrev];
		item.propertyDetails[propertyAbbrev] = {
			fullName: itemProperty.template
				? replaceItemPropTemplate(data, itemProperty.template).replace(
						'{{prop_name}}',
						propName
				  )
				: propName,
			entries: itemProperty.entries,
		};
	});
	if (
		item.type &&
		(refs.itemTypeMap[item.type] ||
			refs.itemTypeAdditionalEntriesMap[item.type])
	) {
		item.typeEntries.push(
			...[
				...(refs.itemTypeMap[item.type]?.entries ?? []),
				...(refs.itemTypeAdditionalEntriesMap[item.type]?.entries ??
					[]),
			]
		);
	}
	if (data._copy) {
		// TODO: HANDLE _mod
		const itemDataToCopy = refs.itemMap[data._copy.name];
		if (!itemDataToCopy) {
			throw new Error(
				`Copy Item (${data._copy.name}) Not Found for ${data.name}`
			);
		}
		const copiedItem = { ...convertItemDataToItem(itemDataToCopy, refs) };
		const preservedElements: any = {};
		Object.entries(data._copy._preserve ?? {}).forEach(
			([key, preserve]) => {
				if (!preserve) return;
				preservedElements[key] = (data as any)[key];
			}
		);
		return {
			...item,
			...copiedItem,
			...preservedElements,
		};
	}
	return item;
}

type ItemsBaseJson = {
	baseitem: IItemBase[];
	itemProperty: IItemProperty[];
	itemType: IItemType[];
	itemEntry: IItemEntry[];
	itemTypeAdditionalEntries: IItemTypeAdditionalEntries[];
};
const itemsBaseFilename = 'items-base.json';
const itemsBaseBaseUrl = `${FiveEToolsBasePath}/data`;

type ItemsJson = {
	item: IItemEx[];
	itemGroup: IItemGroup[];
};
const itemsFilename = 'items.json';
const itemsBaseUrl = `${FiveEToolsBasePath}/data`;

export async function listItems(): Promise<IItem[]> {
	const itemsBaseJson = await getJsonData<ItemsBaseJson>(
		itemsBaseFilename,
		itemsBaseBaseUrl,
		{
			baseitem: [],
			itemProperty: [],
			itemType: [],
			itemEntry: [],
			itemTypeAdditionalEntries: [],
		}
	);

	const itemsJson = await getJsonData<ItemsJson>(
		itemsFilename,
		itemsBaseUrl,
		{
			item: [],
			itemGroup: [],
		}
	);

	const items: IItemEx[] = [...itemsBaseJson.baseitem, ...itemsJson.item];
	const conversionRefs: IConversionReferenceData = {
		itemMap: {},
		itemTypeMap: {},
		itemEntryMap: {},
		itemPropertyMap: {},
		itemTypeAdditionalEntriesMap: {},
		itemGroupMap: {},
	};

	items.forEach((item) => {
		conversionRefs.itemMap[item.name] = item;
	});
	itemsBaseJson.itemProperty.forEach((itemProperty) => {
		conversionRefs.itemPropertyMap[itemProperty.abbreviation] =
			itemProperty;
	});
	itemsBaseJson.itemEntry.forEach((itemEntry) => {
		conversionRefs.itemEntryMap[itemEntry.name] = itemEntry;
	});
	itemsBaseJson.itemType.forEach((itemType) => {
		conversionRefs.itemTypeMap[itemType.abbreviation] = itemType;
	});
	itemsBaseJson.itemTypeAdditionalEntries.forEach(
		(itemTypeAdditionalEntries) => {
			conversionRefs.itemTypeAdditionalEntriesMap[
				itemTypeAdditionalEntries.appliesTo
			] = itemTypeAdditionalEntries;
		}
	);

	return items
		.map((item) => convertItemDataToItem(item as IItemEx, conversionRefs))
		.filter((item) => isOwned(item));
}
