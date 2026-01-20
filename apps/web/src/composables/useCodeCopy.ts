import { onMounted, onUnmounted } from 'vue'

export function useCodeCopy() {
  let cleanup: (() => void) | null = null

  const handleCopyClick = async (event: Event) => {
    const target = event.target as HTMLElement
    const button = target.closest('.copy-button') as HTMLButtonElement

    if (!button) return

    const wrapper = button.closest('.code-block-wrapper')
    if (!wrapper) return

    const code = wrapper.querySelector('code')
    if (!code) return

    try {
      await navigator.clipboard.writeText(code.textContent || '')

      // Update button state
      const copyText = button.querySelector('.copy-text')
      if (copyText) {
        copyText.textContent = 'Copied!'
      }
      button.classList.add('copied')

      // Reset after 2 seconds
      setTimeout(() => {
        if (copyText) {
          copyText.textContent = 'Copy'
        }
        button.classList.remove('copied')
      }, 2000)
    } catch (err) {
      console.error('Failed to copy code:', err)
    }
  }

  onMounted(() => {
    // Use event delegation on the document
    document.addEventListener('click', handleCopyClick)

    cleanup = () => {
      document.removeEventListener('click', handleCopyClick)
    }
  })

  onUnmounted(() => {
    if (cleanup) {
      cleanup()
    }
  })
}
