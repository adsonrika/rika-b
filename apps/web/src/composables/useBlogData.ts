import { computed } from 'vue'
import { blogData, blogBySlug } from '@/generated/blog-data'
import type { ParseBlogResult } from '@rika/shared/blog'

export function useBlogData() {
  // Get all blogs (without content for list view)
  const blogList = computed(() => {
    return blogData.map(({ content, ...rest }) => rest)
  })

  // Get blogs sorted by date
  const sortedBlogs = computed(() => {
    return [...blogList.value].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  })

  // Get blog by slug (with content)
  const getBlogBySlug = (slug: string): ParseBlogResult | null => {
    return blogBySlug[slug] || null
  })

  // Get all unique tags
  const allTags = computed(() => {
    const tags = new Set<string>()
    blogList.value.forEach((blog) => {
      blog.tags.forEach((tag) => tags.add(tag))
    })
    return Array.from(tags).sort()
  })

  // Get blogs by tag
  const blogsByTag = computed(() => {
    const tagMap = new Map<string, typeof blogList.value>()
    blogList.value.forEach((blog) => {
      blog.tags.forEach((tag) => {
        if (!tagMap.has(tag)) {
          tagMap.set(tag, [])
        }
        tagMap.get(tag)!.push(blog)
      })
    })
    return tagMap
  })

  return {
    blogData,
    blogList,
    sortedBlogs,
    blogBySlug,
    allTags,
    blogsByTag,
    getBlogBySlug
  }
}
