import { ref } from 'vue'
import { defineStore } from 'pinia'
import api from '@/libs/axios'; 

export const useAuthStore = defineStore('auth', () => {
    const isLoggedIn = ref(false)
    const accessToken = ref(null)
    const role = ref(null)
    const memberId = ref(null);

    function login(token, userRole, userId) {
        accessToken.value = token
        isLoggedIn.value = true
        role.value = userRole
        memberId.value = userId
    }

    function logout() {
        accessToken.value = null
        isLoggedIn.value = false
        role.value = null
        memberId.value = null
    }

    const fetchProfile = async () => {
    try {
      const res = await api.get('/members/mypage');
      role.value = res.data.role || 'USER';
      isLoggedIn.value = true;
    } catch (err) {
      console.error('프로필 불러오기 실패:', err);
      // 로그인 상태는 유지
    }
  };

    return {
        isLoggedIn,
        accessToken,
        role,
        memberId,
        login,
        logout,
        fetchProfile
    }
    }, {
    persist: {
        storage: localStorage
    }
})
