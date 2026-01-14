import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

export interface ParseBlogResult {
  absolutePath: string
  title: string
  tags: string[]
  desc: string
  createdAt: string
  updatedAt: string
}

function extractHiddenSection(content: string): { raw: string; rest: string } {
  const match = content.match(/<p hidden>([\s\S]*?)(?:<\/p>|<p>)/i);
  if (!match) {
    return { raw: '', rest: content };
  }
  const hiddenBlock = match[0];
  const rest = content.replace(hiddenBlock, '');
  return { raw: match[1] ?? '', rest };
}

function parseHiddenMetadata(raw: string): { tags: string[]; desc: string } {
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  let tags: string[] = [];
  let desc = '';

  for (const line of lines) {
    if (line.toLowerCase().startsWith('tags:')) {
      tags = line
        .slice(5)
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
      continue;
    }

    if (line.toLowerCase().startsWith('desc:')) {
      desc = line.slice(5).trim();
    }
  }

  return { tags, desc };
}

function extractTitle(content: string): string {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim());
  const raw = lines.find((line) => line.length > 0) ?? '';
  return raw.replace(/^#+\s*/, '').trim();
}

export async function extractBlog(absolutePath: string): Promise<ParseBlogResult> {
  const fileStat = await stat(absolutePath);
  const content = await readFile(absolutePath, 'utf-8');
  const hidden = extractHiddenSection(content);
  const title = extractTitle(hidden.rest);
  if (!title) {
    throw new Error(`解析失败：${absolutePath} 未找到标题`);
  }
  const { tags, desc } = parseHiddenMetadata(hidden.raw);

  return {
    absolutePath,
    title,
    tags,
    desc,
    createdAt: fileStat.birthtime.toISOString(),
    updatedAt: fileStat.mtime.toISOString(),
  };
}

async function collectMarkdownFiles(dirAbsolutePath: string): Promise<string[]> {
  const entries = await readdir(dirAbsolutePath, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dirAbsolutePath, entry.name);
    if (entry.isDirectory()) {
      const nested = await collectMarkdownFiles(fullPath);
      files.push(...nested);
      continue;
    }

    if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
      files.push(fullPath);
    }
  }

  return files;
}

export async function extractBlogsFromDir(dirAbsolutePath: string): Promise<ParseBlogResult[]> {
  const markdownFiles = (await collectMarkdownFiles(dirAbsolutePath)).sort((a, b) => a.localeCompare(b));

  const results: ParseBlogResult[] = [];
  for (const filePath of markdownFiles) {
    results.push(await extractBlog(filePath));
  }
  return results;
}
