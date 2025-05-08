import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/pages/HomePage.vue' 

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage,
  },
  // 추가 페이지도 여기에 등록 가능
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router