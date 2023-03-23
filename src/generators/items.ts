import path from 'path';
import { promises as fs } from 'fs';
import config from '../config';
import { IItemEx, listItems } from '../data';
import {
  buildMarkdownPropertyTable,
  entriesToMarkdown, normalizeFilename, toTitleCase,
} from '../utils';

function formatItemValue(item: IItemEx) {
  if (item.value === undefined) {
    const valueByRarity = {
      none: '0-49 gp',
      common: '50-100 gp',
      uncommon: '101-500 gp',
      rare: '501-5,000 gp',
      'very rare': '5,001-50,000 gp',
      legendary: '50,001+ gp',
    };
    const valueByRarityHalved = {
      none: '0-24 gp',
      common: '25-50 gp',
      uncommon: '51-250 gp',
      rare: '251-2,500 gp',
      'very rare': '2,501-25,000 gp',
      legendary: '25,001+ gp',
    };
    const isConsumable = ['potion', 'scroll'].includes(item.type ?? 'unknown');
    if (isConsumable) {
      return valueByRarityHalved[item.rarity as keyof typeof valueByRarity];
    }
    return valueByRarity[item.rarity as keyof typeof valueByRarity];
  }

  if (item.value >= 100) {
    return `${Math.floor(item.value / 100)} gp`;
  }

  if (item.value >= 10) {
    return `${Math.floor(item.value / 10)} sp`;
  }

  return `${item.value} cp`;
}

function formatItemWeight(item: IItemEx) {
  if (item.weight === undefined) {
    return undefined;
  }
  const isPlural = item.weight !== 1;
  return `${item.weight} lb${isPlural ? 's' : ''}`;
}

function itemToMarkdown(item: IItemEx): string {
  return `---
alias: ${toTitleCase(item.name)}
tags: 5eTools, item
---

# ${toTitleCase(item.name)}

${buildMarkdownPropertyTable(
    ['Type', item.type],
    ['Weight', formatItemWeight(item)],
    ['Value', formatItemValue(item)],
  )}

${entriesToMarkdown(item.entries ?? [])}

---

**Source:** ${item.source}, page ${item.page}
`;
}

export async function generateItemsFiles() {
  const outputDir = path.join(config.outputRootDir ?? '/', config.outputDirs.items);
  // Make directory and path to it
  await fs.mkdir(outputDir, { recursive: true });
  const items = await listItems();
  const fileWritePs: Promise<any>[] = [];
  items.forEach((item) => {
    const filePath = path.join(outputDir, `${normalizeFilename(item.name)}.md`);
    const fileContents = itemToMarkdown(item);
    fileWritePs.push(fs.writeFile(filePath, fileContents));
  });
  await Promise.all(fileWritePs);
}
