import type { PathLike } from 'fs';
import fs from 'fs/promises';

export async function exists(
	p: PathLike,
	type: 'file' | 'dir' = 'file'
): Promise<boolean> {
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
