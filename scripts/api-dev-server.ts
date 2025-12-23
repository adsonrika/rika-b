import http, { type IncomingMessage, type ServerResponse } from 'node:http'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'

type Json = Record<string, unknown> | unknown[]

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = ''
    req.setEncoding('utf8')
    req.on('data', (chunk) => {
      data += chunk
    })
    req.on('end', () => resolve(data))
    req.on('error', reject)
  })
}

function createVercelStyleResponse(res: ServerResponse) {
  return {
    status(code: number) {
      res.statusCode = code
      return this
    },
    setHeader(name: string, value: string) {
      res.setHeader(name, value)
      return this
    },
    send(body: string) {
      if (!res.getHeader('content-type')) {
        res.setHeader('content-type', 'text/plain; charset=utf-8')
      }
      res.end(body)
    },
    json(body: Json) {
      res.setHeader('content-type', 'application/json; charset=utf-8')
      res.end(JSON.stringify(body))
    },
  }
}

function toQuery(searchParams: URLSearchParams): Record<string, string | string[]> {
  const query: Record<string, string | string[]> = {}

  for (const [key, value] of searchParams.entries()) {
    const existing = query[key]
    if (existing === undefined) {
      query[key] = value
      continue
    }

    if (Array.isArray(existing)) {
      existing.push(value)
      continue
    }

    query[key] = [existing, value]
  }

  return query
}

async function handleApi(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const method = req.method ?? 'GET'
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`)

  const match = url.pathname.match(/^\/api\/(?<name>[a-zA-Z0-9_-]+)\/?$/)
  if (!match?.groups?.name) {
    res.statusCode = 404
    res.end('Not Found')
    return
  }

  const name = match.groups.name

  const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
  const handlerPath = path.join(projectRoot, 'api', `${name}.ts`)

  try {
    const mod = await import(`${pathToFileURL(handlerPath).href}?t=${Date.now()}`)
    const handler = mod.default as unknown

    if (typeof handler !== 'function') {
      res.statusCode = 500
      res.end('Invalid handler export')
      return
    }

    const rawBody = method === 'GET' || method === 'HEAD' ? '' : await readBody(req)

    const vercelReq = {
      method,
      headers: req.headers,
      url: url.pathname + url.search,
      query: toQuery(url.searchParams),
      body: rawBody ? (() => {
        try {
          return JSON.parse(rawBody)
        } catch {
          return rawBody
        }
      })() : undefined,
    }

    const vercelRes = createVercelStyleResponse(res)

    await (handler as (r: unknown, s: unknown) => unknown)(vercelReq, vercelRes)
  } catch (e) {
    res.statusCode = 500
    res.setHeader('content-type', 'application/json; charset=utf-8')
    res.end(JSON.stringify({ ok: false, error: { code: 'INTERNAL_ERROR', message: String(e) } }))
  }
}

const port = Number(process.env.API_PORT ?? '3000')

http
  .createServer((req, res) => {
    void handleApi(req, res)
  })
  .listen(port, () => {
    process.stdout.write(`[api-local] listening on http://localhost:${port}\n`)
  })
