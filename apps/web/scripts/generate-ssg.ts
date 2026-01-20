import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { extractBlogsFromDir } from '@rika/shared/blog'

const __dirname = dirname(fileURLToPath(import.meta.url))
const WEB_DIR = resolve(__dirname, '..')
const ROOT_DIR = resolve(WEB_DIR, '../..')
const BLOG_DIR = resolve(ROOT_DIR, 'blog')
const DIST_DIR = resolve(WEB_DIR, 'dist')
const PUBLIC_DIR = resolve(WEB_DIR, 'public')

interface BlogRoute {
  slug: string
  title: string
  content: string
  html: string
}

// Template for blog post HTML
function generateBlogPostHTML(blog: any, toc: any[], renderedContent: string): string {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const tagsHtml = blog.tags.map((tag: string) => `#${tag}`).join(' ')

  const tocHtml = toc.map(item => `
    <li style="margin-left: ${(item.level - 1) * 0.75}rem">
      <a href="#${item.id}" class="toc-link">${item.title}</a>
    </li>
  `).join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${blog.title} | My Blog</title>
  <meta name="description" content="${blog.desc}">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {}
      }
    }
  </script>
  <link rel="stylesheet" href="/https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.10.0/build/styles/github-dark.min.css">
  <style>
    .prose { max-width: 65ch; }
    .prose pre { background: #1e293b; border-radius: 0.5rem; padding: 1rem; overflow-x: auto; }
    .prose pre code { background: transparent; padding: 0; color: #e2e8f0; }
    .prose code { background: #f1f5f9; padding: 0.125rem 0.375rem; border-radius: 0.25rem; font-size: 0.875rem; }
    .dark .prose code { background: #334155; }
    .prose h2[id], .prose h3[id], .prose h4[id] { scroll-margin-top: 5rem; }
    .toc-link { color: #64748b; text-decoration: none; display: block; padding: 0.25rem 0; }
    .toc-link:hover { color: #0f172a; }
    .dark .toc-link { color: #94a3b8; }
    .dark .toc-link:hover { color: #f1f5f9; }
  </style>
</head>
<body class="bg-white dark:bg-slate-950">
  <!-- Header -->
  <header class="border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur z-10">
    <div class="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
      <a href="/" class="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
      </a>
      <button id="themeToggle" class="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800">
        <svg id="sunIcon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 hidden dark:block">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
        </svg>
        <svg id="moonIcon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 block dark:hidden">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
        </svg>
      </button>
    </div>
  </header>

  <!-- Main Content -->
  <main class="max-w-4xl mx-auto px-6 py-12">
    <article class="grid grid-cols-1 lg:grid-cols-[1fr,240px] gap-12">
      <!-- Content -->
      <div class="min-w-0">
        <header class="mb-12">
          <h1 class="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            ${blog.title}
          </h1>
          <div class="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
            <time datetime="${blog.createdAt}">
              ${formatDate(blog.createdAt)}
            </time>
            ${blog.tags.length > 0 ? `<span class="flex items-center gap-2">·<span>${tagsHtml}</span></span>` : ''}
          </div>
        </header>

        <div class="prose prose-slate dark:prose-invert max-w-none">
          ${renderedContent}
        </div>
      </div>

      <!-- TOC Sidebar -->
      <aside class="hidden lg:block relative">
        <div class="sticky top-24">
          <h3 class="text-sm font-semibold mb-3 text-slate-900 dark:text-slate-100">目录</h3>
          <ul class="space-y-2 text-sm">
            ${tocHtml}
          </ul>
        </div>
      </aside>
    </article>
  </main>

  <!-- Footer -->
  <footer class="border-t border-slate-200 dark:border-slate-800 mt-20">
    <div class="max-w-4xl mx-auto px-6 py-8 text-center text-sm text-slate-600 dark:text-slate-400">
      <p>&copy; ${new Date().getFullYear()} My Blog. All rights reserved.</p>
    </div>
  </footer>

  <script>
    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;

    // Load saved theme
    if (localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }

    themeToggle.addEventListener('click', () => {
      html.classList.toggle('dark');
      localStorage.setItem('theme', html.classList.contains('dark') ? 'dark' : 'light');
    });

    // Smooth scroll for TOC links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  </script>
</body>
</html>`
}

// Template for home page HTML
function generateHomeHTML(blogs: any[]): string {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const blogListHtml = blogs.map(blog => {
    const tagsHtml = blog.tags.map((tag: string) => `#${tag}`).join(' ')
    return `
      <article class="group">
        <a href="/blog/${blog.slug}" class="block">
          <h2 class="text-2xl font-semibold text-slate-900 dark:text-slate-100 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
            ${blog.title}
          </h2>
          <p class="mt-3 text-slate-600 dark:text-slate-400 leading-relaxed">
            ${blog.desc}
          </p>
          <div class="mt-4 flex items-center gap-4 text-sm text-slate-500 dark:text-slate-500">
            <time datetime="${blog.createdAt}">
              ${formatDate(blog.createdAt)}
            </time>
            ${blog.tags.length > 0 ? `<span class="flex items-center gap-2"><span>·</span><span class="text-slate-600 dark:text-slate-400">${tagsHtml}</span></span>` : ''}
          </div>
        </a>
      </article>
    `
  }).join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Blog</title>
  <meta name="description" content="A simple, modern blog for developers">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {}
      }
    }
  </script>
</head>
<body class="bg-white dark:bg-slate-950">
  <!-- Header -->
  <header class="border-b border-slate-200 dark:border-slate-800">
    <div class="max-w-4xl mx-auto px-6 py-8 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-slate-900 dark:text-slate-100">My Blog</h1>
        <p class="mt-2 text-slate-600 dark:text-slate-400">A simple, modern blog for developers</p>
      </div>
      <button id="themeToggle" class="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800">
        <svg id="sunIcon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 hidden dark:block">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
        </svg>
        <svg id="moonIcon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 block dark:hidden">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
        </svg>
      </button>
    </div>
  </header>

  <!-- Main Content -->
  <main class="max-w-4xl mx-auto px-6 py-12">
    <div class="space-y-12">
      ${blogListHtml}
    </div>
  </main>

  <!-- Footer -->
  <footer class="border-t border-slate-200 dark:border-slate-800 mt-20">
    <div class="max-w-4xl mx-auto px-6 py-8 text-center text-sm text-slate-600 dark:text-slate-400">
      <p>&copy; ${new Date().getFullYear()} My Blog. All rights reserved.</p>
    </div>
  </footer>

  <script>
    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;

    if (localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }

    themeToggle.addEventListener('click', () => {
      html.classList.toggle('dark');
      localStorage.setItem('theme', html.classList.contains('dark') ? 'dark' : 'light');
    });
  </script>
</body>
</html>`
}

// Simple markdown renderer (basic implementation)
function renderMarkdown(content: string): string {
  let html = content

  // Code blocks
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    const language = lang || 'text'
    return `<pre><code class="language-${language}">${escapeHtml(code.trim())}</code></pre>`
  })

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3 id="$1">$1</h3>')
  html = html.replace(/^## (.*$)/gim, '<h2 id="$1">$1</h2>')
  html = html.replace(/^# (.*$)/gim, '<h1 id="$1">$1</h1>')

  // Bold and italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')

  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')

  // Line breaks and paragraphs
  html = html.replace(/\n\n/g, '</p><p>')
  html = html.replace(/\n/g, '<br>')
  html = '<p>' + html + '</p>'

  // Lists
  html = html.replace(/<p>- (.*?)<\/p>/g, '<li>$1</li>')
  html = html.replace(/(<li>.*?<\/li>)/s, '<ul>$1</ul>')

  return html
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}

function extractTOC(content: string): Array<{ id: string; level: number; title: string }> {
  const toc: Array<{ id: string; level: number; title: string }> = []
  const lines = content.split('\n')

  lines.forEach((line) => {
    const match = line.match(/^(#{1,4})\s+(.+)$/)
    if (match) {
      const level = match[1].length
      const title = match[2].replace(/[*_`#]/g, '').trim()
      const id = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      toc.push({ id, level, title })
    }
  })

  return toc
}

