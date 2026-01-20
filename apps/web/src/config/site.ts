// Site configuration
// This file contains all site-wide settings that can be customized

interface SiteConfig {
  author: string
  bio: string
  avatar?: string
  social?: SocialLink[]
  metadata?: SiteMetadata
}

interface SocialLink {
  name: string
  url: string
  icon: string
}

interface SiteMetadata {
  title?: string
  description?: string
  keywords?: string[]
  ogImage?: string
  twitterHandle?: string
}

// Default site configuration
// Environment variables override these values
const siteConfig: SiteConfig = {
  author: import.meta.env.VITE_SITE_AUTHOR || 'Your Name',
  bio: import.meta.env.VITE_SITE_BIO || 'A simple blog for developers',
  avatar: import.meta.env.VITE_SITE_AVATAR || '/avatar.png',
  social: [
    {
      name: 'GitHub',
      url: import.meta.env.VITE_GITHUB_URL || 'https://github.com',
      icon: 'github'
    },
    {
      name: 'Twitter',
      url: import.meta.env.VITE_TWITTER_URL || 'https://twitter.com',
      icon: 'twitter'
    },
    ...(import.meta.env.VITE_SITE_EMAIL ? [{
      name: 'Email',
      url: `mailto:${import.meta.env.VITE_SITE_EMAIL}`,
      icon: 'email'
    }] : [])
  ].filter(Boolean),
  metadata: {
    title: import.meta.env.VITE_SITE_TITLE,
    description: import.meta.env.VITE_SITE_DESCRIPTION,
    keywords: import.meta.env.VITE_SITE_KEYWORDS?.split(','),
    ogImage: import.meta.env.VITE_SITE_OG_IMAGE,
    twitterHandle: import.meta.env.VITE_TWITTER_HANDLE
  }
}

export default siteConfig
export type { SiteConfig, SocialLink, SiteMetadata }
