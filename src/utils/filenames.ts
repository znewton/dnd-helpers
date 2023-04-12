export function normalizeFilename(filename: string): string {
	return filename
		.toLowerCase()
		.replaceAll('+', 'plus')
		.replace(/[ '*()/]/g, '');
}

export function obsidianLink(name: string, displayAs?: string): string {
	return `[[${normalizeFilename(name)}|${displayAs ?? name}]]`;
}
