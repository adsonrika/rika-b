<template>
  <MainLayout>
    <!-- Header -->
    <header class="content-header">
      <div class="header-icon">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.389l.184-.108a.375.375 0 000-.649l-6.446-6.446a1.5 1.5 0 112.122-2.12l6.447 6.446a.375.375 0 00.649 0l.108-.184c.483-.827.31-1.908-.389-2.607L11.16 3.659A2.25 2.25 0 009.568 3z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 17.5h12" />
        </svg>
      </div>
      <h1 class="page-title">#{{ tag }}</h1>
      <p class="page-subtitle">{{ filteredBlogs.length }} post{{ filteredBlogs.length !== 1 ? 's' : '' }} with this tag</p>
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
        v-for="blog in filteredBlogs"
        :key="blog.slug"
        :blog="blog"
      />

      <!-- Empty State -->
      <div v-if="filteredBlogs.length === 0 && !blogStore.loading" class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-16 h-16">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.389l.184-.108a.375.375 0 000-.649l-6.446-6.446a1.5 1.5 0 112.122-2.12l6.447 6.446a.375.375 0 00.649 0l.108-.184c.483-.827.31-1.908-.389-2.607L11.16 3.659A2.25 2.25 0 009.568 3z" />
        </svg>
        <p>No posts found with tag <strong>#{{ tag }}</strong></p>
        <router-link to="/" class="back-link">
          View all posts
        </router-link>
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
import { useRoute } from 'vue-router'
import { useBlogStore } from '@/stores/blog'
import MainLayout from '@/components/MainLayout.vue'
import ArticleCard from '@/components/ArticleCard.vue'
import TagWidget from '@/components/TagWidget.vue'

const route = useRoute()
const blogStore = useBlogStore()

// Get the tag from route parameter
const tag = computed(() => route.params.tag as string)

// Filter blogs by tag
const filteredBlogs = computed(() => {
  if (!tag.value) return []
  return blogStore.sortedBlogs.filter((blog) =>
    blog.tags.some((t) => t.toLowerCase() === tag.value.toLowerCase())
  )
})

</script>

<style scoped>
.content-header {
  margin-bottom: 2rem;
}

.header-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, var(--accent-color) 0%, #8b5cf6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: 1rem;
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

.empty-state strong {
  color: var(--text-primary);
  font-weight: 600;
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

/* Responsive Design */
@media (max-width: 1024px) {
  .page-title {
    font-size: 2rem;
  }
}

:root {
  --bg-card: #ffffff;
  --bg-hover: #f1f5f9;
  --border-color: #e2e8f0;
  --text-primary: #0f172a;
  --text-secondary: #64748b;
  --accent-color: #3b82f6;
}

.dark {
  --bg-card: #1e293b;
  --bg-hover: #334155;
  --border-color: #334155;
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --accent-color: #60a5fa;
}
</style>
