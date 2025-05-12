import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/pages/HomePage.vue' 
import RegisterPage from '@/pages/RegisterPage.vue' 
import LoginPage from '@/pages/LoginPage.vue' 
import MyPage from '@/pages/MyPage.vue'
import UserListPage from '@/pages/UserListPage.vue' 
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage,
  },
  { 
    path: '/register', 
    name: 'Register',
    component: RegisterPage,
    meta: { requiresUnauth: true }
  },
  { 
    path: '/login', 
    name: 'Login',
    component: LoginPage,
    meta: { requiresUnauth: true }
  },
  { 
    path: '/mypage', 
    name: 'MyPage',
    component: MyPage,
  },
    { 
    path: '/admin/members', 
    name: 'UserListPage',
    component: UserListPage,
  },
  // 추가 페이지도 여기에 등록 가능
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// 전역 가드 (네비게이션 가드 중 일부)
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isLoggedIn = authStore.isLoggedIn

  if (to.meta.requiresAuth && !isLoggedIn) {
    alert('로그인이 필요합니다.')
    next('/login')
  } else if (to.meta.requiresUnauth && isLoggedIn) {
    alert('이미 로그인되어 있습니다. 진행하려면 로그아웃 후 다시 시도해주세요.')
    next('/')
  } else {
    next()
  }
})

export default router