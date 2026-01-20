export type FilterByPrefix<
  T extends string,
  Prefix extends string = '',
> = T extends `${Prefix}.${string}` ? T : never

export type Join<Prefix extends string, Key extends string> = Prefix extends ''
  ? Key
  : `${Prefix}.${Key}`

export type KeyTree<T, Prefix extends string = ''> = {
  [K in keyof T]: T[K] extends Record<string, unknown>
    ? KeyTree<T[K], Join<Prefix, Extract<K, string>>>
    : Join<Prefix, Extract<K, string>>
}

export type LeafPaths<T, Prefix extends string = ''> = {
  [K in keyof T]: T[K] extends Record<string, unknown>
    ? LeafPaths<T[K], Join<Prefix, Extract<K, string>>>
    : Join<Prefix, Extract<K, string>>
}[keyof T]
