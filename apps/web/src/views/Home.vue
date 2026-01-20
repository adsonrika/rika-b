<template>
  <MainLayout>
    <!-- Header -->
    <header class="content-header">
      <h1 class="page-title">Latest Posts</h1>
      <p class="page-subtitle">Thoughts, tutorials, and insights</p>
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

    <!-- Blog Cards Grid -->
    <div v-else class="articles-grid">
      <ArticleCard
        v-for="blog in blogStore.sortedBlogs"
        :key="blog.slug"
        :blog="blog"
      />

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
import { useBlogStore } from '@/stores/blog'
import MainLayout from '@/components/MainLayout.vue'
import ArticleCard from '@/components/ArticleCard.vue'
import TagWidget from '@/components/TagWidget.vue'

const blogStore = useBlogStore()

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

.articles-grid {
  display: grid;
  gap: 1.5rem;
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

@media (max-width: 1024px) {
  .page-title {
    font-size: 2rem;
  }
}

:root {
  --border-color: #e2e8f0;
  --text-primary: #0f172a;
  --text-secondary: #64748b;
  --accent-color: #3b82f6;
}

.dark {
  --border-color: #334155;
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --accent-color: #60a5fa;
}
</style>
