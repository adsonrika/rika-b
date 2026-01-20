# Site Configuration Guide

This project uses a centralized configuration system for site-wide settings.

## Configuration Methods

### 1. **Environment Variables** (Recommended for Deployment)

Create a `.env.local` file in `apps/web/`:

```bash
# Site Information
VITE_SITE_AUTHOR=Your Name
VITE_SITE_BIO=A simple blog for developers
VITE_SITE_AVATAR=/avatar.png

# Social Links
VITE_GITHUB_URL=https://github.com/yourusername
VITE_TWITTER_URL=https://twitter.com/yourusername
VITE_SITE_EMAIL=your.email@example.com

# Site Metadata (SEO)
VITE_SITE_TITLE=Your Blog Title
VITE_SITE_DESCRIPTION=A blog about web development
VITE_SITE_KEYWORDS=blog,development,programming
VITE_SITE_OG_IMAGE=/og-image.png
VITE_TWITTER_HANDLE=@yourusername
```

### 2. **Config File** (For Default Values)

Edit `apps/web/src/config/site.ts` directly:

```typescript
const siteConfig: SiteConfig = {
  author: 'Your Name',
  bio: 'A simple blog for developers',
  avatar: '/avatar.png',
  social: [
    {
      name: 'GitHub',
      url: 'https://github.com',
      icon: 'github'
    }
  ],
  metadata: {
    title: 'Your Blog Title',
    description: 'Your blog description',
    keywords: ['blog', 'development']
  }
}
```

## Available Configuration Options

### Site Info

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_SITE_AUTHOR` | Author name | "Your Name" |
| `VITE_SITE_BIO` | Short bio/description | "A simple blog for developers" |
| `VITE_SITE_AVATAR` | Avatar image path | "/avatar.png" |

### Social Links

| Variable | Description |
|----------|-------------|
| `VITE_GITHUB_URL` | GitHub profile URL |
| `VITE_TWITTER_URL` | Twitter/X profile URL |
| `VITE_SITE_EMAIL` | Contact email (mailto: link) |

### SEO Metadata

| Variable | Description |
|----------|-------------|
| `VITE_SITE_TITLE` | Site title |
| `VITE_SITE_DESCRIPTION` | Site description for SEO |
| `VITE_SITE_KEYWORDS` | Comma-separated keywords |
| `VITE_SITE_OG_IMAGE` | Open Graph image path |
| `VITE_TWITTER_HANDLE` | Twitter handle (without @) |

## Adding Custom Social Links

Edit `apps/web/src/config/site.ts` and add to the `social` array:

```typescript
social: [
  {
    name: 'LinkedIn',
    url: 'https://linkedin.com/in/yourprofile',
    icon: 'linkedin'
  }
]
```

You'll also need to add the SVG icon in `Sidebar.vue`.

## Using Site Config in Components

```vue
<script setup lang="ts">
import { useSiteStore } from '@/stores/site'

const siteStore = useSiteStore()
</script>

<template>
  <div>
    <h1>{{ siteStore.author }}</h1>
    <p>{{ siteStore.bio }}</p>
  </div>
</template>
```
