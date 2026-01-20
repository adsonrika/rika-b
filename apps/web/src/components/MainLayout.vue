<template>
  <div class="main-layout">
    <!-- Left Sidebar -->
    <aside v-if="showLeftSidebar" class="left-sidebar">
      <slot name="left-sidebar">
        <Sidebar
          :author="siteStore.author"
          :bio="siteStore.bio"
          :avatar="siteStore.avatar"
          :social="siteStore.social"
        />
      </slot>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <slot />
    </main>

    <!-- Right Sidebar -->
    <aside v-if="showRightSidebar" class="right-sidebar">
      <slot name="right-sidebar" />
    </aside>
  </div>
</template>

<script setup lang="ts">
import { useSiteStore } from '@/stores/site'
import Sidebar from './Sidebar.vue'

interface Props {
  showLeftSidebar?: boolean
  showRightSidebar?: boolean
}

withDefaults(defineProps<Props>(), {
  showLeftSidebar: true,
  showRightSidebar: true
})

const siteStore = useSiteStore()
</script>

<style scoped>
.main-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 100vh;
  background: var(--bg-page);
}

.left-sidebar {
  position: sticky;
  top: 2rem;
  height: fit-content;
  max-height: calc(100vh - 4rem);
  overflow-y: auto;
}

.main-content {
  min-width: 0;
}

.right-sidebar {
  display: none;
}

/* Responsive Design */
@media (min-width: 1400px) {
  .main-layout {
    grid-template-columns: 280px 1fr 280px;
  }

  .right-sidebar {
    display: flex;
    position: sticky;
    top: 2rem;
    height: fit-content;
    max-height: calc(100vh - 4rem);
    overflow-y: auto;
    flex-direction: column;
    gap: 1.5rem;
  }
}

@media (max-width: 1024px) {
  .main-layout {
    grid-template-columns: 1fr;
    padding: 1rem;
    gap: 1.5rem;
  }

  .left-sidebar {
    position: static;
    max-height: none;
  }
}

:root {
  --bg-page: #f8fafc;
}

.dark {
  --bg-page: #0f172a;
}
</style>
