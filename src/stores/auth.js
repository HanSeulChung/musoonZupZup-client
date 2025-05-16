import { ref } from 'vue'
import { defineStore } from 'pinia'

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

    return {
        isLoggedIn,
        accessToken,
        role,
        memberId,
        login,
        logout
    }
    }, {
    persist: {
        storage: localStorage
    }
})
