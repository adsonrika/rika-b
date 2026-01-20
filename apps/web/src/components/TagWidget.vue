<template>
  <div class="sidebar-section widget-section">
    <div class="widget-header">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.389l.184-.108a.375.375 0 000-.649l-6.446-6.446a1.5 1.5 0 112.122-2.12l6.447 6.446a.375.375 0 00.649 0l.108-.184c.483-.827.31-1.908-.389-2.607L11.16 3.659A2.25 2.25 0 009.568 3z" />
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 17.5h12" />
      </svg>
      <h3 class="widget-title">Tags</h3>
    </div>
    <div class="tags-list">
      <router-link
        v-for="{ tag, count } in sortedTags"
        :key="tag"
        :to="`/tag/${tag}`"
        class="tag-item"
      >
        <span class="tag-name">#{{ tag }}</span>
        <span class="tag-count">{{ count }}</span>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface TagCount {
  tag: string
  count: number
}

const props = defineProps<{
  tags: TagCount[]
}>()

const sortedTags = computed(() => {
  return [...props.tags].sort((a, b) => b.count - a.count)
})
</script>

<style scoped>
.widget-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.widget-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
}

.tags-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.tag-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  color: var(--text-secondary);
  text-decoration: none;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.tag-item:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.tag-name {
  font-weight: 500;
}

.tag-count {
  font-size: 0.75rem;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  background: var(--bg-tag);
  color: var(--text-primary);
}

:root {
  --bg-card: #ffffff;
  --bg-hover: #f1f5f9;
  --bg-active: #e2e8f0;
  --bg-tag: #e2e8f0;
  --border-color: #e2e8f0;
  --text-primary: #0f172a;
  --text-secondary: #64748b;
}

.dark {
  --bg-card: #1e293b;
  --bg-hover: #334155;
  --bg-active: #475569;
  --bg-tag: #334155;
  --border-color: #334155;
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
}
</style>
