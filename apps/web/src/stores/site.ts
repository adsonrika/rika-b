import { defineStore } from 'pinia'
import { computed } from 'vue'
import siteConfig from '@/config/site'
import type { SiteConfig, SocialLink, SiteMetadata } from '@/config/site'

// Re-export types for convenience
export type { SiteConfig, SocialLink, SiteMetadata }

export const useSiteStore = defineStore('site', () => {
  // Use the imported site config (includes env var overrides)
  const config = computed(() => siteConfig)

  // Get specific config values (computed for reactivity)
  const author = computed(() => siteConfig.author)
  const bio = computed(() => siteConfig.bio)
  const avatar = computed(() => siteConfig.avatar)
  const social = computed(() => siteConfig.social || [])
  const metadata = computed(() => siteConfig.metadata)

  return {
    config,
    author,
    bio,
    avatar,
    social,
    metadata
  }
})
