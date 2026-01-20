import { ref, watch, onMounted } from 'vue'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'blog-theme'

// Initialize theme to 'light' by default (for SSR)
const theme = ref<Theme>('light')

// Apply theme to document
const applyTheme = (newTheme: Theme) => {
  if (typeof document !== 'undefined') {
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }
}

// Get theme from localStorage (client-side only)
const getStoredTheme = (): Theme | null => {
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem(STORAGE_KEY) as Theme | null
  }
  return null
}

// Set theme to localStorage (client-side only)
const setStoredTheme = (newTheme: Theme) => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, newTheme)
  }
}

// Initialize theme on client-side
onMounted(() => {
  const storedTheme = getStoredTheme()
  if (storedTheme) {
    theme.value = storedTheme
  }
  applyTheme(theme.value)
})

// Watch for theme changes
watch(theme, (newTheme) => {
  applyTheme(newTheme)
  setStoredTheme(newTheme)
})

export function useTheme() {
  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  const setTheme = (newTheme: Theme) => {
    theme.value = newTheme
  }

  return {
    theme,
    toggleTheme,
    setTheme
  }
}
