import path from 'path';
import { promises as fs } from 'fs';
import { Document as YamlDocument } from 'yaml';
import config from '../config';
import { ICreature, listCreatures } from '../data';
import {
  build5eMonsterFromJson,
  entriesToMarkdown,
  normalizeFilename,
  toTitleCase,
} from '../utils';

function creatureToMarkdown(creature: ICreature): string {
  const ttrpgStatblock = build5eMonsterFromJson(creature as any);
  const statblockYaml = new YamlDocument({ ...ttrpgStatblock });
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

${creature.fluff?.entries ? entriesToMarkdown(creature.fluff?.entries) : ''}

---

**Source:** ${creature.source}, page ${creature.page}
`;
}

export async function generateCreaturesFiles() {
  const outputDir = path.join(config.outputRootDir ?? '/', config.outputDirs.creatures);
  // Make directory and path to it
  await fs.mkdir(outputDir, { recursive: true });
  const creatures = await listCreatures();
  const fileWritePs: Promise<any>[] = [];
  creatures.forEach((creature) => {
    const filePath = path.join(outputDir, `${normalizeFilename(creature.name)}.md`);
    const fileContents = creatureToMarkdown(creature);
    fileWritePs.push(fs.writeFile(filePath, fileContents));
  });
  await Promise.all(fileWritePs);
}
