import path from 'path';
import fs from 'fs/promises';
import { exists } from './fs';

export class JsonCache {
	constructor(private readonly cacheDir: string) {}

	public async get<T>(filename: string): Promise<T | undefined> {
		const fp = this.getFilePath(filename);
		if (!(await exists(fp))) {
			return undefined;
		}
		const file = await fs.readFile(fp);
		const fileStr = file.toString('utf-8');
		if (!fileStr) {
			return undefined;
		}
		try {
			return JSON.parse(fileStr);
		} catch (e) {
			console.error(`Error parsing ${filename}`, e);
			console.log(fileStr);
			throw new Error(`Failed to parse JSON in ${filename}`);
		}
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
