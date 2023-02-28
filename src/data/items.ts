export interface IItem {
  name: string;
}

export async function listItems(): Promise<IItem[]> {
  throw new Error('Not Implemented');
}
