import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export type Theme = 'light' | 'dark' | 'system'

export const useThemeStore = defineStore('theme', () => {
  // Current theme preference
  const theme = ref<Theme>((localStorage.getItem('theme') as Theme) || 'system')

  // Computed actual theme (respects system preference)
  const actualTheme = ref<'light' | 'dark'>(getActualTheme())

  // Watch theme changes
  watch(theme, () => {
    localStorage.setItem('theme', theme.value)
    updateActualTheme()
  })

  // Get actual theme based on preference
  function getActualTheme(): 'light' | 'dark' {
    if (typeof window === 'undefined') return 'light'

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    if (theme.value === 'system') {
      return prefersDark ? 'dark' : 'light'
    }
    return theme.value
  }

  // Update actual theme and apply to document
  function updateActualTheme() {
    actualTheme.value = getActualTheme()
    applyTheme()
  }

  // Apply theme to document
  function applyTheme() {
    if (typeof document === 'undefined') return

    const root = document.documentElement
    if (actualTheme.value === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }

  // Set theme
  function setTheme(newTheme: Theme) {
    theme.value = newTheme
  }

  // Toggle between light and dark
  function toggleTheme() {
    setTheme(actualTheme.value === 'dark' ? 'light' : 'dark')
  }

  // Listen for system theme changes (client-side only)
  if (typeof window !== 'undefined') {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (theme.value === 'system') {
        updateActualTheme()
      }
    })

    // Initialize theme on load
    applyTheme()
  }

  return {
    theme,
    actualTheme,
    setTheme,
    toggleTheme
  }
})
