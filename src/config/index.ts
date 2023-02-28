import conf from './config';
import type { IConfig } from './definitions';

export { IConfig };

const config: IConfig = {
  ownedSourceBooks: conf.ownedSourceBooks.map((book) => book.toLowerCase()),
  outputRootDir: conf.outputRootDir,
  outputDirs: conf.outputDirs,
};

export default config;
