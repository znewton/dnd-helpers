export function normalizeFilename(filename: string): string {
  return filename
    .toLowerCase()
    .replace(/[ *()/]/g, '');
}

export function obsidianLink(name: string, displayAs?: string): string {
  return `[[${normalizeFilename(name)}|${displayAs ?? name}]]`;
}
