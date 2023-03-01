import path from 'path';
import { promises as fs } from 'fs';
import config from '../config';
import { IAction, listActions } from '../data';
import {
  entriesToMarkdown, normalizeFilename, toTitleCase, obsidianLink, buildMarkdownPropertyTable, combatTimeToString,
} from '../utils';

function actionToMarkdown(action: IAction): string {
  return `---
alias: ${toTitleCase(action.name)}
tags: 5eTools, action
---

# ${toTitleCase(action.name)}

${buildMarkdownPropertyTable(
    ['Time', action.time ? combatTimeToString(action.time) : '-'],
  )}

${entriesToMarkdown(action.entries)}
${action.seeAlsoAction ? `${action.seeAlsoAction.map((seeAlsoAction) => obsidianLink(seeAlsoAction)).join(', ')}` : ''}

---

**Source:** ${action.source}, page ${action.page}
`;
}

export async function generateActionsFiles() {
  const outputDir = path.join(config.outputRootDir ?? '/', config.outputDirs.actions);
  // Make directory and path to it
  await fs.mkdir(outputDir, { recursive: true });
  const actions = await listActions();
  const fileWritePs: Promise<any>[] = [];
  actions.forEach((action) => {
    const filePath = path.join(outputDir, `${normalizeFilename(action.name)}.md`);
    const fileContents = actionToMarkdown(action);
    fileWritePs.push(fs.writeFile(filePath, fileContents));
  });
  await Promise.all(fileWritePs);
}
