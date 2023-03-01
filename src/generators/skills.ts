import path from 'path';
import { promises as fs } from 'fs';
import config from '../config';
import { ISkillDescription, listSkillDescriptions } from '../data';
import {
  entriesToMarkdown, normalizeFilename, toTitleCase,
} from '../utils';

function skillToMarkdown(skill: ISkillDescription): string {
  return `---
alias: ${toTitleCase(skill.name)}
tags: 5eTools, skill
---

# ${toTitleCase(skill.name)}

${entriesToMarkdown(skill.entries)}

---

**Source:** ${skill.source}, page ${skill.page}
`;
}

export async function generateSkillsFiles() {
  const outputDir = path.join(config.outputRootDir ?? '/', config.outputDirs.skills);
  // Make directory and path to it
  await fs.mkdir(outputDir, { recursive: true });
  const skills = await listSkillDescriptions();
  const fileWritePs: Promise<any>[] = [];
  skills.forEach((skill) => {
    const filePath = path.join(outputDir, `${normalizeFilename(skill.name)}.md`);
    const fileContents = skillToMarkdown(skill);
    fileWritePs.push(fs.writeFile(filePath, fileContents));
  });
  await Promise.all(fileWritePs);
}
