import path from 'path';
import os from 'os';
import type { IConfig } from './definitions';

const dev = false;

const config: IConfig = {
	ownedSourceBooks: ['phb', 'mm', 'dmg', 'xge', 'egw', 'tce', 'mpmm', 'erlw'],
	outputRootDir: path.join(os.homedir(), '/Documents/DND/Source'),
	outputDirs: {
		spells: 'Spells',
		items: 'Items',
		magicVariants: 'MagicVariants',
		creatures: 'Bestiary',
		conditions: 'Mechanics/Conditions',
		diseases: 'Mechanics/Diseases',
		actions: 'Mechanics/Actions',
		skills: 'Mechanics/Skills',
		senses: 'Mechanics/Senses',
		races: 'Reference/Races',
		classes: 'Reference/Classes',
		datatables: '',
	},
};
if (dev) {
	config.outputRootDir = path.join(__dirname, '../../test');
}
export default config;
