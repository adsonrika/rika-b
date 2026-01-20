<template>
  <article class="article-card">
    <router-link :to="`/blog/${blog.slug}`" class="card-link">
      <!-- Featured Image (optional) -->
      <div v-if="blog.coverImage" class="card-image">
        <img :src="blog.coverImage" :alt="blog.title" loading="lazy" />
        <div class="image-overlay"></div>
      </div>

      <!-- Card Content -->
      <div class="card-content">
        <!-- Category/Tags -->
        <div v-if="blog.tags.length > 0" class="card-tags">
          <router-link :to="`/tag/${blog.tags[0]}`" class="tag" @click.stop>
            {{ blog.tags[0] }}
          </router-link>
        </div>

        <!-- Title -->
        <h2 class="card-title">
          {{ blog.title }}
        </h2>

        <!-- Description -->
        <p v-if="blog.desc" class="card-description">
          {{ blog.desc }}
        </p>

        <!-- Meta Info -->
        <div class="card-meta">
          <time :datetime="blog.createdAt" class="meta-item">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            <span>{{ formatDate(blog.createdAt) }}</span>
          </time>

          <span v-if="blog.tags.length > 1" class="meta-item tags">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.389l.184-.108a.375.375 0 000-.649l-6.446-6.446a1.5 1.5 0 112.122-2.12l6.447 6.446a.375.375 0 00.649 0l.108-.184c.483-.827.31-1.908-.389-2.607L11.16 3.659A2.25 2.25 0 009.568 3z" />
            </svg>
            <span>{{ blog.tags.length }} tags</span>
          </span>
        </div>
      </div>
    </router-link>
  </article>
</template>

<script setup lang="ts">
import type { BlogListItem } from '@/composables/useBlog'

defineProps<{
  blog: BlogListItem
}>()

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return 'Today'
  } else if (diffDays === 1) {
    return 'Yesterday'
  } else if (diffDays < 7) {
    return `${diffDays} days ago`
  } else if (diffDays < 30) {
    return `${Math.floor(diffDays / 7)} weeks ago`
  } else {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
}
</script>

<style scoped>
.article-card {
  background: var(--bg-card);
  border-radius: 0.75rem;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid var(--border-color);
}

.article-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px -5px rgba(0, 0, 0, 0.1);
}

.dark .article-card:hover {
  box-shadow: 0 8px 25px -5px rgba(0, 0, 0, 0.3);
}

.card-link {
  display: block;
  text-decoration: none;
  color: inherit;
}

.card-image {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: var(--bg-image);
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.article-card:hover .card-image img {
  transform: scale(1.05);
}

.image-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.1) 100%);
}

.card-content {
  padding: 1.5rem;
}

.card-tags {
  margin-bottom: 0.75rem;
}

.tag {
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

.tag:hover {
  filter: brightness(0.9);
}

.card-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.75rem;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-description {
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0 0 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: 0.9375rem;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.875rem;
  color: var(--text-muted);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.meta-item svg {
  flex-shrink: 0;
}

:root {
  --bg-card: #ffffff;
  --bg-hover: #f1f5f9;
  --bg-tag: #eff6ff;
  --bg-image: #f1f5f9;
  --border-color: #e2e8f0;
  --text-primary: #0f172a;
  --text-secondary: #64748b;
  --text-muted: #94a3b8;
  --tag-color: #3b82f6;
}

.dark {
  --bg-card: #1e293b;
  --bg-hover: #334155;
  --bg-tag: #1e3a8a;
  --bg-image: #0f172a;
  --border-color: #334155;
  --text-primary: #f1f5f9;
  --text-secondary: #cbd5e1;
  --text-muted: #94a3b8;
  --tag-color: #60a5fa;
}
</style>
