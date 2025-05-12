import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
    const isLoggedIn = ref(false)
    const accessToken = ref(null)
    const role = ref(null)

    function login(token, userRole) {
        accessToken.value = token
        isLoggedIn.value = true
        role.value = userRole
    }

    function logout() {
        accessToken.value = null
        isLoggedIn.value = false
        role.value = null
    }

    return {
        isLoggedIn,
        accessToken,
        role,
        login,
        logout
    }
    }, {
    persist: {
        paths: ['accessToken', 'isLoggedIn', 'role'],
        storage: localStorage
    }
})
