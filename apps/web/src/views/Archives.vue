<template>
  <MainLayout>
    <!-- Header -->
    <header class="content-header">
      <h1 class="page-title">Archives</h1>
      <p class="page-subtitle">{{ blogStore.sortedBlogs.length }} posts in total</p>
    </header>

    <!-- Loading State -->
    <div v-if="blogStore.loading && blogStore.sortedBlogs.length === 0" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading posts...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="blogStore.error" class="error-state">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
      <p>{{ blogStore.error }}</p>
    </div>

    <!-- Archives List -->
    <div v-else class="archives-list">
      <div v-for="group in groupedByYear" :key="group.year" class="year-group">
        <h2 class="year-title">{{ group.year }}</h2>
        <div class="year-count">{{ group.posts.length }} posts</div>

        <div class="posts-list">
          <router-link
            v-for="blog in group.posts"
            :key="blog.slug"
            :to="`/blog/${blog.slug}`"
            class="archive-item"
          >
            <div class="archive-item-content">
              <h3 class="archive-title">{{ blog.title }}</h3>
              <div class="archive-meta">
                <time :datetime="blog.createdAt" class="archive-date">
                  {{ formatMonthDay(blog.createdAt) }}
                </time>
                <div v-if="blog.tags.length > 0" class="archive-tags">
                  <span v-for="tag in blog.tags" :key="tag" class="tag-small">
                    #{{ tag }}
                  </span>
                </div>
              </div>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 archive-arrow">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </router-link>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="blogStore.sortedBlogs.length === 0 && !blogStore.loading" class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-16 h-16">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
        <p>No posts yet. Check back soon!</p>
      </div>
    </div>

    <!-- Right Sidebar -->
    <template #right-sidebar>
      <TagWidget v-if="blogStore.tagCounts.length > 0" :tags="blogStore.tagCounts" />
    </template>
  </MainLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useBlogStore, type BlogListItem } from '@/stores/blog'
import MainLayout from '@/components/MainLayout.vue'
import TagWidget from '@/components/TagWidget.vue'

const blogStore = useBlogStore()

// Group posts by year
const groupedByYear = computed(() => {
  const groups: Map<number, BlogListItem[]> = new Map()

  blogStore.sortedBlogs.forEach((blog) => {
    const year = new Date(blog.createdAt).getFullYear()
    if (!groups.has(year)) {
      groups.set(year, [])
    }
    groups.get(year)!.push(blog)
  })

  return Array.from(groups.entries())
    .map(([year, posts]) => ({ year, posts }))
    .sort((a, b) => b.year - a.year) // Sort by year descending
})

const formatMonthDay = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}

</script>

<style scoped>
.content-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 0.5rem;
  line-height: 1.2;
}

.page-subtitle {
  font-size: 1.125rem;
  color: var(--text-secondary);
  margin: 0;
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  color: var(--text-secondary);
}

.loading-state svg,
.error-state svg,
.empty-state svg {
  width: 3rem;
  height: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.loading-spinner {
  width: 2.5rem;
  height: 2.5rem;
  border: 3px solid var(--border-color);
  border-top-color: var(--accent-color);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.archives-list {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.year-group {
  background: var(--bg-card);
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: 1px solid var(--border-color);
}

.year-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.25rem;
}

.year-count {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.archive-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-radius: 0.5rem;
  text-decoration: none;
  color: var(--text-primary);
  transition: all 0.2s ease;
  gap: 1rem;
}

.archive-item:hover {
  background: var(--bg-hover);
  transform: translateX(4px);
}

.archive-item-content {
  flex: 1;
  min-width: 0;
}

.archive-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.5rem;
  color: var(--text-primary);
}

.archive-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.archive-date {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.archive-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.tag-small {
  display: inline-block;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  background: var(--bg-tag);
  color: var(--tag-color);
  font-size: 0.75rem;
  font-weight: 500;
}

.archive-arrow {
  flex-shrink: 0;
  color: var(--text-secondary);
  transition: transform 0.2s ease;
}

.archive-item:hover .archive-arrow {
  transform: translateX(4px);
  color: var(--accent-color);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .page-title {
    font-size: 2rem;
  }
}

:root {
  --bg-card: #ffffff;
  --bg-hover: #f1f5f9;
  --bg-tag: #eff6ff;
  --border-color: #e2e8f0;
  --text-primary: #0f172a;
  --text-secondary: #64748b;
  --accent-color: #3b82f6;
  --tag-color: #3b82f6;
}

.dark {
  --bg-card: #1e293b;
  --bg-hover: #334155;
  --bg-tag: #1e3a8a;
  --border-color: #334155;
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --accent-color: #60a5fa;
  --tag-color: #60a5fa;
}
</style>
