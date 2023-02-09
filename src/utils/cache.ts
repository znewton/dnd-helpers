import path from 'path';
import fs from 'fs/promises';

async function exists(p: string, type: 'file' | 'dir' = 'file'): Promise<boolean> {
  try {
    const stat = await fs.stat(p);
    return type === 'file' ? stat.isFile() : stat.isDirectory();
  } catch (e) {
    if ((e as any)?.code === 'ENOENT') {
      return false;
    }
    throw e;
  }
}

export class JsonCache {
  constructor(private readonly cacheDir: string) {
  }

  public async get<T>(filename: string): Promise<T | undefined> {
    const fp = this.getFilePath(filename);
    if (!(await exists(fp))) {
      return undefined;
    }
    const file = await fs.readFile(fp);
    return JSON.parse(file.toString('utf-8'));
  }

  public async set<T>(filename: string, data: T): Promise<void> {
    const fp = this.getFilePath(filename);
    if (!(await exists(this.cacheDir, 'dir'))) {
      await fs.mkdir(this.cacheDir);
    }
    await fs.writeFile(fp, JSON.stringify(data), { encoding: 'utf-8' });
  }

  private getFilePath(filename: string): string {
    return path.resolve(this.cacheDir, filename);
  }
}
