<script setup lang="ts">
import { logger } from '@rika/shared/logger';

const log = logger(__SOURCE_FILE__);
log.info('App.vue');
</script>

<template>
  <router-view />
</template>

<style>
/* Base styles */
@import './style.css';

/* Dark mode support */
@dark default {
  color-scheme: dark;
}
</style>
