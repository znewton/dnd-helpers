import path from 'path';
import { promises as fs } from 'fs';
import { Document as YamlDocument } from 'yaml';
import config from '../config';
import {
  IItem, ItemDamageTypeAbbrev, ItemPropertyAbbrev, ItemTypeAbbrev, listItems,
} from '../data';
import {
  buildMarkdownPropertyTable,
  entriesToMarkdown, normalizeFilename, toTitleCase,
} from '../utils';

function formatItemType(item: IItem) {
  if (!item.type) {
    return undefined;
  }

  const footnote = item.typeEntries.length > 0
    ? `[^t-${ItemTypeAbbrev[item.type]}]`
    : undefined;

  if (item.weapon) {
    return `${ItemTypeAbbrev[item.type]}${footnote ?? ''}, (_${item.weaponCategory}_)`;
  }

  return `${ItemTypeAbbrev[item.type]}${footnote ?? ''}`;
}

function formatItemValue(item: IItem) {
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

function formatItemWeight(item: IItem) {
  if (item.weight === undefined) {
    return undefined;
  }
  const isPlural = item.weight !== 1;
  return `${item.weight} lb${isPlural ? 's' : ''}`;
}

function formatItemDamage(item: IItem) {
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

function formatItemArmorClass(item: IItem) {
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

function formatItemProperties(item: IItem) {
  const props = [];
  if (item.range) {
    props.push(`Range (${item.range} ft.)`);
  }
  item.property?.forEach((property) => {
    const propertyDetails = item.propertyDetails[property];
    if (propertyDetails) {
      const footnote = propertyDetails.entries?.length ? `[^p-${property}]` : '';
      props.push(`${propertyDetails.fullName}${footnote}`);
      return;
    }

    props.push(`${ItemPropertyAbbrev[property]}`);
  });
  return props.join(', ');
}

function formatItemRequirements(item: IItem) {
  const reqs: string[] = [];

  if (item.reqAttune === true) {
    reqs.push('Attunement');
  } else if (typeof item.reqAttune === 'string') {
    reqs.push(`Attunment ${item.reqAttune}`);
  }

  if (item.strength) {
    reqs.push(`Strength ${item.strength}`);
  }

  if (reqs.length === 0) {
    return undefined;
  }
  return reqs.join(', ');
}

function formatItemDescription(item: IItem): string {
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

function formatItemFootnotes(item: IItem): string {
  const propertyDetails = Object.entries(item.propertyDetails);
  const typeDetails = item.typeEntries;
  const footnotes: string[] = [];
  if (typeDetails.length && item.type) {
    footnotes.push(`[^t-${item.type}]: ${entriesToMarkdown(typeDetails)}`);
  }
  propertyDetails.forEach(([propertyAbbrev, propertyDetail]) => {
    if (!propertyDetail.entries?.length) return;
    footnotes.push(`[^p-${propertyAbbrev}]: ${entriesToMarkdown(propertyDetail.entries)}`);
  });
  return footnotes.join('\n\n');
}

function itemToMarkdown(item: IItem): string {
  const name = toTitleCase(item.name);
  const type = formatItemType(item);
  const weight = formatItemWeight(item);
  const value = formatItemValue(item);
  const rarity = item.rarity === 'none' ? undefined : toTitleCase(item.rarity);
  const damage = formatItemDamage(item);
  const ac = formatItemArmorClass(item);
  const requirements = formatItemRequirements(item);
  const properties = formatItemProperties(item);
  const metadata = new YamlDocument({
    name,
    type,
    weight,
    value,
    rarity,
    damage,
    ac,
    requirements,
    properties,
  });
  return `---
alias: ${name}
tags: 5eTools, item
${metadata.toString()}
---

# ${name}

${buildMarkdownPropertyTable(
    ['Type', type],
    ['Weight', weight],
    ['Value', value],
    ['Rarity', rarity],
    ['Requirements', requirements],
    ['Damage', damage],
    ['AC', ac],
    ['Properties', properties],
  )}

${formatItemDescription(item)}

---

**Source:** ${item.source}, page ${item.page}

${formatItemFootnotes(item)}
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
