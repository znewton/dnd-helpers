// eslint-disable-next-line import/extensions
import conf from './config/config';

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
}
const config: IConfig = {
  ownedSourceBooks: conf.ownedSourceBooks.map((book) => book.toLowerCase()),
};

export default config;
