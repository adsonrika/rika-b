import { defineStore } from 'pinia'
import { ref, computed, onMounted } from 'vue'
import type { ParseBlogResult } from '@rika/shared/blog'
import { logger } from '@rika/shared/logger'

const log = logger(__SOURCE_FILE__)

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

export const useBlogStore = defineStore('blog', () => {
  const blogs = ref<ParseBlogResult[]>([])
  const initialized = ref(false)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchBlogs = async (): Promise<void> => {
    if (initialized.value) return

    loading.value = true
    error.value = null

    try {
      const response = await fetch('/data/blog-data.json')
      if (!response.ok) {
        throw new Error('Failed to fetch blog data')
      }
      const data: ParseBlogResult[] = await response.json()
      blogs.value = data
      initialized.value = true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
    } finally {
      loading.value = false
    }
  }

  // Auto-fetch blogs on store creation
  onMounted(() => {
    fetchBlogs()
  })

  const getBySlug = (slug: string): ParseBlogResult | null => {
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
    initialized,
    blogs,
    sortedBlogs,
    tagCounts,
    loading,
    error,
    fetchBlogs,
    getBySlug,
    getBlogsByTag,
  }
})
