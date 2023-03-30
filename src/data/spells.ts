import { getOwnedSourceBooks } from '../utils';
import {
  CombatTime,
  Entry, FiveEToolsBasePath, getJsonData, IImage,
} from './common';
import { mapSpellClasses } from './helpers';

export enum SpellSchool {
  A = 'Abjuration',
  C = 'Conjuration',
  D = 'Divination',
  E = 'Enchantment',
  V = 'Evocation',
  I = 'Illusion',
  N = 'Necromancy',
  P = 'Psionic',
  T = 'Transmutation',
}
export enum SpellComponent {
  v = 'Verbal',
  s = 'Somatic',
  m = 'Material',
}
export interface ISpellRange {
  type: string;
  distance: {
    type: string;
    amount?: number | undefined;
  }
}
export interface ISpellComponents {
  v?: boolean | undefined;
  s?: boolean | undefined;
  m?: string | { text: string; cost: number; consume?: boolean | undefined; } | undefined;
}
export interface ISpellDuration {
  type: string;
  duration?: {
    type: string;
    amount: number;
  } | undefined;
  ends?: string[];
  concentration?: boolean | undefined;
}
export interface ISpellFluff {
  name: string;
  source: string;
  images?: IImage[] | undefined;
}
export interface ISpell {
  name: string;
  source: string;
  page: number;
  level: number;
  school: keyof typeof SpellSchool;
  time: CombatTime[];
  range?: ISpellRange | undefined;
  components: ISpellComponents;
  duration: ISpellDuration[];
  entries: Entry[];
  entriesHigherLevel?: Entry[] | undefined;
  meta?: { ritual: boolean; } | undefined;
  fluff?: ISpellFluff | undefined;
  classes?: string[];
}
type SpellJson = { spell: Omit<ISpell, 'fluff'>[] };
type SpellFluffJson = { spellFluff: ISpellFluff[] };
const spellsBaseUrl = `${FiveEToolsBasePath}/data/spells`;
export async function listSpells(
  options: { includeFluff: boolean } = { includeFluff: true },
): Promise<ISpell[]> {
  const ownedSourceBooks = getOwnedSourceBooks();
  const spellFiles = ownedSourceBooks.map((alias) => `spells-${alias}.json`);
  const spellReadPs: Promise<SpellJson>[] = [];
  [...spellFiles].forEach((filename) => {
    spellReadPs.push(getJsonData<SpellJson>(
      filename,
      spellsBaseUrl,
      { spell: [] },
    ));
  });
  const spellFluffReadPs: Promise<SpellFluffJson>[] = [];
  if (options.includeFluff) {
    const spellFluffFiles = ownedSourceBooks.map((alias) => `fluff-spells-${alias}.json`);
    [...spellFluffFiles].forEach((filename) => {
      spellFluffReadPs.push(getJsonData<SpellFluffJson>(
        filename,
        spellsBaseUrl,
        { spellFluff: [] },
      ));
    });
  }
  const spellJsons = await Promise.all(spellReadPs);
  const spellFluffJsons = await Promise.all(spellFluffReadPs);
  const fluffSpells: { [name: string]: ISpellFluff | undefined } = {};
  spellFluffJsons.forEach(({ spellFluff }) => {
    spellFluff.forEach((fluff) => {
      fluffSpells[fluff.name] = fluff;
    });
  });
  const spellClassMap = await mapSpellClasses();
  const spells: ISpell[] = [];
  spellJsons.forEach(({ spell }) => {
    spell.forEach((spellDetails) => {
      spells.push({
        ...spellDetails,
        fluff: fluffSpells[spellDetails.name],
        classes: Array.from(spellClassMap[spellDetails.name.toLowerCase()] ?? []),
      });
    });
  });
  return spells;
}
