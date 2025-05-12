import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
    const isLoggedIn = ref(false)
    const accessToken = ref(null)

    function login(token) {
        accessToken.value = token
        isLoggedIn.value = true
    }

    function logout() {
        accessToken.value = null
        isLoggedIn.value = false
    }

    return {
        isLoggedIn,
        accessToken,
        login,
        logout
    }
    }, {
    persist: {
        paths: ['accessToken', 'isLoggedIn'],
        storage: localStorage
    }
})
