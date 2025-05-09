import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        isLoggedIn: false,
        accessToken: null,
    }),
    actions: {
        login(token) {
        this.accessToken = token
        this.isLoggedIn = true
        },
        logout() {
        this.accessToken = null
        this.isLoggedIn = false
        },
    },
    persist: [
    {
        paths: ["auth"],
        storage: localStorage,
        },
    ],
})
