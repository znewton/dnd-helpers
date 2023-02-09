#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { listBooks } from './data';

yargs(hideBin(process.argv))
  .command(
    'gen <type>',
    'Generate helper files for type (items, spells, or creatures)',
    (y) => y.positional('type', {
      demandOption: true,
      choices: ['items', 'creatures', 'spells'],
    }),
    (argv) => {
      process.stdout.write(argv.type);
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
  .parse();
