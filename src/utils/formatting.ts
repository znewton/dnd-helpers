/* eslint-disable @typescript-eslint/no-use-before-define */
import type { ICreatureDetailedMovement, ICreatureSpeed } from '../data';
import type { CombatTime, Entry, IEntry, TableEntryCell } from '../data/common';
import { obsidianLink } from './filenames';

export function toTitleCase(str: string): string {
	return str
		.split(' ')
		.map(
			(chunk) =>
				`${chunk[0]?.toUpperCase()}${chunk.substring(1).toLowerCase()}`
		)
		.join(' ');
}

export function formatCreatureSpeed(speeds: number | ICreatureSpeed): string {
	if (typeof speeds === 'number') {
		return `${speeds} ft.`;
	}
	return Object.entries(speeds)
		.map(
			([type, speed]: [
				string,
				number | ICreatureDetailedMovement | undefined
			]) => {
				if (speed === undefined) {
					throw new Error('Invalid (undefined) speed for race');
				}
				if (typeof speed === 'number') {
					return `${type === 'walk' ? '' : `${type} `}${speed} ft.`;
				}
				return `${type === 'walk' ? '' : `${type} `}${
					speed.number
				} ft. ${speed.condition}`;
			}
		)
		.join('; ');
}

export function combatTimeToString(combatTimes: CombatTime[]): string {
	const times: string[] = [];

	combatTimes.forEach((combatTime): void => {
		if (typeof combatTime === 'string') {
			times.push(combatTime);
			return;
		}
		const { number, unit } = combatTime;
		const isPlural = number > 1;
		const unitText = toTitleCase(
			`${unit === 'bonus' ? 'bonus action' : unit}${isPlural ? 's' : ''}`
		);
		times.push(`${number} ${unitText}`);
	});

	return times.join(' or ');
}

/**
 * Replace 5eTools links with Obsidian links or special text.
 */
export function reformat5eToolsLinks(text: string) {
	if (typeof text !== 'string') {
		throw new Error('Invalid 5eTools text: not a string');
	}
	// if (/\{@item ([0-9a-zA-Z ]+)(\|?\|([a-zA-Z0-9 ']+))?\}/.test(text)) {
	//   console.log('Item link', text);
	// }
	// if (/\{@creature ([0-9a-zA-Z ]+)(\|?\|([a-zA-Z0-9 ']+))?\}/.test(text)) {
	//   console.log('Creature link', text);
	// }
	// if (/\{@quickref ([0-9a-zA-Z ]+)(\|?\|([a-zA-Z0-9 ']+))?\}/.test(text)) {
	//   console.log('QuickRef link', text);
	// }
	return (
		text
			.replace(/\{@condition ([a-zA-Z0-9 ]+)\}/g, (_match, p1) =>
				obsidianLink(p1, toTitleCase(p1))
			)
			.replace(/\{@dice ([0-9a-zA-Z+ ]+)\}/g, '`dice: $1` ($1)')
			.replace(/\{@damage ([0-9a-zA-Z+ ]+)\}/g, '`dice: $1` ($1)')
			.replace(/\{@spell ([0-9a-zA-Z ]+)\}/g, (_match, p1) =>
				obsidianLink(p1, p1.toLowerCase())
			)
			.replace(
				/\{@item ([0-9a-zA-Z ]+)(\|?[a-zA-Z0-9 ']*\|([a-zA-Z0-9 ']+))?\}/g,
				(_match, p1) => obsidianLink(p1, toTitleCase(p1))
			)
			.replace(
				/\{@creature ([0-9a-zA-Z ]+)(\|?[a-zA-Z0-9 ']*\|([a-zA-Z0-9 ']+))?\}/g,
				(_match, p1) => obsidianLink(p1, toTitleCase(p1))
			)
			.replace(
				/\{@quickref ([0-9a-zA-Z ]+)(\|?[a-zA-Z0-9 ']*\|([a-zA-Z0-9 ']+))?\}/g,
				(_match, p1) => obsidianLink(p1, toTitleCase(p1))
			)
			.replace(/\{@b ([A-Za-z0-9 ]+)\}/g, '**$1**')
			.replace(/\{@i ([A-Za-z0-9 ]+)\}/g, '_$1_')
			.replace(/\{@atk ms\}/g, '_Melee Spell Attack_')
			.replace(/\{@atk rs\}/g, '_Ranged Spell Attack_')
			.replace(/\{@atk mw\}/g, '_Melee Weapon Attack_')
			.replace(/\{@atk rw\}/g, '_Ranged Weapon Attack_')
			.replace(/\{@atk mw,rw\}/g, '_Melee / Ranged Weapon Attack_')
			.replace(/\{@action ([A-Za-z0-9 ]+)\}/g, (_match, p1) =>
				obsidianLink(p1)
			)
			.replace(
				/^\{@note (.+)\}$/g,
				(_match, p1): string =>
					`> [!note] Note\n> ${reformat5eToolsLinks(p1)}`
			)
			.replace(
				/([A-Z][a-z]+) \(\{@skill ([0-9a-zA-Z ]+)\}\)/g,
				(_match, p1, p2) =>
					obsidianLink(p2, `${toTitleCase(p1)} (${toTitleCase(p2)})`)
			)
			// TODO: Still link to Abilities descriptions?
			.replace(/DC ([0-9]+) ([A-Z][a-z]+) saving/g, 'DC $1 $2 saving')
	);
}

