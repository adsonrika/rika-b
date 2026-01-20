import { describe, it, expect, vi } from 'vitest'
import { gitClient } from '@rika/shared/git'
import type { GitClient, UploadFileOptions } from '@rika/shared/git'
import { FetchResponse } from '@rika/shared/utils'

type MockFetchOptions = {
  responses?: Record<string, { status: number; body: unknown }>
}

type ClientTestOptions = {
  url?: string
  token?: string
  mockFetchOptions?: MockFetchOptions
}

function createMockFetch(options: MockFetchOptions = {}) {
  const { responses = {} } = options

  return vi.fn(async (url: string) => {
    const response = responses[url]
    if (!response) {
      return {
        ok: false,
        status: 404,
        text: async () => 'Not Found',
        json: async () => ({ message: 'Not Found' }),
      } as FetchResponse
    }

    return {
      ok: response.status >= 200 && response.status < 300,
      status: response.status,
      text: async () => JSON.stringify(response.body),
      json: async () => response.body,
    } as FetchResponse
  })
}

function makeGitHubContentResponse(
  overrides: Partial<{
    path: string
    sha: string
    download_url: string
  }> = {},
) {
  return {
    path: 'test.md',
    sha: 'abc123',
    download_url: 'https://raw.githubusercontent.com/owner/repo/main/test.md',
    ...overrides,
  }
}

function makeGitTreeResponse(
  overrides: Partial<{
    sha: string
    tree: Array<{
      path: string
      mode: string
      type: string
      sha: string
      size?: number
      url: string
    }>
    truncated: boolean
  }> = {},
) {
  return {
    sha: 'tree123',
    tree: [
      { path: 'README.md', mode: '100644', type: 'blob', sha: 'sha1', size: 100, url: 'url1' },
      { path: 'src/index.ts', mode: '100644', type: 'blob', sha: 'sha2', size: 200, url: 'url2' },
    ],
    truncated: false,
    ...overrides,
  }
}

async function run_git_client_test(options: ClientTestOptions = {}): Promise<GitClient> {
  const { url = 'https://github.com/owner/repo', token = 'test-token', mockFetchOptions } = options
  const mockFetch = createMockFetch(mockFetchOptions)
  return gitClient(url, token, { fetchImpl: mockFetch })
}

async function run_get_tree_test(options: {
  ref?: string
  recursive?: boolean
  mockResponses: Record<string, { status: number; body: unknown }>
}) {
  const { mockResponses, ref = 'main', recursive = true } = options
  const client = await run_git_client_test({ mockFetchOptions: { responses: mockResponses } })
  return client.getTree(ref, recursive)
}

async function run_get_existing_sha_test(options: {
  path: string
  branch: string
  mockResponses: Record<string, { status: number; body: unknown }>
}) {
  const { path, branch, mockResponses } = options
  const client = await run_git_client_test({ mockFetchOptions: { responses: mockResponses } })
  return client.getExistingFileSha(path, branch)
}

async function run_delete_file_test(options: {
  path: string
  branch: string
  mockResponses: Record<string, { status: number; body: unknown }>
}) {
  const { path, branch, mockResponses } = options
  const client = await run_git_client_test({ mockFetchOptions: { responses: mockResponses } })
  return client.deleteFile({ path, branch })
}

describe('gitClient URL解析', () => {
  it('解析 GitHub HTTPS URL', async () => {
    const client = await run_git_client_test({
      url: 'https://github.com/owner/repo',
    })
    expect(client.type).toBe('github')
  })

  it('解析 GitHub SSH URL', async () => {
    const client = await run_git_client_test({
      url: 'git@github.com:owner/repo.git',
    })
    expect(client.type).toBe('github')
  })

  it('解析带 .git 后缀的 HTTPS URL', async () => {
    const client = await run_git_client_test({
      url: 'https://github.com/owner/repo.git',
    })
    expect(client.type).toBe('github')
  })

  it('无效 URL 抛出错误', () => {
    expect(() => gitClient('invalid-url', 'token')).toThrow('Invalid repository URL')
  })

  it('不支持的 Git 类型抛出错误', () => {
    expect(() => gitClient('https://gitlab.com/owner/repo', 'token')).toThrow(
      'Unsupported repository type',
    )
  })
})

