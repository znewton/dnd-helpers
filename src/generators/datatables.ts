import path from 'path';
import { PathLike, promises as fs } from 'fs';
import config from '../config';
import { toTitleCase } from '../utils';
import type { ICreature, IItem, ISpell } from '../data';

interface IDataTableColumn<T> {
	name: keyof T;
	filterType: 'equals' | 'contains';
	/**
	 * Lower number means highest sort priority.
	 * Less than 0 removes from sort priority list
	 */
	sortPriority: number;
}

function buildFilterableDataTable<T>(
	tableName: string,
	columns: IDataTableColumn<T>[],
	sourceDir: PathLike
): string {
	const columnNames: string[] = [];

	return `---
tags: datatable
cssclass: fullwidth
---

# ${toTitleCase(tableName)}

See [Obsidian Dataview Documentation](https://blacksmithgu.github.io/obsidian-dataview/queries/structure/#filter-sort-group-or-limit-results) for query help.

\`\`\`dataview
TABLE ${columnNames.join(', ')}
FROM "${sourceDir}"
SORT ${[...columns]
		.filter((column) => column.sortPriority >= 0)
		.sort((a, b) => a.sortPriority - b.sortPriority)
		.map((column) => column.name)
		.join(', ')} asc
\`\`\`
`;
}

const bestiaryDataTable = buildFilterableDataTable<ICreature>(
	'Bestiary',
	[
		{ name: 'name', filterType: 'contains', sortPriority: 3 },
		{ name: 'cr', filterType: 'equals', sortPriority: 0 },
		{ name: 'type', filterType: 'contains', sortPriority: 1 },
		{ name: 'environment', filterType: 'contains', sortPriority: 2 },
	],
	path.join(config.outputRootDir ?? '/', config.outputDirs.creatures)
);
const itemDataTable = buildFilterableDataTable<IItem>(
	'Items',
	[
		{ name: 'name', filterType: 'contains', sortPriority: 0 },
		{ name: 'type', filterType: 'contains', sortPriority: 1 },
		{ name: 'value', filterType: 'equals', sortPriority: 2 },
		{ name: 'weight', filterType: 'equals', sortPriority: 3 },
		{ name: 'rarity', filterType: 'contains', sortPriority: 4 },
	],
	path.join(config.outputRootDir ?? '/', config.outputDirs.items)
);
const spellsDataTable = buildFilterableDataTable<ISpell>(
	'Spells',
	[
		{ name: 'name', filterType: 'contains', sortPriority: 1 },
		{ name: 'level', filterType: 'equals', sortPriority: 0 },
		{ name: 'components', filterType: 'contains', sortPriority: -1 },
		{ name: 'school', filterType: 'contains', sortPriority: -1 },
		{ name: 'classes', filterType: 'contains', sortPriority: -1 },
	],
	path.join(config.outputRootDir ?? '/', config.outputDirs.spells)
);

export async function generateDataTableFiles() {
	const outputDir = path.join(
		config.outputRootDir ?? '/',
		config.outputDirs.datatables
	);
	// Make directory and path to it
	await fs.mkdir(outputDir, { recursive: true });
	const dataTableFiles: Record<string, string> = {
		Bestiary: bestiaryDataTable,
		Items: itemDataTable,
		Spells: spellsDataTable,
	};
	const fileWritePs: Promise<any>[] = [];
	Object.entries(dataTableFiles).forEach(([fileName, contents]) => {
		const filePath = path.join(outputDir, `${fileName}.md`);
		fileWritePs.push(fs.writeFile(filePath, contents));
	});
	await Promise.all(fileWritePs);
}
