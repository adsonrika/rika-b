/**
 * vite-ssg 28.x 配置
 *
 * 此文件用于配置静态站点生成
 * includeRoutes 函数返回需要预渲染的所有路由
 */

import { extractBlogsFromDir } from '@rika/shared/blog'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(import.meta.url)
const ROOT_DIR = resolve(__dirname, '../..')
const BLOG_DIR = resolve(ROOT_DIR, 'blog')
const BLOG_DATA_PATH = resolve(ROOT_DIR, 'public/data/blog-data.json')

/**
 * 生成需要预渲染的路由列表
 */
export async function includeRoutes() {
  // 静态路由
  const staticRoutes = ['/']

  // 动态路由：博客文章
  const blogs = await extractBlogsFromDir(BLOG_DIR)
  const blogRoutes = blogs.map(blog => `/blog/${blog.slug}`)

  // Tag routes and archives routes - read from blog-data.json
  const fs = require('fs')
  let tagRoutes: string[] = []
  if (fs.existsSync(BLOG_DATA_PATH)) {
    const data = JSON.parse(fs.readFileSync(BLOG_DATA_PATH, 'utf-8'))
    const tags = new Set<string>()
    data.forEach((blog: any) => {
      blog.tags?.forEach((tag: string) => tags.add(tag))
    })
    tagRoutes = Array.from(tags).map((tag: string) => `/tag/${tag}`)
  }

  // Archives route
  const otherRoutes = ['/archives']

  return [...staticRoutes, ...blogRoutes, ...tagRoutes, ...otherRoutes]
}
