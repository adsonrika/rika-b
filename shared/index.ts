export type ApiHealthResponse = {
  ok: true
  now: string
}

export function nowIsoString(date: Date): string {
  return date.toISOString()
}
