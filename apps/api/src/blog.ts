import type { VercelRequest, VercelResponse } from '@vercel/node'
import { extractBlogBySlug, extractBlogsFromDir } from '@rika/shared/blog'
import path from 'path'

const BLOG_DIR = path.join(process.cwd(), '../web/blog')

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, query } = req

  if (method === 'GET') {
    try {
      const { slug } = query

      if (slug && typeof slug === 'string') {
        // Get single blog post
        const blog = await extractBlogBySlug(BLOG_DIR, slug)

        if (!blog) {
          return res.status(404).json({ error: 'Blog post not found' })
        }

        return res.status(200).json(blog)
      } else {
        // Get all blog posts (list only, without content)
        const blogs = await extractBlogsFromDir(BLOG_DIR)
        const blogList = blogs.map(({ content, ...rest }) => rest)

        // Sort by date descending
        blogList.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )

        return res.status(200).json(blogList)
      }
    } catch (error) {
      console.error('Error fetching blogs:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
