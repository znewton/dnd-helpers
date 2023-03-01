#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { listBooks } from './data';
import {
  generateActionsFiles, generateConditionsFiles, generateDiseasesFiles, generateSensesFiles, generateSkillsFiles,
} from './generators';
import { toTitleCase } from './utils';

yargs(hideBin(process.argv))
  .command(
    'gen <type>',
    'Generate helper files for type',
    (y) => y.positional('type', {
      demandOption: true,
      choices: [
        'items',
        'creatures',
        'spells',
        'actions',
        'conditions',
        'diseases',
        'races',
        'senses',
        'skills',
      ],
    }),
    (argv) => {
      let generator: () => Promise<void>;
      switch (argv.type) {
        case 'actions':
          generator = generateActionsFiles;
          break;
        case 'conditions':
          generator = generateConditionsFiles;
          break;
        case 'diseases':
          generator = generateDiseasesFiles;
          break;
        case 'skills':
          generator = generateSkillsFiles;
          break;
        case 'senses':
          generator = generateSensesFiles;
          break;
        default:
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
          process.stdout.write(books.map((book) => `${book.owned ? '✅' : '🚫'}  ... ${book.id} ... ${book.name}`).join('\n'));
        });
    },
  )
  .help()
  .parse();
