import { ref, computed } from 'vue'
import type { ParseBlogResult } from '@rika/shared/blog'

export interface BlogListItem {
  absolutePath: string
  slug: string
  title: string
  tags: string[]
  desc: string
  createdAt: string
  updatedAt: string
  coverImage?: string
}

const blogs = ref<ParseBlogResult[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const dataLoaded = ref(false)

export function useBlog() {
  const fetchBlogs = async (): Promise<BlogListItem[]> => {
    if (dataLoaded.value && blogs.value.length > 0) {
      return blogs.value.map(
        (blog): BlogListItem => ({
          absolutePath: blog.absolutePath,
          slug: blog.slug,
          title: blog.title,
          tags: blog.tags,
          desc: blog.desc,
          createdAt: blog.createdAt,
          updatedAt: blog.updatedAt,
          coverImage: (blog as any).coverImage,
        }),
      )
    }

    loading.value = true
    error.value = null

    try {
      const response = await fetch('/data/blog-data.json')
      if (!response.ok) {
        throw new Error('Failed to fetch blog data')
      }
      const data: ParseBlogResult[] = await response.json()
      blogs.value = data
      dataLoaded.value = true
      return data.map(
        (blog): BlogListItem => ({
          absolutePath: blog.absolutePath,
          slug: blog.slug,
          title: blog.title,
          tags: blog.tags,
          desc: blog.desc,
          createdAt: blog.createdAt,
          updatedAt: blog.updatedAt,
          coverImage: (blog as any).coverImage,
        }),
      )
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
      return []
    } finally {
      loading.value = false
    }
  }

  const getBlogBySlug = (slug: string): ParseBlogResult | null => {
    return blogs.value.find(blog => blog.slug === slug) || null
  }

  const blogList = computed<BlogListItem[]>(() => {
    return blogs.value.map(
      (blog): BlogListItem => ({
        absolutePath: blog.absolutePath,
        slug: blog.slug,
        title: blog.title,
        tags: blog.tags,
        desc: blog.desc,
        createdAt: blog.createdAt,
        updatedAt: blog.updatedAt,
        coverImage: (blog as any).coverImage,
      }),
    )
  })

  const sortedBlogs = computed(() => {
    return [...blogList.value].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
  })

  const getBlogsByTag = computed(() => {
    const tagMap = new Map<string, BlogListItem[]>()
    blogList.value.forEach(blog => {
      blog.tags.forEach(tag => {
        if (!tagMap.has(tag)) {
          tagMap.set(tag, [])
        }
        tagMap.get(tag)!.push(blog)
      })
    })
    return tagMap
  })

  const allTags = computed(() => {
    const tags = new Set<string>()
    blogList.value.forEach(blog => {
      blog.tags.forEach(tag => tags.add(tag))
    })
    return Array.from(tags).sort()
  })

  const allSlugs = computed(() => {
    return blogs.value.map(blog => blog.slug)
  })

  const tagCounts = computed(() => {
    const counts: Map<string, number> = new Map()
    blogList.value.forEach(blog => {
      blog.tags.forEach(tag => {
        counts.set(tag, (counts.get(tag) || 0) + 1)
      })
    })
    return Array.from(counts.entries()).map(([tag, count]) => ({ tag, count }))
  })

  return {
    blogs,
    blogList,
    sortedBlogs,
    getBlogsByTag,
    allTags,
    allSlugs,
    tagCounts,
    loading,
    error,
    fetchBlogs,
    getBlogBySlug,
  }
}
