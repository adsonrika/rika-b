import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import anchor from 'markdown-it-anchor'

// Slugify function compatible with both render and extractTOC
function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with dashes
    .replace(/-+/g, '-') // Replace multiple dashes with single dash
}

// Configure markdown-it
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: (str: string, lang: string): string => {
    let highlighted: string
    let language = lang || 'text'

    if (lang && hljs.getLanguage(lang)) {
      try {
        highlighted = hljs.highlight(str, { language: lang }).value
      } catch (__) {
        highlighted = md.utils.escapeHtml(str)
        language = 'text'
      }
    } else {
      highlighted = md.utils.escapeHtml(str)
    }

    const codeBlock = `<div class="code-block-wrapper" data-language="${language}">
      <div class="code-header">
        <span class="code-language">${language}</span>
        <button class="copy-button" title="Copy code">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.923.746-2.081 1.788M7.5 15.75h1.5m-1.5 0V9m9-9h1.5m0 0V9m-1.5 0L6.75 21h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25h-3.875a.75.75 0 0 1-.75-.75v0c0-.414.336-.75.75-.75h1.5a.75.75 0 0 1 .75.75v0c0 .414-.336.75-.75.75z" />
          </svg>
          <span class="copy-text">Copy</span>
        </button>
      </div>
      <pre class="hljs"><code>${highlighted}</code></pre>
    </div>`

    return codeBlock
  },
})

// Add anchor plugin for heading IDs
md.use(anchor, {
  level: [1, 2, 3, 4, 5, 6], // Add anchors to h1-h6
  slugify: slugify,
  permalink: anchor.permalink.linkInsideHeader({
    symbol: '',
    placement: 'before'
  })
})

export function renderMarkdown(content: string): string {
  return md.render(content)
}

export function extractTOC(content: string): Array<{
  id: string
  level: number
  title: string
}> {
  const tokens: any[] = md.parse(content, [])
  const toc: Array<{ id: string; level: number; title: string }> = []

  tokens.forEach((token: any) => {
    if (token.type === 'heading_open') {
      const level = parseInt(token.tag.slice(1))
      const nextToken = tokens[tokens.indexOf(token) + 1]
      if (nextToken && nextToken.type === 'inline') {
        const title = nextToken.content
        // Use the same slugify function to generate consistent IDs
        const id = slugify(title)
        toc.push({ id, level, title })
      }
    }
  })

  return toc
}
