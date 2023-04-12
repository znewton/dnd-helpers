import path from 'path';
import { promises as fs } from 'fs';
import config from '../config';
import { ICondition, listConditions } from '../data';
import { entriesToMarkdown, normalizeFilename, toTitleCase } from '../utils';

function conditionToMarkdown(condition: ICondition): string {
	return `---
alias: ${toTitleCase(condition.name)}
tags: 5eTools, condition
---

# ${toTitleCase(condition.name)}

${entriesToMarkdown(condition.entries)}

---

**Source:** ${condition.source}, page ${condition.page}
`;
}

export async function generateConditionsFiles() {
	const outputDir = path.join(
		config.outputRootDir ?? '/',
		config.outputDirs.conditions
	);
	// Make directory and path to it
	await fs.mkdir(outputDir, { recursive: true });
	const conditions = await listConditions();
	const fileWritePs: Promise<any>[] = [];
	conditions.forEach((condition) => {
		const filePath = path.join(
			outputDir,
			`${normalizeFilename(condition.name)}.md`
		);
		const fileContents = conditionToMarkdown(condition);
		fileWritePs.push(fs.writeFile(filePath, fileContents));
	});
	await Promise.all(fileWritePs);
}
