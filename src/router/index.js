import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/pages/HomePage.vue' 
import RegisterPage from '@/pages/RegisterPage.vue' 
import LoginPage from '@/pages/LoginPage.vue' 
import MyPage from '@/pages/MyPage.vue'
import UserListPage from '@/pages/UserListPage.vue' 

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
  },
  { 
    path: '/login', 
    name: 'Login',
    component: LoginPage,
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

export default router