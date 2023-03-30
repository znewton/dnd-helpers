#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { listBooks } from './data';
import {
  generateActionsFiles, generateConditionsFiles, generateCreaturesFiles, generateDataTableFiles, generateDiseasesFiles, generateRacesFiles, generateSensesFiles, generateSkillsFiles, generateSpellsFiles,
} from './generators';
import { itemMarkdownToCard } from './misc';
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
  datatables: generateDataTableFiles,
};

yargs(hideBin(process.argv))
  .command(
    'gen <type>',
    'Generate helper files for type',
    (y) => y.positional('type', {
      demandOption: true,
      choices: ['all', ...Object.keys(generators)],
    }),
    (argv) => {
      if (argv.type === 'all') {
        Object.entries(generators).forEach(([name, generator]) => {
          console.log(`Generating ${toTitleCase(name)}`);
          generator().catch((error) => {
            console.error(`Error generating ${name}`);
            console.error(error);
          });
        });
        return;
      }
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
  .command(
    'build-item-card <item-file-path>',
    'build an HTML item card from Markdown',
    (y) => y.positional('itemFilePath', {
      demandOption: true,
      type: 'string',
    }),
    (argv) => {
      itemMarkdownToCard(argv.itemFilePath).catch(console.error);
    },
  )
  .help()
  .parse();
