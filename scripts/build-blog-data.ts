import { writeFile, mkdir } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { extractBlogsFromDir } from '@rika/shared/blog'

const BLOG_DIR = resolve(process.cwd(), 'blog')
const OUTPUT_FILE = resolve(process.cwd(), 'apps/web/public/data/blog-data.json')

async function buildBlogData() {
  console.log('📝 Building blog data...')
  console.log(`📂 Blog directory: ${BLOG_DIR}`)

  try {
    const blogs = await extractBlogsFromDir(BLOG_DIR)

    // Sort by date descending
    blogs.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    // Ensure output directory exists
    await mkdir(dirname(OUTPUT_FILE), { recursive: true })

    // Write JSON file
    await writeFile(OUTPUT_FILE, JSON.stringify(blogs, null, 2), 'utf-8')

    console.log(`✅ Generated ${blogs.length} blog posts`)
    console.log(`📄 Output: ${OUTPUT_FILE}`)
    console.log()
    console.log('Blog posts:')
    blogs.forEach((blog) => {
      console.log(`  - ${blog.title} (${blog.slug})`)
    })
  } catch (error) {
    console.error('❌ Error building blog data:', error)
    process.exit(1)
  }
}

buildBlogData()
