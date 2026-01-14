import type { VercelRequest, VercelResponse } from '@vercel/node'
import { nowIsoString, type ApiHealthResponse } from '@rika/shared/api'
import os from 'node:os'
import { logger } from '@rika/shared/logger'

const log = logger(__SOURCE_FILE__)

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  log.info('Health check requested')

  const body: ApiHealthResponse = {
    ok: true,
    now: nowIsoString(new Date()),
  }
  log.info(os.version())
  log.info('Health check response sent', { ok: body.ok })
  res.status(200).json(body)
}
