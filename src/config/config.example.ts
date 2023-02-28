import path from 'path';
import os from 'os';
import type { IConfig } from './definitions';

const config: IConfig = {
  ownedSourceBooks: ['phb'],
  outputRootDir: path.join(os.homedir(), '/Documents/DND/Rules'),
  outputDirs: {
    spells: 'Spells',
    items: 'Items',
    magicItems: 'MagicItems',
    creatures: 'Bestiary',
    conditions: 'Mechanics/Conditions',
    actions: 'Mechanics/Actions',
    skills: 'Mechanics/Skills',
    races: 'Reference/Races',
    classes: 'Reference/Classes',
  },
};

export default config;
