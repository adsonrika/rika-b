import type { BinaryContent, FetchLike } from '../utils/index.js';

export interface UploadFileOptions {
    repoPath?: string
    folder?: string
    fileName?: string
    message?: string
    branch?: string
    encoding?: BufferEncoding | 'base64'
    committer?: {
        name: string
        email: string
    }
    content: BinaryContent
}

export interface UploadResult {
    path: string
    sha: string
    downloadUrl?: string
}

export interface UploadImageOptions extends Omit<UploadFileOptions, 'encoding'> {
    /**
     * 默认按 binary Buffer 编码为 base64 上传
     */
    mimeType?: string
}

export interface GitTreeItem {
    path: string
    mode: string
    type: 'blob' | 'tree' | 'commit'
    sha: string
    size?: number
    url: string
}

export interface GitTreeResponse {
    sha: string
    tree: GitTreeItem[]
    truncated: boolean
}

export interface DeleteFileOptions {
    path: string
    branch: string
    committer?: {
        name: string
        email: string
    }
}

export interface GitClientOptions {
    owner: string
    repo: string
    token: string
    branch?: string
    committer?: {
        name: string
        email: string
    }
    fetchImpl?: FetchLike
    apiBase?: string
}

export interface GitClient {
    type: 'github' | 'gitcode'
    getTree(ref?: string, recursive?: boolean): Promise<GitTreeResponse>
    uploadFile(options: UploadFileOptions): Promise<UploadResult>
    uploadImage(options: UploadImageOptions): Promise<UploadResult>
    getExistingFileSha(path: string, branch: string): Promise<string | undefined>
    deleteFile(options: DeleteFileOptions): Promise<void>
}