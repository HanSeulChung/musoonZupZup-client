import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/pages/HomePage.vue' 
import RegisterPage from '@/pages/regist/RegisterPage.vue' 
import LoginPage from '@/pages/login/LoginPage.vue' 
import MyPage from '@/pages/mypage/MyPage.vue'
import UserListPage from '@/pages/user-list/UserListPage.vue' 
import ApplyHomePage from '@/pages/apply-home/ApplyHomePage.vue' 
import ApplyHomeDetail from '@/pages/apply-home//ApplyHomeDetailPage.vue' 
import CommunityList from '@/pages/community/CommunityListPage.vue' 
import CommunityDetail from '@/pages/community/CommunityDetailPage.vue'
import CommunityCreate from '@/pages/community/CommunityCreatePage.vue'
import CommunityEdit from '@/pages/community/CommunityEditPage.vue'
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
    meta: { requiresAuth: true }
  },
  { 
    path: '/admin/members', 
    name: 'UserListPage',
    component: UserListPage,
    meta: { requiresAuth: true, roles: ['ADMIN', 'MASTER'] }
  },
  { 
    path: '/apply-homes', 
    name: 'ApplyHomePage',
    component: ApplyHomePage,
  },
  { 
    path: '/apply-homes/:id', 
    name: 'ApplyHomeDetail',
    component: ApplyHomeDetail,
  },
  { 
    path: '/communities', 
    name: 'CommunityList',
    component: CommunityList,
  },
  { 
    path: '/communities/:id', 
    name: 'CommunityDetail',
    component: CommunityDetail,
  },
  { 
    path: '/communities/create', 
    name: 'CommunityCreate',
    component: CommunityCreate,
  },
  {
    path: '/communities/edit/:id',
    name: 'CommunityEdit',
    component: CommunityEdit,
  }
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
  const userRole = authStore.role

    if (to.meta.requiresAuth && !isLoggedIn) {
    alert('로그인이 필요합니다.')
    return next('/login')
  }

  if (to.meta.requiresUnauth && isLoggedIn) {
    alert('이미 로그인되어 있습니다. 진행하려면 로그아웃 후 다시 시도해주세요.')
    return next('/')
  }

  if (to.meta.roles && !to.meta.roles.includes(userRole)) {
    alert('접근 권한이 없습니다.')
    return next('/')
  }

  next()
})

export default router