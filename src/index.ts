#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { listBooks } from './data';
import {
  generateActionsFiles, generateConditionsFiles, generateCreaturesFiles, generateDiseasesFiles, generateRacesFiles, generateSensesFiles, generateSkillsFiles, generateSpellsFiles,
} from './generators';
import { toTitleCase } from './utils';

const generators: Record<string, () => Promise<void>> = {
  items: async () => Promise.reject(new Error('Not implemented')),
  creatures: generateCreaturesFiles,
  spells: generateSpellsFiles,
  actions: generateActionsFiles,
  conditions: generateConditionsFiles,
  diseases: generateDiseasesFiles,
  races: generateRacesFiles,
  senses: generateSensesFiles,
  skills: generateSkillsFiles,
};

yargs(hideBin(process.argv))
  .command(
    'gen <type>',
    'Generate helper files for type',
    (y) => y.positional('type', {
      demandOption: true,
      choices: Object.keys(generators),
    }),
    (argv) => {
      const generator = generators[argv.type];
      if (!generator) {
        throw new Error('Not Implemented');
      }

      console.log(`Generating ${toTitleCase(argv.type)}`);
      generator().catch(console.error);
    },
  )
  .command(
    'list-books',
    'list accepted book aliases for configuration',
    () => {},
    () => {
      listBooks()
        .then((books) => {
          const th = 'Owned? ... Alias ... Name';
          process.stdout.write(`${th}\n`);
          process.stdout.write(`${'-'.repeat(th.length)}\n`);
          process.stdout.write(books.sort((bookA, bookB) => new Date(bookA.published).getTime() - new Date(bookB.published).getTime()).map((book) => `${book.owned ? '✅' : '🚫'}  ... ${book.id} ... ${book.name}`).join('\n'));
        });
    },
  )
  .help()
  .parse();
