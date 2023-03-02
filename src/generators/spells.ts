import path from 'path';
import { promises as fs } from 'fs';
import config from '../config';
import { ISpell, listSpells, SpellSchool } from '../data';
import {
  buildMarkdownPropertyTable,
  combatTimeToString,
  entriesToMarkdown, normalizeFilename, toTitleCase,
} from '../utils';

function formatSpellLevel(level: ISpell['level']): string {
  switch (level) {
    case 0:
      return 'Cantrip';
    case 1:
      return '1st';
    case 2:
      return '2nd';
    case 3:
      return '3rd';
    default:
      return `${level}th`;
  }
}

function formatSpellComponents(components: ISpell['components']): string {
  // TODO: generate component info files from data/generated/bookref-quick.json
  const comonentStr = [];
  if (components.v) {
    comonentStr.push('[V](Components#Verbal%20(V))');
  }
  if (components.s) {
    comonentStr.push('[S](Components#Somatic%20(S))');
  }
  if (components.m) {
    const materials = typeof components.m === 'string' ? components.m : components.m.text;
    comonentStr.push(`[M](Components#Material%20(M)) _(${materials})_`);
  }
  return comonentStr.join(', ');
}

function formatSpellRange(range: ISpell['range']): string | undefined {
  if (!range) {
    return undefined;
  }

  if (range.type === 'point') {
    if (['self', 'touch', 'sight', 'unlimited'].includes(range.distance.type)) {
      return toTitleCase(range.distance.type);
    }
    if (!range.distance.amount) {
      throw new Error(`Invalid range distance: amount ${range.distance.amount} and type ${range.distance.type}`);
    }
    return `${range.distance.amount} ${range.distance.type}`;
  }

  if (range.type === 'special') {
    return 'Special';
  }

  const geometricReplacements: { [original: string]: string } = {
    feet: 'foot',
    miles: 'mile',
  };

  if (!geometricReplacements[range.distance.type]) {
    throw new Error(`Unhandled geometric type replace: ${range.distance.type}`);
  }

  const geometricRangeSuffixMap: { [type: string]: string } = {
    radius: ' radius',
    cube: ' cube',
    sphere: '-radius sphere',
    hemisphere: '-radius hemisphere',
    cone: ' cone',
    line: ' line',
  };

  if (!geometricRangeSuffixMap[range.type]) {
    throw new Error(`Unhandled range type: ${range.type}`);
  }

  return `Self (${range.distance.amount}-${geometricReplacements[range.distance.type]})${geometricRangeSuffixMap[range.type]}`;
}

function formatSpellDuration(spellDuration: ISpell['duration']): string {
  const durations: string[] = [];

  const permanentEndTypeMap: { [type: string]: string } = {
    dispel: 'dispelled',
    trigger: 'triggered',
  };

  spellDuration.forEach((duration) => {
    let text: string;
    switch (duration.type) {
      case 'instant':
        text = 'Instantaneous';
        break;
      case 'timed':
        if (duration.duration === undefined) {
          throw new Error('Invalid timed duration, missing duration');
        }
        text = combatTimeToString([
          { number: duration.duration.amount, unit: duration.duration.type },
        ]);
        break;
      case 'permanent':
        if (!duration.ends) {
          throw new Error('Permanent spell duration missing end times');
        }
        text = `Until ${duration.ends.map((end) => permanentEndTypeMap[end] ?? end).join(' or ')}`;
        break;
      case 'special':
        text = 'Special (see below)';
        break;
      default:
        throw new Error(`Unhandled duration type: ${duration.type}`);
    }

    if (duration.concentration) {
      durations.push(`Concentration, ${text}`);
    } else {
      durations.push(text);
    }
  });

  return durations.join(' or ');
}

function formatSpellDescription(spell: ISpell): string {
  const description: string[] = [
    entriesToMarkdown(spell.entries ?? []),
    entriesToMarkdown(spell.entriesHigherLevel ?? []),
  ];

  return description.filter((str) => !!str).join('\n\n');
}

function spellToMarkdown(spell: ISpell): string {
  return `---
alias: ${toTitleCase(spell.name)}
tags: 5eTools, spell
---

# ${toTitleCase(spell.name)}

${buildMarkdownPropertyTable(
    ['Casting Time', spell.time ? combatTimeToString(spell.time) : '-'],
    ['Duration', formatSpellDuration(spell.duration)],
    ['Range/Area', formatSpellRange(spell.range)],
    ['Components', formatSpellComponents(spell.components)],
    ['Level', formatSpellLevel(spell.level)],
    ['School', SpellSchool[spell.school]],
    // TODO: classes
  )}

${formatSpellDescription(spell)}

---

**Source:** ${spell.source}, page ${spell.page}
`;
}

export async function generateSpellsFiles() {
  const outputDir = path.join(config.outputRootDir ?? '/', config.outputDirs.spells);
  // Make directory and path to it
  await fs.mkdir(outputDir, { recursive: true });
  const spells = await listSpells();
  const fileWritePs: Promise<any>[] = [];
  spells.forEach((spell) => {
    const filePath = path.join(outputDir, `${normalizeFilename(spell.name)}.md`);
    const fileContents = spellToMarkdown(spell);
    fileWritePs.push(fs.writeFile(filePath, fileContents));
  });
  await Promise.all(fileWritePs);
}
