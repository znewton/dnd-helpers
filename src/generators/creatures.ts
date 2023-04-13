import path from 'path';
import { promises as fs } from 'fs';
import { Document as YamlDocument } from 'yaml';
import config from '../config';
import { ICreature, listCreatures } from '../data';
import {
	build5eMonsterFromJson,
	entriesToMarkdown,
	normalizeFilename,
	obsidianLink,
	toTitleCase,
} from '../utils';

function creatureToMarkdown(creature: ICreature): string {
	const ttrpgStatblock = build5eMonsterFromJson(creature as any);
	if (creature.environment) {
		(ttrpgStatblock as any).environment = creature.environment;
	}
	const editedSpells = ttrpgStatblock.spells?.map((spell) => {
		if (typeof spell !== 'object') {
			return spell;
		}
		const editedSpell: Record<string, string> = {};
		Object.entries(spell).forEach(([key, value]) => {
			const spells = value.split(', ');
			editedSpell[key] = spells
				.map((spellName) => {
					const splitName = spellName.split(' (');
					if (!splitName[0]) {
						throw new Error(`Unhandled spell name: ${spellName}`);
					}
					return `${obsidianLink(splitName[0])}${
						splitName[1] ? ` (${splitName[1]}` : ''
					}`;
				})
				.join(', ');
		});
		return editedSpell;
	});
	const statblockYaml = new YamlDocument({
		...ttrpgStatblock,
		spells: editedSpells,
	});
	const description = [
		creature.fluff?.entries
			? entriesToMarkdown(creature.fluff?.entries)
			: undefined,
		creature.variant ? entriesToMarkdown(creature.variant) : undefined,
	].filter((v) => v !== undefined);
	return `---
alias: ${toTitleCase(creature.name)}
tags: 5eTools, creature
statblock: true
${statblockYaml.toString()}
---

# ${toTitleCase(creature.name)}

\`\`\`statblock
creature: ${creature.name}
\`\`\`
${description ? `\n${description}\n` : ''}
---

**Source:** ${creature.source}, page ${creature.page}
`;
}

export async function generateCreaturesFiles() {
	const outputDir = path.join(
		config.outputRootDir ?? '/',
		config.outputDirs.creatures
	);
	// Make directory and path to it
	await fs.mkdir(outputDir, { recursive: true });
	const creatures = await listCreatures();
	const fileWritePs: Promise<any>[] = [];
	creatures.forEach((creature) => {
		const filePath = path.join(
			outputDir,
			`${normalizeFilename(creature.name)}.md`
		);
		const fileContents = creatureToMarkdown(creature);
		fileWritePs.push(fs.writeFile(filePath, fileContents));
	});
	await Promise.all(fileWritePs);
}
