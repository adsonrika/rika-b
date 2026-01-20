import { writeFile, mkdir } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { extractBlogsFromDir } from '@rika/shared/blog'

const BLOG_DIR = resolve(process.cwd(), '../../blog')
const OUTPUT_FILE = resolve(process.cwd(), '../src/generated/blog-data.ts')

async function buildBlogData() {
  console.log('📝 Building blog data...')
  console.log(`📂 Blog directory: ${BLOG_DIR}`)

  try {
    const blogs = await extractBlogsFromDir(BLOG_DIR)

    // Sort by date descending
    blogs.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    // Generate TypeScript file
    const content = `// This file is auto-generated during build
import type { ParseBlogResult } from '@rika/shared/blog'

export const blogData: ParseBlogResult[] = ${JSON.stringify(blogs, null, 2)}

export const blogBySlug: Record<string, ParseBlogResult> = blogData.reduce((acc, blog) => {
  acc[blog.slug] = blog
  return acc
}, {} as Record<string, ParseBlogResult>)

export const blogSlugs = blogData.map(b => b.slug)
`

    // Ensure output directory exists
    await mkdir(dirname(OUTPUT_FILE), { recursive: true })

    // Write file
    await writeFile(OUTPUT_FILE, content, 'utf-8')

    console.log(`✅ Generated ${blogs.length} blog posts`)
    console.log(`📄 Output: ${OUTPUT_FILE}`)
  } catch (error) {
    console.error('❌ Error building blog data:', error)
    process.exit(1)
  }
}

buildBlogData()
