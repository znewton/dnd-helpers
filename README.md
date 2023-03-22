# D&D Helpers

Some useful scripts for generating helpful D&D content in [obsidian.md](https://obsidian.md) vaults using [5e.tools](https://5e.tools).

Specifically, these tools pull data from [5etools-mirror-1 Github Repo](https://github.com/5etools-mirror-1/5etools-mirror-1.github.io/tree/master/data), which is a fork of the source for [5e.tools](https://5e.tools) website with all of the raw data in JSON format, which is better for parsing than attempting to manually export the data from the website itself.

## Getting Started

### 1. Install Required Dependencies

1. This is a [Typescript](https://www.typescriptlang.org/) project that runs using [Node.js](https://nodejs.org/en) runtime. Install Node.js using [NVM (Node Version Manager)](https://github.com/nvm-sh/nvm#installing-and-updating) then running `nvm use` within the root directory for this project.
2. This project uses [Yarn](https://yarnpkg.com/) for dependency management. Install Yarn by following [Yarn's installation directions](https://yarnpkg.com/getting-started/install).
3. Install NPM dependencies using `yarn install`

### 2. Configure Source Material

_**IMPORTANT:**_ Please only use this tool with source material _**that you legally own!**_. [5e.tools](https://5e.tools) is an awesome tool that is freely available for use, so please do not abuse it by using it to pirate from Wizards of the Coast.

To configure which source books that you own,

1. Run `yarn start list-books` to view all available source books and their corresponding abbreviations.
2. Update the `ownedSourceBooks` property of the `config` variable exported from `src/config/config.ts` with the abbreviations of source books you own.

To configure where the output goes, configure the appropriate properties within the `config` variable in `src/config/config.ts`.

### 3. Generate ALL the Files

Run `yarn start gen all` to generate all the helper files.
