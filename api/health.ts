import type { VercelRequest, VercelResponse } from '@vercel/node'
import { nowIsoString, type ApiHealthResponse } from 'shared'

export default function handler(_req: VercelRequest, res: VercelResponse): void {
  const body: ApiHealthResponse = {
    ok: true,
    now: nowIsoString(new Date()),
  }
  console.log("bbbb")
  res.status(200).json(body)
}
