// src/libs/axios.js
import axios from 'axios'
import router from '@/router'
import { useAuthStore } from '@/stores/auth' 

const instance = axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
})

// 요청 인터셉터: 로그인 상태면 Authorization 자동 추가
instance.interceptors.request.use((config) => {
    const authData = localStorage.getItem('auth');
    let token = null;

    if (authData) {
    try {
        const parsed = JSON.parse(authData);
        token = parsed.accessToken;
    } catch (e) {
        console.error('auth 파싱 실패:', e);
    }
    }
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// 응답 인터셉터: 403 에러 받으면 (access token이 유효하지 않다고 하면,)
// 토큰 재발급으로 요청
instance.interceptors.response.use(
    response => response,
    async error => {
        const authStore = useAuthStore()
        const originalRequest = error.config

        if (error.response) {
        const status = error.response.status
        const serverMessage = error.response.data?.message || ''

        // access token 만료 (403) 처리
        if (status === 403 && !originalRequest._retry) {
            try {
            originalRequest._retry = true
            const res = await axios.post('http://localhost:8080/auth/refresh-token', null, {
                withCredentials: true
            })

            const newAccessToken = res.data.accessToken
            authStore.login(newAccessToken, authStore.role)

            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
            return instance(originalRequest)
            } catch (refreshErr) {
            alert('세션이 만료되었습니다. 다시 로그인해주세요.')
            authStore.logout()
            router.replace('/login') // router.push랑 다름
            return Promise.reject(refreshErr)
            }
        }

        // 기타 인증 실패
        if (status === 401) {
            alert(serverMessage || '접근이 허용되지 않았습니다.')
            router.push('/')
        }
        }

        return Promise.reject(error)
    }
)


export default instance
