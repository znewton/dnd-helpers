import path from 'path';
import { promises as fs } from 'fs';
import config from '../config';
import {
  CreatureSize, IRace, listBooks, listRaces,
} from '../data';
import {
  buildMarkdownPropertyTable,
  entriesToMarkdown, normalizeFilename, toTitleCase,
} from '../utils';
import { formatCreatureSpeed } from '../utils/formatting';

function formatRaceAbilityScores(race: IRace): string {
  if (!race.ability) {
    return 'Choose one of: (a) Choose any +2; choose any other +1 (b) Choose three different +1';
  }

  return race.ability
    .map((abilityScores) => Object.entries(abilityScores)
      .map(([abilityName, abilityBonus]) => `${toTitleCase(abilityName)} +${abilityBonus}`))
    .join('; ');
}

function formatRaceLanguages(race: IRace): string {
  if (!race.languageProficiencies) {
    return 'Common, one other language that you and your DM agree is appropriate for your character';
  }

  return race.languageProficiencies
    .map((languageProf) => Object.entries(languageProf)
      .map(([language, known]) => {
        if (known === true) {
          return toTitleCase(language);
        }
        if (typeof known === 'number' && language === 'anyStandard') {
          return 'one other language that you and your DM agree is appropriate for your character';
        }
        throw new Error(`Unhandled language for race: ${race.name}`);
      }).join(', '))
    .join(' or ');
}

function formatRaceDescription(race: IRace): string {
  if (!race.fluff || !race.fluff.entries.length) {
    return entriesToMarkdown(race.entries);
  }

  return `${entriesToMarkdown(race.entries)}

## Additional Information

${entriesToMarkdown(race.fluff.entries)}`;
}

function raceToMarkdown(race: IRace): string {
  return `---
alias: ${toTitleCase(race.name)}
tags: 5eTools, race
---

# ${toTitleCase(race.name)}

${buildMarkdownPropertyTable(
    ['Size', race.size.map((size) => CreatureSize[size]).join(' or ')],
    ['Speed', formatCreatureSpeed(race.speed)],
    ['Ability', formatRaceAbilityScores(race)],
    ['Languages', formatRaceLanguages(race)],
  )}

${formatRaceDescription(race)}

---

**Source:** ${race.source}, page ${race.page}
`;
}

export async function generateRacesFiles() {
  const outputDir = path.join(config.outputRootDir ?? '/', config.outputDirs.races);
  // Make directory and path to it
  await fs.mkdir(outputDir, { recursive: true });
  const races = await listRaces();
  const fileWritePs: Promise<any>[] = [];
  /**
   * Source weights to indicate recency of release for determining legacy or not
   */
  const sourcePublishOrder: { [name: string]: number } = {};
  const books = await listBooks();
  books
    .sort((bookA, bookB) => new Date(bookA.published).getTime() - new Date(bookB.published).getTime())
    .forEach((book, i) => {
      sourcePublishOrder[book.id.toLowerCase()] = i;
    });
  const raceSources: { [name: string]: string[] } = {};
  races.forEach((race) => {
    if (!raceSources[race.name]) {
      raceSources[race.name] = [];
    }
    raceSources[race.name]!.push(race.source);
  });
  Object.entries(raceSources).forEach(([name, sources]) => {
    const srcs = [...sources].sort((sourceA, sourceB) => {
      const [orderA, orderB] = [sourcePublishOrder[sourceA.toLowerCase()], sourcePublishOrder[sourceB.toLowerCase()]];
      if (orderA === undefined || orderB === undefined) {
        throw new Error(`Missing race source publishing order: ${name}`);
      }
      // Sort race editions from latest to earliest
      return orderB - orderA;
    });
    raceSources[name] = srcs;
  });
  races.forEach((race) => {
    if (race.source.toLowerCase() !== (raceSources[race.name] ?? [])[0]?.toLowerCase()) {
      // Skip all but latest race editions.
      return;
    }
    console.log(race.name, race.source.toLowerCase());
    const filePath = path.join(outputDir, `${normalizeFilename(race.name)}.md`);
    const fileContents = raceToMarkdown(race);
    fileWritePs.push(fs.writeFile(filePath, fileContents));
  });
  await Promise.all(fileWritePs);
}
