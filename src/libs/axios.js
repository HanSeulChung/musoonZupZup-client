// src/libs/axios.js
import axios from 'axios'
import router from '@/router' 

const instance = axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
})

instance.interceptors.response.use(
    response => response,
    error => {
        if (error.response) {
            if (error.response.status === 403) {
                alert('인증 요청을 너무 자주 보내셨습니다. 잠시 후 다시 시도해주세요.')
                router.push('/') // 또는 다른 페이지로 안내
            } else {
                alert('알 수 없는 오류가 발생했습니다. 다시 시도해주세요.')
            }
        }
        return Promise.reject(error)
    }
)

export default instance
