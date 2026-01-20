# Understanding Vue 3 Composition API

<p hidden>
tags: vue, frontend, tutorial
desc: A deep dive into Vue 3's Composition API and how it compares to the Options API.
</p>

Vue 3 introduced the Composition API, a new way to organize component logic that offers better TypeScript support and more flexible code reuse.

## What is the Composition API?

The Composition API is a set of APIs that allows you to use Vue's features outside of a component, such as:

- Reactive state (`ref`, `reactive`)
- Computed properties
- Lifecycle hooks
- Dependency injection

## Basic Example

```javascript
import { ref, computed } from 'vue'

export default {
  setup() {
    const count = ref(0)
    const doubled = computed(() => count.value * 2)

    function increment() {
      count.value++
    }

    return { count, doubled, increment }
  }
}
```

## With `<script setup>`

Vue 3.1+ provides an even more concise syntax:

```vue
<script setup>
import { ref, computed } from 'vue'

const count = ref(0)
const doubled = computed(() => count.value * 2)

function increment() {
  count.value++
}
</script>

<template>
  <div>
    <p>Count: {{ count }}</p>
    <p>Doubled: {{ doubled }}</p>
    <button @click="increment">Increment</button>
  </div>
</template>
```

## Benefits

1. **Better Logic Organization**: Group related code together
2. **Improved Type Inference**: Better TypeScript support
3. **More Flexible Code Reuse**: Composables instead of mixins
4. **Smaller Bundle Size**: Tree-shaking friendly

## Creating a Composable

```javascript
// useMouse.js
import { ref, onMounted, onUnmounted } from 'vue'

export function useMouse() {
  const x = ref(0)
  const y = ref(0)

  function update(event) {
    x.value = event.pageX
    y.value = event.pageY
  }

  onMounted(() => window.addEventListener('mousemove', update))
  onUnmounted(() => window.removeEventListener('mousemove', update))

  return { x, y }
}
```

## Conclusion

The Composition API is a powerful addition to Vue 3 that provides more flexibility and better code organization. While the Options API is still fully supported, the Composition API is recommended for new projects.

## Further Reading

- [Vue 3 Documentation](https://vuejs.org/)
- [Composition API RFC](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0013-composition-api.md)
- [VueUse](https://vueuse.org/) - A collection of Vue Composition Utilities
