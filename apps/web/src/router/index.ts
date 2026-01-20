import type { RouteRecordRaw } from 'vue-router'

// 基础路由
export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: 'Home' },
  },
  {
    path: '/blog/:slug',
    name: 'BlogPost',
    component: () => import('@/views/BlogPost.vue'),
    meta: { title: 'Blog Post' },
  },
  {
    path: '/archives',
    name: 'Archives',
    component: () => import('@/views/Archives.vue'),
    meta: { title: 'Archives' },
  },
  {
    path: '/tag/:tag',
    name: 'Tag',
    component: () => import('@/views/Tag.vue'),
    meta: { title: 'Tag' },
  },
]
