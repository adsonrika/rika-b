

export type FilterByPrefix<T extends string, Prefix extends string = ''> = T extends `${Prefix}.${string}` ? T : never


export type FetchLike = (input: string, init?: FetchRequestInit) => Promise<FetchResponse>

export interface FetchRequestInit {
    method?: string
    headers?: Record<string, string>
    body?: string
}

export interface FetchResponse {
    ok: boolean
    status: number

    json(): Promise<unknown>

    text(): Promise<string>
}

export const globalFetch: FetchLike = async (input, init) => {
  if (typeof fetch !== 'function') {
    throw new Error('Fetch API is not available in this runtime');
  }
  const response = await fetch(input, init);
  return {
    ok: response.ok,
    status: response.status,
    json: () => response.json(),
    text: () => response.text(),
  };
};