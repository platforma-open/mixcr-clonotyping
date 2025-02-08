type Entries<T> = {
  [K in keyof T]: [K, Required<T[K]>];
}[keyof T][];

export function typeSafeEntries<T extends Record<string, T> | ArrayLike<T>>(obj: T): Entries<T> {
  return Object.entries(obj) as Entries<T>;
}
