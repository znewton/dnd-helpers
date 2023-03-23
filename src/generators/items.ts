import path from 'path';
import { promises as fs } from 'fs';
import config from '../config';
import {
  IItemEx, ItemDamageTypeAbbrev, ItemPropertyAbbrev, ItemTypeAbbrev, listItems,
} from '../data';
import {
  buildMarkdownPropertyTable,
  entriesToMarkdown, normalizeFilename, toTitleCase,
} from '../utils';

function formatItemType(item: IItemEx) {
  if (!item.type) {
    return undefined;
  }

  if (item.weapon) {
    return `${ItemTypeAbbrev[item.type]}, (_${item.weaponCategory}_)`;
  }

  return ItemTypeAbbrev[item.type];
}

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

function formatItemDamage(item: IItemEx) {
  if (!(item.dmg1 || item.dmg2 || item.dmgType)) {
    return undefined;
  }

  const dmg: string[] = [];

  if (item.dmg1) {
    dmg.push(item.dmg1);
  }

  if (item.dmgType) {
    dmg.push(ItemDamageTypeAbbrev[item.dmgType]);
  }

  if (item.dmg2) {
    dmg.push(`(_Versatile: ${item.dmg2}_)`);
  }

  return dmg.join(' ');
}

function formatItemArmorClass(item: IItemEx) {
  if (!item.ac) {
    return undefined;
  }

  if (item.type === 'LA') {
    return `${item.ac} + DEX`;
  }

  if (item.type === 'MA') {
    return `${item.ac} + DEX (max 2)`;
  }

  return `${item.ac}`;
}

function formatItemProperties(item: IItemEx) {
  const props = [];
  if (item.range) {
    // TODO: Link or footnote? Do these exist in Quickref?
    props.push(`[[Range]] (${item.range} ft.)`);
  }
  item.property.forEach((property) => {
    if (property === 'V') {
      props.unshift(`[[Versatile]] (${item.dmg2})`);
      return;
    }
    props.push(`[[${ItemPropertyAbbrev[property]}]]`);
  });
  return props.join(', ');
}

function formatItemRequirements(item: IItemEx) {
  const reqs: string[] = [];

  if (item.reqAttune === true) {
    reqs.push('[[Attunement]]');
  } else if (typeof item.reqAttune === 'string') {
    reqs.push(`[[Attunment]] ${item.reqAttune}`);
  }

  if (item.strength) {
    reqs.push(`Strength ${item.strength}`);
  }

  if (reqs.length === 0) {
    return undefined;
  }
  return reqs.join(', ');
}

function formatItemDescription(item: IItemEx): string {
  const entries = [...(item.entries ?? [])];
  if (item.stealth) {
    entries.push({
      name: 'Stealth',
      type: 'entries',
      entries: [
        'The wearer has disadvantage on Dexterity (Stealth) checks',
      ],
    });
  }
  return entriesToMarkdown(entries);
}

function itemToMarkdown(item: IItemEx): string {
  return `---
alias: ${toTitleCase(item.name)}
tags: 5eTools, item
---

# ${toTitleCase(item.name)}

${buildMarkdownPropertyTable(
    ['Type', formatItemType(item)],
    ['Weight', formatItemWeight(item)],
    ['Value', formatItemValue(item)],
    ['Rarity', item.rarity === 'none' ? undefined : toTitleCase(item.rarity)],
    ['Requirements', formatItemRequirements(item)],
    ['Damage', formatItemDamage(item)],
    ['AC', formatItemArmorClass(item)],
    ['Properties', formatItemProperties(item)],
  )}

${formatItemDescription(item)}

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