#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { listBooks } from './data';
import { generateActionsFiles } from './generators';

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
        'races',
        'senses',
        'skills',
      ],
    }),
    (argv) => {
      switch (argv.type) {
        case 'actions':
          console.log('Writing Actions');
          generateActionsFiles().catch(console.error);
          break;
        default:
          throw new Error('Not Implemented');
      }
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