async function generateSSG() {
  console.log('🚀 Generating static site...')

  try {
    // Read all blogs
    console.log('📂 Reading blog posts...')
    const blogs = await extractBlogsFromDir(BLOG_DIR)

    // Sort by date descending
    blogs.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    console.log(`✅ Found ${blogs.length} blog posts`)

    // Clean and create dist directory
    await mkdir(DIST_DIR, { recursive: true })

    // Generate home page
    console.log('📄 Generating home page...')
    const homeHTML = generateHomeHTML(blogs)
    await writeFile(join(DIST_DIR, 'index.html'), homeHTML, 'utf-8')
    console.log('✅ Home page generated')

    // Generate blog post pages
    console.log('📝 Generating blog post pages...')
    const blogDir = join(DIST_DIR, 'blog')
    await mkdir(blogDir, { recursive: true })

    for (const blog of blogs) {
      const toc = extractTOC(blog.content)
      const renderedContent = renderMarkdown(blog.content)
      const html = generateBlogPostHTML(blog, toc, renderedContent)

      const filePath = join(blogDir, `${blog.slug}.html`)
      await writeFile(filePath, html, 'utf-8')
      console.log(`  ✅ ${blog.slug}.html`)
    }

    // Copy public files
    console.log('📁 Copying public files...')
    // You can add logic here to copy images, fonts, etc.

    console.log('\n✨ Static site generation complete!')
    console.log(`📂 Output: ${DIST_DIR}`)
    console.log(`\nGenerated files:`)
    console.log(`  - index.html (home page with ${blogs.length} posts)`)
    console.log(`  - blog/*.html (${blogs.length} blog posts)`)
  } catch (error) {
    console.error('❌ Error generating static site:', error)
    process.exit(1)
  }
}

generateSSG()
