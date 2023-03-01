import type { Entry, IEntry, TableEntryCell } from '../data/common';
import { obsidianLink } from './filenames';

export function toTitleCase(str: string): string {
  return str.split(' ').map((chunk) => `${chunk[0]?.toUpperCase()}${chunk.substring(1).toLowerCase()}`).join(' ');
}

/**
 * Replace 5eTools links with Obsidian links or special text.
 */
export function reformat5eToolsLinks(text: string) {
  if (typeof text !== 'string') {
    throw new Error('Invalid 5eTools text: not a string');
  }
  return text
    .replace(/\{@condition ([a-zA-Z0-9 ]+)\}/g, (_match, p1) => obsidianLink(p1, toTitleCase(p1)))
    .replace(/\{@dice ([0-9a-zA-Z+ ]+)\}/g, '`dice: $1` ($1)')
    .replace(/\{@damage ([0-9a-zA-Z+ ]+)\}/g, '`dice: $1` ($1)')
    .replace(/\{@spell ([0-9a-zA-Z ]+)\}/g, (_match, p1) => obsidianLink(p1, p1.toLowerCase()))
    .replace(/\{@item ([0-9a-zA-Z ]+)(\|?\|([a-zA-Z0-9 ']+))?\}/g, (_match, p1, _p2, p3) => obsidianLink(p1, toTitleCase(p3 ?? p1)))
    .replace(/\{@creature ([0-9a-zA-Z ]+)(\|?\|([a-zA-Z0-9 ']+))?\}/g, (_match, p1, _p2, p3) => obsidianLink(p1, toTitleCase(p3 ?? p1)))
    .replace(/\{@b ([A-Za-z0-9 ]+)\}/g, '**$1**')
    .replace(/\{@i ([A-Za-z0-9 ]+)\}/g, '_$1_')
    .replace(/\{@action ([A-Za-z0-9 ]+)\}/g, (_match, p1) => obsidianLink(p1))
    .replace(/([A-Z][a-z]+) \(\{@skill ([0-9a-zA-Z ]+)\}\)/g, (_match, p1, p2) => obsidianLink(p2, `${toTitleCase(p1)} (${toTitleCase(p2)})`))
    // TODO: Still link to Abilities descriptions?
    .replace(/DC ([0-9]+) ([A-Z][a-z]+) saving/g, 'DC $1 $2 saving');
}

function entryToMarkdown(entry: Entry): string | undefined {
  if (typeof entry === 'string') {
    return reformat5eToolsLinks(entry);
  }

  /**
   * Wrapper
   * (note): This is not really used.
   */
  if (entry.type === 'wrapper') {
    if (['property', 'note', 'magicvariant'].includes(entry.data.item__mergedEntryTag)) {
      // All properties are linked
      // "note" entries are 5e.tools specific
      // magicvariant links to a bunch of other items that can be made into a variant
      return undefined;
    }
    if (entry.data.item__mergedEntryTag === 'type' && typeof entry.wrapped === 'object' && (entry.wrapped as IEntry).name === 'Range') {
      // Range is formatted as a linked property
      return undefined;
    }
    // TODO: Vehicles have extra description... maybe figure out linking types
    return undefined;
  }

  /**
   * Sub Entries
   */
  if (entry.type === 'entries' || entry.type === 'inset') {
    const markdownEntries: string[] = [];
    if (entry.name) {
      markdownEntries.push(`**_${entry.name}._**`);
    }

    entry.entries.forEach((subEntry) => {
      const markdownSubEntry = entryToMarkdown(subEntry);
      if (markdownSubEntry && markdownSubEntry.length) {
        markdownEntries.push(markdownSubEntry);
      }
    });

    if (entry.type === 'inset') {
      return ['>', markdownEntries].join(' ').replaceAll('\n', '\n> ');
    }

    return markdownEntries.join(' ');
  }

  /**
   * Table
   */
  if (entry.type === 'table') {
    const markdownEntries: string[] = [];

    markdownEntries.push(`\n## ${entry.caption}\n`);
    markdownEntries.push(`| ${entry.colLabels.join(' | ')} |`);
    markdownEntries.push(`| ${entry.colLabels.map(() => '---').join(' | ')} |`);
    entry.rows.forEach((row) => {
      const getTableCellText = (cell: TableEntryCell): string => {
        if (typeof cell === 'string') {
          return reformat5eToolsLinks(cell);
        }

        if (cell.roll) {
          const roll = cell.roll.exact !== undefined
            ? cell.roll.exact
            : `${cell.roll.min}-${cell.roll.max}`;

          if (cell.entry) {
            return `${roll} (${entryToMarkdown(cell.entry)})`;
          }

          return `${roll}`;
        }

        throw new Error(`Invalid table cell encountered: ${JSON.stringify(cell)}`);
      };
      markdownEntries.push(`| ${row.map(getTableCellText).join(' | ')} |`);
    });

    return markdownEntries.join('\n');
  }

  if (entry.type === 'list') {
    const markdownEntries: string[] = [];

    markdownEntries.push('\n');
    entry.items.forEach((item) => {
      markdownEntries.push(`- ${reformat5eToolsLinks(item)}`);
    });
    markdownEntries.push('\n');
    return markdownEntries.join('\n');
  }

  throw new Error(`Invalid entry type encountered: ${entry.type}`);
}
export function entriesToMarkdown(entries: Entry[]): string {
  const markdownEntries: string[] = [];

  entries.forEach((entry) => {
    const markdownEntry = entryToMarkdown(entry);
    if (markdownEntry && markdownEntry.length) {
      markdownEntries.push(markdownEntry);
    }
  });

  return markdownEntries.join('\n\n');
}