describe('gitClient getTree', () => {
  it('成功获取 Git 树', async () => {
    const treeResponse = makeGitTreeResponse()

    const result = await run_get_tree_test({
      mockResponses: {
        'https://api.github.com/repos/owner/repo/git/trees/main?recursive=1': {
          status: 200,
          body: treeResponse,
        },
      },
    })

    expect(result.sha).toBe('tree123')
    expect(result.tree).toHaveLength(2)
    expect(result.tree[0]?.path).toBe('README.md')
    expect(result.truncated).toBe(false)
  })

  it('获取非递归树结构', async () => {
    const treeResponse = makeGitTreeResponse()

    await run_get_tree_test({
      ref: 'develop',
      recursive: false,
      mockResponses: {
        'https://api.github.com/repos/owner/repo/git/trees/develop': {
          status: 200,
          body: treeResponse,
        },
      },
    })
  })

  it('API 错误时抛出异常', async () => {
    await expect(
      run_get_tree_test({
        mockResponses: {
          'https://api.github.com/repos/owner/repo/git/trees/main?recursive=1': {
            status: 401,
            body: { message: 'Bad credentials' },
          },
        },
      }),
    ).rejects.toThrow('Failed to fetch git tree')
  })
})

describe('gitClient getExistingFileSha', () => {
  it('文件存在时返回 SHA', async () => {
    const sha = await run_get_existing_sha_test({
      path: 'path/to/file.md',
      branch: 'main',
      mockResponses: {
        'https://api.github.com/repos/owner/repo/contents/path/to/file.md?ref=main': {
          status: 200,
          body: { sha: 'file-sha-123' },
        },
      },
    })

    expect(sha).toBe('file-sha-123')
  })

  it('文件不存在时返回 undefined', async () => {
    const sha = await run_get_existing_sha_test({
      path: 'path/to/file.md',
      branch: 'main',
      mockResponses: {
        'https://api.github.com/repos/owner/repo/contents/path/to/file.md?ref=main': {
          status: 404,
          body: { message: 'Not Found' },
        },
      },
    })

    expect(sha).toBeUndefined()
  })

  it('API 错误时抛出异常', async () => {
    await expect(
      run_get_existing_sha_test({
        path: 'path/to/file.md',
        branch: 'main',
        mockResponses: {
          'https://api.github.com/repos/owner/repo/contents/path/to/file.md?ref=main': {
            status: 403,
            body: { message: 'Forbidden' },
          },
        },
      }),
    ).rejects.toThrow('Failed to query content metadata')
  })
})

describe('gitClient uploadFile', () => {
  it('成功上传新文件', async () => {
    const mockFetch = vi.fn()

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      text: async () => '{"message": "Not Found"}',
      json: async () => ({ message: 'Not Found' }),
    })

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => '{}',
      json: async () => ({
        content: makeGitHubContentResponse({
          path: 'new-file.md',
          sha: 'new-sha-456',
        }),
      }),
    })

    const client = await run_git_client_test({
      mockFetchOptions: {},
    })
    ;(client as any).fetchImpl = mockFetch

    const result = await client.uploadFile({
      content: 'Hello, World!',
      fileName: 'new-file.md',
      message: 'Add new file',
    })

    expect(result.path).toBe('new-file.md')
    expect(result.sha).toBe('new-sha-456')
  })

  it('使用 folder 和 fileName 构建路径', async () => {
    const mockFetch = vi.fn()

    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => '{}',
      json: async () => ({
        content: makeGitHubContentResponse({
          path: 'docs/test.md',
          sha: 'sha-docs',
        }),
      }),
    })

    const client = await run_git_client_test({})
    ;(client as any).fetchImpl = mockFetch

    await client.uploadFile({
      content: 'content',
      folder: 'docs',
      fileName: 'test.md',
    })

    expect(mockFetch).toHaveBeenCalled()
  })

  it('未提供 fileName 或 repoPath 时抛出异常', async () => {
    const client = await run_git_client_test({})

    await expect(
      client.uploadFile({
        content: 'content',
      } as UploadFileOptions),
    ).rejects.toThrow('fileName or repoPath must be specified')
  })
})

