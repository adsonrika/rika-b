/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Site Information
  readonly VITE_SITE_AUTHOR?: string
  readonly VITE_SITE_BIO?: string
  readonly VITE_SITE_AVATAR?: string

  // Social Links
  readonly VITE_GITHUB_URL?: string
  readonly VITE_TWITTER_URL?: string
  readonly VITE_SITE_EMAIL?: string

  // Site Metadata (SEO)
  readonly VITE_SITE_TITLE?: string
  readonly VITE_SITE_DESCRIPTION?: string
  readonly VITE_SITE_KEYWORDS?: string
  readonly VITE_SITE_OG_IMAGE?: string
  readonly VITE_TWITTER_HANDLE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
