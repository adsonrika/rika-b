import http, { type IncomingMessage, type ServerResponse } from 'node:http'
import { pathToFileURL } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'
import { inspect } from 'node:util'

type Json = Record<string, unknown> | unknown[]

function guessContentType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase()
  switch (ext) {
    case '.html':
      return 'text/html; charset=utf-8'
    case '.js':
      return 'text/javascript; charset=utf-8'
    case '.css':
      return 'text/css; charset=utf-8'
    case '.json':
      return 'application/json; charset=utf-8'
    case '.svg':
      return 'image/svg+xml'
    case '.png':
      return 'image/png'
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg'
    case '.webp':
      return 'image/webp'
    case '.ico':
      return 'image/x-icon'
    case '.map':
      return 'application/json; charset=utf-8'
    case '.txt':
      return 'text/plain; charset=utf-8'
    default:
      return 'application/octet-stream'
  }
}

function resolveWebDistDir(cwd: string): string | null {
  const candidates = [
    path.join(cwd, 'apps', 'web', 'dist'),
    path.join(cwd, '..', 'web', 'dist'),
    path.join(cwd, '..', '..', 'apps', 'web', 'dist'),
  ]

  for (const distDir of candidates) {
    const indexPath = path.join(distDir, 'index.html')
    if (fs.existsSync(indexPath)) {
      return distDir
    }
  }

  return null
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = ''
    req.setEncoding('utf8')
    req.on('data', chunk => {
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

async function handleWeb(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const cwd = process.cwd()
  const distDir = resolveWebDistDir(cwd)

  if (!distDir) {
    res.statusCode = 500
    res.setHeader('content-type', 'application/json; charset=utf-8')
    res.end(
      JSON.stringify({
        ok: false,
        error: { code: 'WEB_DIST_NOT_FOUND', message: 'Web dist not found. Run web build first.' },
      }),
    )
    return
  }

  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`)
  const requestPath = decodeURIComponent(url.pathname)
  const normalized = requestPath.replace(/\\/g, '/')
  const relative = normalized.replace(/^\/+/, '')

  if (relative.includes('..')) {
    res.statusCode = 400
    res.end('Bad Request')
    return
  }

  const hasExt = path.extname(relative) !== ''
  const filePath = path.join(distDir, relative)

  const fallbackIndex = () => {
    const indexPath = path.join(distDir, 'index.html')
    const buf = fs.readFileSync(indexPath)
    res.statusCode = 200
    res.setHeader('content-type', 'text/html; charset=utf-8')
    res.end(buf)
  }

  if (relative === '' || relative.endsWith('/')) {
    fallbackIndex()
    return
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const buf = fs.readFileSync(filePath)
    res.statusCode = 200
    res.setHeader('content-type', guessContentType(filePath))
    res.end(buf)
    return
  }

  if (!hasExt) {
    fallbackIndex()
    return
  }

  res.statusCode = 404
  res.end('Not Found')
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

  const cwd = process.cwd()
  const localApiSrcDir = path.join(cwd, 'src')
  const monorepoApiSrcDir = path.join(cwd, 'apps', 'api', 'src')

  const apiSrcDir = fs.existsSync(localApiSrcDir) ? localApiSrcDir : monorepoApiSrcDir
  const handlerPath = path.join(apiSrcDir, `${name}.ts`)

  try {
    if (!fs.existsSync(handlerPath)) {
      res.statusCode = 404
      res.setHeader('content-type', 'application/json; charset=utf-8')
      res.end(
        JSON.stringify({
          ok: false,
          error: { code: 'NOT_FOUND', message: `Handler not found: ${handlerPath}` },
        }),
      )
      return
    }

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
      body: rawBody
        ? (() => {
            try {
              return JSON.parse(rawBody)
            } catch {
              return rawBody
            }
          })()
        : undefined,
    }

    const vercelRes = createVercelStyleResponse(res)

    await (handler as (r: unknown, s: unknown) => unknown)(vercelReq, vercelRes)
  } catch (e) {
    process.stdout.write(`api error ${inspect(e, { depth: null, colors: true })}\n`)
    res.statusCode = 500
    res.setHeader('content-type', 'application/json; charset=utf-8')
    res.end(JSON.stringify({ ok: false, error: { code: 'INTERNAL_ERROR', message: String(e) } }))
  }
}

const port = Number(process.env.API_PORT ?? '3000')

http
  .createServer((req, res) => {
    const url = req.url ?? '/'
    if (url.startsWith('/api/')) {
      void handleApi(req, res)
      return
    }
    void handleWeb(req, res)
  })
  .listen(port, () => {
    process.stdout.write(`[api-local] listening on http://localhost:${port}\n`)
  })
