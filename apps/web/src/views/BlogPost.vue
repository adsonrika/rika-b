<template>
  <MainLayout>
    <!-- Loading State -->
    <div v-if="blogStore.loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading post...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="blogStore.error" class="error-state">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
      <p>{{ blogStore.error }}</p>
    </div>

    <!-- Not Found State -->
    <div v-else-if="!blog" class="error-state">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
      </svg>
      <h2>Post not found</h2>
      <router-link to="/" class="back-link">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Back to home
      </router-link>
    </div>

    <!-- Blog Post -->
    <article v-else class="blog-post">
      <!-- Article Header -->
      <header class="article-header">
        <div v-if="blog.tags.length > 0" class="article-tags">
          <router-link
            v-for="tag in blog.tags"
            :key="tag"
            :to="`/tag/${tag}`"
            class="tag"
          >
            #{{ tag }}
          </router-link>
        </div>

        <h1 class="article-title">
          {{ blog.title }}
        </h1>

        <div class="article-meta">
          <time :datetime="blog.createdAt" class="meta-item">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            <span>{{ formatDate(blog.createdAt) }}</span>
          </time>

          <span v-if="blog.updatedAt !== blog.createdAt" class="meta-item">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            <span>Updated {{ formatDate(blog.updatedAt) }}</span>
          </span>
        </div>
      </header>

      <!-- Article Content -->
      <div class="article-content">
        <div
          class="prose prose-slate dark:prose-invert max-w-none
                 prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-slate-100
                 prose-p:leading-relaxed prose-p:text-slate-700 dark:prose-p:text-slate-300
                 prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:font-medium prose-a:no-underline hover:prose-a:underline
                 prose-strong:text-slate-900 dark:prose-strong:text-slate-100
                 prose-code:text-slate-900 dark:prose-code:text-slate-100 prose-code:bg-slate-100 dark:prose-code:bg-slate-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-medium
                 prose-pre:bg-slate-900 dark:prose-pre:bg-slate-950
                 prose-blockquote:border-slate-200 dark:prose-blockquote:border-slate-800 prose-blockquote:text-slate-700 dark:prose-blockquote:text-slate-300
                 prose-hr:border-slate-200 dark:prose-hr:border-slate-800"
          v-html="renderedContent"
        />
      </div>
    </article>

    <!-- Right Sidebar -->
    <template #right-sidebar>
      <div v-if="tocItems.length > 0" class="sidebar-widget">
        <TOC :toc-items="tocItems" />
      </div>
      <TagWidget v-if="blogStore.tagCounts.length > 0" :tags="blogStore.tagCounts" />
    </template>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useBlogStore } from '@/stores/blog'
import MainLayout from '@/components/MainLayout.vue'
import TOC from '@/components/TOC.vue'
import TagWidget from '@/components/TagWidget.vue'
import { renderMarkdown, extractTOC } from '@/utils/markdown'
import { useCodeCopy } from '@/composables/useCodeCopy'
import type { ParseBlogResult } from '@rika/shared/blog'
import { logger } from '@rika/shared/logger'

const log = logger(__SOURCE_FILE__)

const route = useRoute()
const blogStore = useBlogStore()

const blog = ref<ParseBlogResult | null>(null)

const renderedContent = computed(() => {
  if (!blog.value) return ''
  return renderMarkdown(blog.value.content)
})

const tocItems = computed(() => {
  if (!blog.value) return []
  return extractTOC(blog.value.content)
})

const loadBlog = (slug: string) => {
  const result = blogStore.getBySlug(slug)
  blog.value = result
}

onMounted(() => {
  loadBlog(route.params.slug as string)
})

watch(() => [route.params.slug, blogStore.loading], ([newSlug]) => {
  if (newSlug) {
    loadBlog(newSlug as string)
  }
})

// Setup code copy functionality
useCodeCopy()

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped>
.sidebar-widget {
  background: var(--bg-card);
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: 1px solid var(--border-color);
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  color: var(--text-secondary);
}

.error-state h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 1rem 0;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  color: var(--text-primary);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
}

.back-link:hover {
  background: var(--bg-hover);
  transform: translateX(-4px);
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

.blog-post {
  background: var(--bg-card);
  border-radius: 0.75rem;
  padding: 2.5rem;
  border: 1px solid var(--border-color);
}

.article-header {
  margin-bottom: 2.5rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--border-color);
}

.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.article-tags .tag {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  background: var(--bg-tag);
  color: var(--tag-color);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  text-decoration: none;
  transition: all 0.2s ease;
}

.article-tags .tag:hover {
  filter: brightness(0.9);
}

.article-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 1rem;
  line-height: 1.2;
}

.article-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.meta-item svg {
  flex-shrink: 0;
}

.article-content {
  font-size: 1.0625rem;
}

/* Custom prose styles */
:deep(.prose pre) {
  @apply rounded-lg;
  @apply overflow-x-auto;
}

:deep(.prose pre code) {
  @apply bg-transparent;
  @apply p-0;
  @apply text-slate-100;
  font-size: 0.875rem;
}

:deep(.code-block-wrapper) {
  position: relative;
  border-radius: 0.5rem;
  overflow: hidden;
  background: #1e293b;
  border: 1px solid #334155;
  display: flex;
  flex-direction: column;
}

:deep(.dark .code-block-wrapper) {
  background: #0f172a;
  border-color: #1e293b;
}

:deep(.code-header) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1rem;
  background: #334155;
  border-bottom: 1px solid #475569;
}

:deep(.dark .code-header) {
  background: #1e293b;
  border-bottom-color: #334155;
}

:deep(.code-language) {
  font-size: 0.75rem;
  font-weight: 500;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

:deep(.copy-button) {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0 0.25rem;
  background: #475569;
  border: 1px solid #64748b;
  border-radius: 0.375rem;
  color: #e2e8f0;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

:deep(.copy-button:hover) {
  background: #64748b;
  border-color: #94a3b8;
}

:deep(.copy-button.copied) {
  background: #059669;
  border-color: #10b981;
  color: #ffffff;
}

:deep(.copy-button svg) {
  width: 1rem;
  height: 1rem;
}

:deep(.code-block-wrapper pre) {
  margin: 0;
  padding: 1rem;
  background: transparent;
  border: none;
}

:deep(.code-block-wrapper code) {
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', monospace;
  font-size: 0.875rem;
  line-height: 1.6;
  color: #e2e8f0;
}

:deep(.dark .code-block-wrapper code) {
  color: #f1f5f9;
}

:deep(.prose h2[id]),
:deep(.prose h3[id]),
:deep(.prose h4[id]) {
  scroll-margin-top: 6rem;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .blog-post {
    padding: 1.5rem;
  }

  .article-title {
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
