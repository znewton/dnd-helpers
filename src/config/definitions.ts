export interface IConfig {
	/**
	 * A list of source books owned, which will filter down
	 * the resources being retrieved and generated to avoid
	 * stealing.
	 *
	 * Run `yarn start list-books` to get a list of book aliases
	 * that you can use here.
	 */
	ownedSourceBooks: string[];
	/**
	 * The root directory for output. If undefined, specific output paths
	 * must be absolute.
	 */
	outputRootDir: string | undefined;
	/**
	 * Output directory paths. If relative, they will be resolved from `outputRootDir`.
	 */
	outputDirs: {
		spells: string;
		items: string;
		magicItems: string;
		creatures: string;
		conditions: string;
		diseases: string;
		actions: string;
		skills: string;
		senses: string;
		races: string;
		classes: string;
		datatables: string;
	};
}
