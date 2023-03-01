import path from 'path';
import { promises as fs } from 'fs';
import config from '../config';
import { ISense, listSenses } from '../data';
import {
  entriesToMarkdown, normalizeFilename, toTitleCase,
} from '../utils';

function senseToMarkdown(sense: ISense): string {
  return `---
alias: ${toTitleCase(sense.name)}
tags: 5eTools, sense
---

# ${toTitleCase(sense.name)}

${entriesToMarkdown(sense.entries)}

---

**Source:** ${sense.source}, page ${sense.page}
`;
}

export async function generateSensesFiles() {
  const outputDir = path.join(config.outputRootDir ?? '/', config.outputDirs.senses);
  // Make directory and path to it
  await fs.mkdir(outputDir, { recursive: true });
  const senses = await listSenses();
  const fileWritePs: Promise<any>[] = [];
  senses.forEach((sense) => {
    const filePath = path.join(outputDir, `${normalizeFilename(sense.name)}.md`);
    const fileContents = senseToMarkdown(sense);
    fileWritePs.push(fs.writeFile(filePath, fileContents));
  });
  await Promise.all(fileWritePs);
}