export function buildMarkdownPropertyTable(
	...rows: [string, string | undefined][]
) {
	const table = ['| | |', '| ---: | :--- |'];

	rows.forEach(([key, value]) => {
		if (key && value) {
			table.push(`| **${key}:** | ${value} |`);
		}
	});

	return table.join('\n');
}

function entryToMarkdown(entry: Entry): string | undefined {
	if (!entry) {
		return undefined;
	}
	if (typeof entry === 'string') {
		return reformat5eToolsLinks(entry);
	}

	/**
	 * Wrapper
	 * (note): This is not really used.
	 */
	if (entry.type === 'wrapper') {
		if (
			['property', 'note', 'magicvariant'].includes(
				entry.data.item__mergedEntryTag
			)
		) {
			// All properties are linked
			// "note" entries are 5e.tools specific
			// magicvariant links to a bunch of other items that can be made into a variant
			return undefined;
		}
		if (
			entry.data.item__mergedEntryTag === 'type' &&
			typeof entry.wrapped === 'object' &&
			(entry.wrapped as IEntry).name === 'Range'
		) {
			// Range is formatted as a linked property
			return undefined;
		}
		// TODO: Vehicles have extra description... maybe figure out linking types
		return undefined;
	}

	/**
	 * Link Entry
	 */
	if (entry.type === 'link') {
		if (entry.href.type !== 'internal') {
			throw new Error(
				`Unexpected href type encountered: ${entry.href.type}`
			);
		}
		const url = new URL(entry.href.path, 'https://5e.tools');
		if (entry.href.hash) {
			if (entry.href.hashPreEncoded) {
				url.hash = entry.href.hash;
			} else {
				url.hash = encodeURIComponent(entry.href.hash);
			}
		}
		return `[${entry.text}](${url.toString()})`;
	}

	/**
	 * Sub Entries
	 */
	const isIEntry = (entryToCheck: unknown): entryToCheck is IEntry =>
		[
			'entries',
			'inset',
			'inline',
			'section',
			'variant',
			'variantSub',
			'variantInner',
		].includes((entryToCheck as IEntry).type);
	if (isIEntry(entry)) {
		const markdownEntries: string[] = [];
		if (entry.name && entry.type !== 'variant') {
			markdownEntries.push(
				`${!['inset', 'inline'].includes(entry.type) ? '\n\n' : ''}**_${
					entry.name
				}._**`
			);
		}

		markdownEntries.push(entriesToMarkdown(entry.entries, ' '));

		if (entry.type === 'variant') {
			return `\n\n> [!info] **Variant:** ${
				entry.name ?? ''
			}\n>${markdownEntries.join('\n').replaceAll('\n', '\n> ')}`;
		}
		if (entry.type === 'inset') {
			return `\n\n> ${markdownEntries
				.join('\n')
				.replaceAll('\n', '\n> ')}`;
		}
		if (entry.type === 'inline') {
			markdownEntries.join(' ').replaceAll('\n', ' ');
		}

		return markdownEntries.join(' ');
	}

	/**
	 * Quote
	 */
	if (entry.type === 'quote') {
		const markdownEntries: string[] = [];
		markdownEntries.push('> [!quote]');
		markdownEntries.push(entriesToMarkdown(entry.entries));
		markdownEntries.push(`— ${entry.by}`);
		return markdownEntries.join('\n').replaceAll('\n', '\n> ');
	}

	/**
	 * Table
	 */
	if (entry.type === 'table') {
		const markdownEntries: string[] = [];

		markdownEntries.push(`\n## ${entry.caption}\n`);
		markdownEntries.push(`| ${entry.colLabels.join(' | ')} |`);
		markdownEntries.push(
			`| ${entry.colLabels.map(() => '---').join(' | ')} |`
		);
		entry.rows.forEach((row) => {
			const getTableCellText = (cell: TableEntryCell): string => {
				if (typeof cell === 'number') {
					return `${cell}`;
				}
				if (typeof cell === 'string') {
					return reformat5eToolsLinks(cell);
				}

				if (cell.roll) {
					const roll =
						cell.roll.exact !== undefined
							? cell.roll.exact
							: `${cell.roll.min}-${cell.roll.max}`;

					if (cell.entry) {
						return `${roll} (${entryToMarkdown(cell.entry)})`;
					}

					return `${roll}`;
				}

				throw new Error(
					`Invalid table cell encountered: ${JSON.stringify(cell)}`
				);
			};
			markdownEntries.push(
				`| ${row.map(getTableCellText).join(' | ')} |`
			);
		});

		return markdownEntries.join('\n');
	}

	/**
	 * List
	 */
	if (entry.type === 'item' || entry.type === 'itemSpell') {
		const markdownEntries: string[] = [];
		if (entry.name) {
			markdownEntries.push(`**_${entry.name}._**`);
		}
		const markdownSubEntry = entryToMarkdown(entry.entry);
		if (markdownSubEntry && markdownSubEntry.length) {
			markdownEntries.push(markdownSubEntry);
		}
		return markdownEntries.join(' ');
	}
	if (entry.type === 'list') {
		const markdownEntries: string[] = [];

		markdownEntries.push('\n');
		entry.items.forEach((item) => {
			markdownEntries.push(`- ${entryToMarkdown(item)}`);
		});
		markdownEntries.push('\n');
		return markdownEntries.join('\n');
	}

	/**
	 * Spellcasting
	 */
	if (entry.type === 'spellcasting') {
		const markdownEntries: string[] = [];
		if (entry.name) {
			markdownEntries.push(`**_${entry.name}._**`);
		}
		if (entry.headerEntries) {
			markdownEntries.push(entriesToMarkdown(entry.headerEntries));
		}

		const spellLevelMap: { [level: string]: string } = {
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

		markdownEntries.push('\n');
		Object.entries(entry.spells ?? {}).forEach(
			([level, spellLevelInfo]) => {
				markdownEntries.push(
					`- ${spellLevelMap[level]} (${
						spellLevelInfo.slots
					} slots): ${spellLevelInfo.spells
						.map(reformat5eToolsLinks)
						.join(', ')}`
				);
			}
		);
		markdownEntries.push('\n');

		if (entry.footerEntries) {
			markdownEntries.push(entriesToMarkdown(entry.footerEntries));
		}
		return markdownEntries.join('\n');
	}

	throw new Error(`Invalid entry type encountered: ${JSON.stringify(entry)}`);
}
export function entriesToMarkdown(
	entries: Entry[],
	joiner: string = '\n'
): string {
	const markdownEntries: string[] = [];

	entries.forEach((entry) => {
		const markdownEntry = entryToMarkdown(entry);
		if (markdownEntry && markdownEntry.length) {
			markdownEntries.push(markdownEntry);
		}
	});

	return markdownEntries.join(joiner);
}
