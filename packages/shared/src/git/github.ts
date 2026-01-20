import type {
  DeleteFileOptions,
  GitClient,
  GitClientOptions,
  GitTreeResponse,
  UploadFileOptions,
  UploadImageOptions,
  UploadResult,
} from './type.js'
import { globalFetch, encodeToBase64 } from '../utils/index.js'

export function createGitHubRestClient(options: GitClientOptions): GitClient {
  const { owner, repo } = options
  const token = options.token
  const defaultBranch = options.branch ?? 'main'
  const apiBase = options.apiBase ?? 'https://api.github.com'
  const fetchImpl = options.fetchImpl ?? globalFetch
  const committer = options.committer ?? undefined

  async function uploadFile(fileOptions: UploadFileOptions): Promise<UploadResult> {
    const path = resolveRepoPath(fileOptions)
    const branch = fileOptions.branch ?? defaultBranch
    const sha = await getExistingFileSha(path, branch)
    const message = fileOptions.message ?? `${sha ? 'Update' : 'Add'} ${path}`
    const encodedContent = encodeToBase64(fileOptions.content, fileOptions.encoding)

    const response = await putContent(path, {
      branch,
      message,
      content: encodedContent,
      sha,
      committer: fileOptions.committer ?? committer,
    })

    return {
      path: response.content.path,
      sha: response.content.sha,
      downloadUrl: response.content.download_url,
    }
  }

  async function uploadImage(imageOptions: UploadImageOptions): Promise<UploadResult> {
    const content =
      typeof imageOptions.content === 'string'
        ? Buffer.from(imageOptions.content, 'binary')
        : Buffer.from(imageOptions.content)

    const messageSuffix = imageOptions.mimeType ? ` (${imageOptions.mimeType})` : ''
    return uploadFile({
      ...imageOptions,
      encoding: 'base64',
      content,
      message: imageOptions.message ?? `Upload image${messageSuffix}`,
      committer,
    })
  }

  async function getTree(ref = defaultBranch, recursive = true): Promise<GitTreeResponse> {
    const encodedRef = encodeURIComponent(ref)
    const endpoint = `${apiBase}/repos/${owner}/${repo}/git/trees/${encodedRef}${recursive ? '?recursive=1' : ''}`

    const response = await fetchImpl(endpoint, {
      method: 'GET',
      headers: buildHeaders(),
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`Failed to fetch git tree: ${text}`)
    }

    return (await response.json()) as GitTreeResponse
  }

  async function getExistingFileSha(path: string, branch: string): Promise<string | undefined> {
    const url = buildContentsUrl(path, branch)
    const response = await fetchImpl(url, {
      method: 'GET',
      headers: buildHeaders(),
    })

    if (response.status === 404) {
      return undefined
    }

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`Failed to query content metadata: ${text}`)
    }

    const payload = (await response.json()) as { sha?: string }
    return payload.sha
  }

  async function deleteFile(deleteFileOptions: DeleteFileOptions): Promise<void> {
    const repoPath = normalizeRepoPath(deleteFileOptions.path)
    const branch = deleteFileOptions.branch ?? defaultBranch
    const sha = await getExistingFileSha(repoPath, branch)
    if (!sha) {
      throw new Error(`Cannot delete ${repoPath}: file not found on branch ${branch}`)
    }

    const response = await fetchImpl(buildContentsUrl(repoPath), {
      method: 'DELETE',
      headers: buildHeaders(),
      body: JSON.stringify({
        message: `Delete ${repoPath}`,
        sha,
        branch,
        committer: deleteFileOptions.committer ?? committer,
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`Failed to delete content: ${text}`)
    }
  }

  async function putContent(path: string, body: PutContentBody): Promise<GitHubContentResponse> {
    const url = buildContentsUrl(path)
    const response = await fetchImpl(url, {
      method: 'PUT',
      headers: buildHeaders(),
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`Failed to upload content: ${text}`)
    }

    return (await response.json()) as GitHubContentResponse
  }

  function buildContentsUrl(path: string, branch?: string): string {
    const encodedPath = path
      .split('/')
      .map(segment => encodeURIComponent(segment))
      .join('/')
    const base = `${apiBase}/repos/${owner}/${repo}/contents/${encodedPath}`
    return branch ? `${base}?ref=${encodeURIComponent(branch)}` : base
  }

  function buildHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    }
  }

  return {
    type: 'github',
    deleteFile,
    getExistingFileSha,
    uploadFile,
    uploadImage,
    getTree,
  }
}

interface PutContentBody {
  message: string
  content: string
  branch: string
  sha?: string
  committer?: {
    name: string
    email: string
  }
}

interface GitHubContentResponse {
  content: {
    path: string
    sha: string
    download_url?: string
  }
}

function resolveRepoPath(options: UploadFileOptions): string {
  if (options.repoPath) {
    return normalizeRepoPath(options.repoPath)
  }
  if (!options.fileName) {
    throw new Error('fileName or repoPath must be specified')
  }
  const parts = []
  if (options.folder) {
    parts.push(normalizeRepoPath(options.folder))
  }
  parts.push(options.fileName)
  return normalizeRepoPath(parts.join('/'))
}

function normalizeRepoPath(pathValue: string): string {
  return pathValue
    .split('/')
    .map(segment => segment.trim())
    .filter(Boolean)
    .join('/')
}
