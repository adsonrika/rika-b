import { createGitHubRestClient } from './github.js';
import type {
  GitClient,
  GitClientOptions,
  UploadFileOptions,
  UploadImageOptions,
  DeleteFileOptions,
  GitTreeResponse,
  UploadResult
} from './type.js';

export type {
  GitClient,
  GitClientOptions,
  UploadFileOptions,
  UploadImageOptions,
  DeleteFileOptions,
  GitTreeResponse,
  UploadResult
};


type GitClientType = GitClient['type']

export function gitClient(
  url: string,
  token: string,
  options: Omit<GitClientOptions, 'type' | 'owner' | 'repo' | 'token'> = {}
) {
  const { type, owner, repo } = parseRepoUrl(url);


  if (type === 'github') {
    return createGitHubRestClient({ owner, repo, token, ...options });
  }
  // if (type === 'gitcode') {
  //     return createGitcodeRestClient({ owner, repo, token, ...options })
  // }
  throw new Error('Unsupported repository type, only github and gitcode are supported');
}


function parseRepoUrl(repoUrl: string): { type: 'github' | 'gitcode', owner: string; repo: string } {
  const cleaned = repoUrl.replace(/\.git$/, '');
  if (cleaned.startsWith('git@')) {
    const match = cleaned.match(/git@(?<type>github|gitcode)\.com:(?<owner>[^/]+)\/(?<repo>.+)$/);
    if (match?.groups) {
      return { type: match.groups.type as GitClientType, owner: match.groups.owner as string, repo: match.groups.repo as string };
    }
    throw new Error('Invalid repository URL');
  }
  const url = new URL(cleaned);
  const match = url.hostname.match(/(?<type>github|gitcode)\.com$/);
  if (!match?.groups) {
    throw new Error('Invalid repository URL');
  }
  const type = match.groups.type as GitClientType;
  const [owner, repo] = url.pathname.replace(/^\/+/, '').split('/');
  if (!owner || !repo) {
    throw new Error('Invalid repository URL');
  }
  return { type, owner, repo };
}
