import type { PathLike } from 'fs';
import fs from 'fs/promises';
import { Converter } from 'showdown';
import { exists } from '../utils';

export async function itemMarkdownToCard(pathToItemMarkdown: PathLike): Promise<void> {
  if (!(await exists(pathToItemMarkdown, 'file'))) {
    throw new Error(`No such file exists for path: ${pathToItemMarkdown}`);
  }

  const markdownBuffer = await fs.readFile(pathToItemMarkdown);
  const converter = new Converter({
    tables: true,
    strikethrough: true,
    underline: true,
    metadata: true,
    completeHTMLDocument: true,
  });
  const html = converter.makeHtml(markdownBuffer.toString('utf-8'));
  const css = `<style>
table, tr, th, td {
  border-collapse: collapse;
  border: 1px solid black;
  padding: 3px;
}
</style>`;
  const output = html
    // remove Obsidian links
    .replace(/\[\[([a-zA-Z0-9'.,|/\\+\-" ]+)\]\]/g, '$1')
    // add CSS
    .replace('</body>', `${css}</body>`);
  process.stdout.write(output);
}
