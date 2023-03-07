type OtherSources = { source: string, page: number }[];

export function isOwned(
  ownedSourceBooks: string[],
  object: { source: string; otherSources?: OtherSources },
) {
  if (ownedSourceBooks.includes(object.source.toLowerCase())) {
    return true;
  }
  if (object.otherSources) {
    // eslint-disable-next-line no-restricted-syntax
    for (const otherSource of object.otherSources) {
      if (ownedSourceBooks.includes(otherSource.source.toLowerCase())) {
        return true;
      }
    }
  }
  return false;
}
