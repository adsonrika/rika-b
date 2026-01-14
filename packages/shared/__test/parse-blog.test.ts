import { describe, it, expect } from 'vitest';

import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { extractBlog, extractBlogsFromDir } from '@rika/shared/blog';

type MarkdownOptions = {
    tags?: string
    desc?: string
    title?: string
    body?: string
}

function makeMarkdown({
  tags = 'tag-a, tag-b',
  desc = '默认描述',
  title = '默认标题',
  body = '正文内容',
}: MarkdownOptions = {}): string {
  return `<p hidden>
tags: ${tags}
desc: ${desc}
<p>

### ${title}

${body}
`;
}

async function withTempDir<T>(action: (dir: string) => Promise<T>): Promise<T> {
  const dir = await mkdtemp(path.join(tmpdir(), 'rika-blog-'));
  try {
    return await action(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

async function run_extract_blog_it(options: MarkdownOptions = {}, fileName = 'fixture.md') {
  return withTempDir(async (dir) => {
    const filePath = path.join(dir, fileName);
    await writeFile(filePath, makeMarkdown(options), 'utf-8');
    return extractBlog(filePath);
  });
}

async function run_extract_blogs_it(
  blogs: (MarkdownOptions & { name: string })[] = []
) {
  return withTempDir(async (dir) => {
    for (const blog of blogs) {
      const filePath = path.join(dir, blog.name);
      await mkdir(path.dirname(filePath), { recursive: true });
      await writeFile(filePath, makeMarkdown(blog), 'utf-8');
    }

    return extractBlogsFromDir(dir);
  });
}

describe('blog解析测试', () => {
  it('解析成功', async () => {
    const result = await run_extract_blog_it({
      tags: 'tag-a, tag-b',
      desc: '这是一段描述',
      title: '一级标题',
    });
    expect(result.absolutePath.endsWith('fixture.md')).toBe(true);
    expect(result.title).toBe('一级标题');
    expect(result.tags).toEqual(['tag-a', 'tag-b']);
    expect(result.desc).toBe('这是一段描述');
    expect(result.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(result.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('缺少标题时抛错', async () => {
    await expect(run_extract_blog_it({
      tags: 'solo',
      desc: '缺少可见标题',
      title: '',
      body: '',
    })).rejects.toThrow('未找到标题');
  });

  it('解析目录中所有 md 文件（含子目录）', async () => {
    const results = await run_extract_blogs_it(
      [
        { name: 'a.md', title: 'AAA 标题', tags: 'alpha', desc: 'desc a' },
        { name: 'nested/b.md', title: 'BBB 标题', tags: 'beta,gamma', desc: 'desc b' },
        { name: 'others.txt', title: 'BBB 标题', tags: 'beta,gamma', desc: 'desc b' },
      ]
    );
    expect(results).toHaveLength(2);
    expect(results[0]?.title).toBe('AAA 标题');
    expect(results[0]?.tags).toEqual(['alpha']);
    expect(results[1]?.title).toBe('BBB 标题');
    expect(results[1]?.tags).toEqual(['beta', 'gamma']);
    expect(results[1]?.absolutePath.includes(path.join('nested', 'b.md'))).toBe(true);
  });
});
