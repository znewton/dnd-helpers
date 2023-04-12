import { FiveEToolsBasePath, getJsonData } from '../common';

type SpellSourceLookupJson = {
	[sourceAbbrev: string]: {
		[spellName: string]: {
			class?:
				| {
						[sourceAbbrev: string]: {
							[className: string]: true;
						};
				  }
				| undefined;
			subclass?:
				| {
						[sourceAbbrev: string]: {
							[className: string]: {
								[sourceAbbrev: string]: {
									[subClassName: string]: {
										name: string;
									};
								};
							};
						};
				  }
				| undefined;
			feat?:
				| {
						[sourceAbbrev: string]: {
							[featName: string]: true;
						};
				  }
				| undefined;
		};
	};
};

const spellSourceLookupFilename = 'gendata-spell-source-lookup.json';
const spellSourceLookupBaseUrl = `${FiveEToolsBasePath}/data/generated`;

export async function mapSpellClasses(): Promise<Record<string, Set<string>>> {
	const spellSourceLookupJson = await getJsonData<SpellSourceLookupJson>(
		spellSourceLookupFilename,
		spellSourceLookupBaseUrl,
		{}
	);
	const spellMap: Record<string, Set<string>> = {};
	Object.entries(spellSourceLookupJson).forEach(([, sourceSpellData]) => {
		Object.entries(sourceSpellData).forEach(([spellName, spellData]) => {
			if (spellData.class) {
				const spellClassList = spellMap[spellName] ?? new Set<string>();
				Object.entries(spellData.class).forEach(
					([, sourceClassList]) => {
						Object.entries(sourceClassList).forEach(
							([className]) => {
								spellClassList.add(className);
							}
						);
					}
				);
				spellMap[spellName] = spellClassList;
			}
		});
	});
	return spellMap;
}