describe('gitClient uploadImage', () => {
  it('成功上传 Buffer 格式图片', async () => {
    const mockFetch = vi.fn()

    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => '{}',
      json: async () => ({
        content: makeGitHubContentResponse({
          path: 'image.png',
          sha: 'image-sha',
        }),
      }),
    })

    const client = await run_git_client_test({})
    ;(client as any).fetchImpl = mockFetch

    const imageBuffer = Buffer.from('fake-image-data')

    const result = await client.uploadImage({
      content: imageBuffer,
      fileName: 'image.png',
      mimeType: 'image/png',
    })

    expect(result.path).toBe('image.png')
    expect(result.sha).toBe('image-sha')
  })

  it('成功上传字符串格式图片', async () => {
    const mockFetch = vi.fn()

    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => '{}',
      json: async () => ({
        content: makeGitHubContentResponse({
          path: 'image.jpg',
          sha: 'image-sha-2',
        }),
      }),
    })

    const client = await run_git_client_test({})
    ;(client as any).fetchImpl = mockFetch

    const result = await client.uploadImage({
      content: 'binary-string-data',
      fileName: 'image.jpg',
    })

    expect(result.path).toBe('image.jpg')
  })
})

describe('gitClient deleteFile', () => {
  it('成功删除文件', async () => {
    const mockFetch = vi.fn()

    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => '{}',
      json: async () => ({ sha: 'delete-sha' }),
    })

    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => '{}',
      json: async () => ({ commit: { sha: 'commit-sha' } }),
    })

    const client = await run_git_client_test({})
    ;(client as any).fetchImpl = mockFetch

    await client.deleteFile({
      path: 'to-delete.md',
      branch: 'main',
    })

    expect(mockFetch).toHaveBeenCalledTimes(2)
  })

  it('文件不存在时抛出异常', async () => {
    await expect(
      run_delete_file_test({
        path: 'nonexistent.md',
        branch: 'main',
        mockResponses: {
          'https://api.github.com/repos/owner/repo/contents/nonexistent.md?ref=main': {
            status: 404,
            body: { message: 'Not Found' },
          },
        },
      }),
    ).rejects.toThrow('Cannot delete nonexistent.md: file not found')
  })

  it('API 错误时抛出异常', async () => {
    const mockFetch = vi.fn()

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => '{}',
      json: async () => ({ sha: 'file-sha' }),
    })

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      text: async () => '{"message": "Forbidden"}',
      json: async () => ({ message: 'Forbidden' }),
    })

    const client = await run_git_client_test({})
    ;(client as any).fetchImpl = mockFetch

    await expect(
      client.deleteFile({
        path: 'file.md',
        branch: 'main',
      }),
    ).rejects.toThrow('Failed to delete content')
  })
})

describe('gitClient 自定义选项', () => {
  it('使用自定义 committer', async () => {
    const mockFetch = vi.fn()

    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => '{}',
      json: async () => ({
        content: makeGitHubContentResponse(),
      }),
    })

    const client = gitClient('https://github.com/owner/repo', 'token', {
      fetchImpl: mockFetch,
      committer: {
        name: 'Test User',
        email: 'test@example.com',
      },
    })

    await client.uploadFile({
      content: 'test',
      fileName: 'test.md',
    })

    expect(mockFetch).toHaveBeenCalled()
  })

  it('使用自定义 branch', async () => {
    const client = gitClient('https://github.com/owner/repo', 'token', {
      branch: 'develop',
    })

    expect(client.type).toBe('github')
  })

  it('使用自定义 apiBase', async () => {
    const treeResponse = makeGitTreeResponse()

    const mockFetch = createMockFetch({
      responses: {
        'https://custom.api.com/repos/owner/repo/git/trees/main?recursive=1': {
          status: 200,
          body: treeResponse,
        },
      },
    })

    const client = gitClient('https://github.com/owner/repo', 'token', {
      fetchImpl: mockFetch,
      apiBase: 'https://custom.api.com',
    })

    await client.getTree('main')

    expect(mockFetch).toHaveBeenCalledWith(
      'https://custom.api.com/repos/owner/repo/git/trees/main?recursive=1',
      expect.any(Object),
    )
  })
})

describe('gitClient 路径规范化', () => {
  it('规范化带斜杠和空格的路径', async () => {
    const mockFetch = vi.fn()

    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => '{}',
      json: async () => ({
        content: makeGitHubContentResponse({
          path: 'clean/path.md',
        }),
      }),
    })

    const client = await run_git_client_test({})
    ;(client as any).fetchImpl = mockFetch

    await client.uploadFile({
      content: 'test',
      repoPath: '  messy //  path  ',
    })

    expect(mockFetch).toHaveBeenCalled()
  })
})
