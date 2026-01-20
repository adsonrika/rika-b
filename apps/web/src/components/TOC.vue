<template>
  <nav v-if="tocItems.length > 0" class="toc">
    <div class="widget-header">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.007 5.25H3.75v.008h.007V12zm-.007 5.25H3.75v.007h.007v-.007z" />
      </svg>
      <h3 class="widget-title">Table of Contents</h3>
    </div>
    <ul class="toc-list">
      <li
        v-for="item in tocItems"
        :key="item.id"
        :class="['toc-item', `toc-level-${item.level}`]"
      >
        <a
          :href="`#${item.id}`"
          :class="[
            'toc-link',
            activeHeadings.includes(item.id) ? 'toc-link-active' : ''
          ]"
          @click.prevent="scrollToHeading(item.id)"
        >
          {{ item.title }}
        </a>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface TOCItem {
  id: string
  level: number
  title: string
}

const props = defineProps<{
  tocItems: TOCItem[]
}>()

const activeHeadings = ref<string[]>([])

const scrollToHeading = (id: string) => {
  const element = document.getElementById(id)
  if (element) {
    const offset = 80 // Adjust based on your header height
    const top = element.getBoundingClientRect().top + window.pageYOffset - offset
    window.scrollTo({ top, behavior: 'smooth' })
  }
}

const updateActiveHeadings = () => {
  const headings = props.tocItems.map((item) => ({
    id: item.id,
    element: document.getElementById(item.id)
  }))

  const active: string[] = []
  const scrollPosition = window.scrollY + 100

  for (const heading of headings) {
    if (heading.element && heading.element.offsetTop <= scrollPosition) {
      active.push(heading.id)
    }
  }

  activeHeadings.value = active
}

onMounted(() => {
  window.addEventListener('scroll', updateActiveHeadings)
  updateActiveHeadings()
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateActiveHeadings)
})
</script>

<style scoped>
.toc {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.widget-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-primary);
}

.widget-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
}

.toc-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.toc-item {
  margin: 0;
  padding: 0;
}

.toc-item.toc-level-2 {
  margin-left: 0.75rem;
}

.toc-item.toc-level-3 {
  margin-left: 1.5rem;
}

.toc-item.toc-level-4 {
  margin-left: 2.25rem;
}

.toc-link {
  display: block;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  color: var(--text-secondary);
  text-decoration: none;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  line-height: 1.4;
}

.toc-link:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.toc-link-active {
  background: var(--bg-active);
  color: var(--text-primary);
  font-weight: 500;
}

:root {
  --bg-card: #ffffff;
  --bg-hover: #f1f5f9;
  --bg-active: #e2e8f0;
  --border-color: #e2e8f0;
  --text-primary: #0f172a;
  --text-secondary: #64748b;
}

.dark {
  --bg-card: #1e293b;
  --bg-hover: #334155;
  --bg-active: #475569;
  --border-color: #334155;
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
}
</style>