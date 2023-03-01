import path from 'path';
import { promises as fs } from 'fs';
import config from '../config';
import { IDisease, listDiseases } from '../data';
import {
  entriesToMarkdown, normalizeFilename, toTitleCase,
} from '../utils';

function diseaseToMarkdown(disease: IDisease): string {
  return `---
alias: ${toTitleCase(disease.name)}
tags: 5eTools, disease
---

# ${toTitleCase(disease.name)}

${entriesToMarkdown(disease.entries)}

---

**Source:** ${disease.source}, page ${disease.page}
`;
}

export async function generateDiseasesFiles() {
  const outputDir = path.join(config.outputRootDir ?? '/', config.outputDirs.diseases);
  // Make directory and path to it
  await fs.mkdir(outputDir, { recursive: true });
  const diseases = await listDiseases();
  const fileWritePs: Promise<any>[] = [];
  diseases.forEach((disease) => {
    const filePath = path.join(outputDir, `${normalizeFilename(disease.name)}.md`);
    const fileContents = diseaseToMarkdown(disease);
    fileWritePs.push(fs.writeFile(filePath, fileContents));
  });
  await Promise.all(fileWritePs);
}
